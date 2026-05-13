param(
    [string]$Repo = "abrahamBM20/alovecino-app",
    [string]$Region = "us-east-1",
    [string]$InstanceType = "t3.micro",
    [string]$Name = "alovecino-prod",
    [string]$KeyName = "alovecino-prod-github-actions",
    [string]$AllowedSshCidr = "",
    [string]$SubnetId = "",
    [int]$VolumeSizeGb = 8
)

$ErrorActionPreference = "Stop"

function Assert-Command($Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Command '$Name' is not available in PATH."
    }
}

function Read-PlainSecret($Prompt) {
    $secure = Read-Host $Prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

Assert-Command aws
Assert-Command gh

aws sts get-caller-identity --region $Region | Out-Host
if ($LASTEXITCODE -ne 0) {
    throw "AWS CLI is not authenticated. Run: aws configure or aws login"
}

gh auth status | Out-Host
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login -h github.com"
}

if ([string]::IsNullOrWhiteSpace($AllowedSshCidr)) {
    $AllowedSshCidr = Read-Host "Allowed SSH CIDR, for example your.ip.address/32"
}

if ([string]::IsNullOrWhiteSpace($AllowedSshCidr)) {
    throw "AllowedSshCidr is required. Avoid opening SSH to 0.0.0.0/0."
}

$vpcId = aws ec2 describe-vpcs `
    --region $Region `
    --filters Name=is-default,Values=true `
    --query "Vpcs[0].VpcId" `
    --output text
$vpcId = ($vpcId | Select-Object -First 1).Trim()

if ([string]::IsNullOrWhiteSpace($vpcId) -or $vpcId -eq "None") {
    throw "No default VPC found in $Region."
}

if ([string]::IsNullOrWhiteSpace($SubnetId)) {
    $subnetId = aws ec2 describe-subnets `
        --region $Region `
        --filters Name=vpc-id,Values=$vpcId `
        --query "sort_by(Subnets, &AvailabilityZone)[0].SubnetId" `
        --output text
    $subnetId = ($subnetId | Select-Object -First 1).Trim()
}
else {
    $subnetId = $SubnetId
}

if ([string]::IsNullOrWhiteSpace($subnetId) -or $subnetId -eq "None") {
    throw "No default subnet found in $Region."
}

$sgName = "$Name-sg"
$existingSg = aws ec2 describe-security-groups `
    --region $Region `
    --filters Name=group-name,Values=$sgName Name=vpc-id,Values=$vpcId `
    --query "SecurityGroups[0].GroupId" `
    --output text 2>$null

if ([string]::IsNullOrWhiteSpace($existingSg) -or $existingSg -eq "None") {
    $securityGroupId = aws ec2 create-security-group `
        --region $Region `
        --group-name $sgName `
        --description "AloVecino production EC2 security group" `
        --vpc-id $vpcId `
        --query "GroupId" `
        --output text
}
else {
    $securityGroupId = $existingSg
}

$permissions = @(
    @{ IpProtocol = "tcp"; FromPort = 22; ToPort = 22; IpRanges = @(@{ CidrIp = $AllowedSshCidr; Description = "SSH from operator" }) },
    @{ IpProtocol = "tcp"; FromPort = 80; ToPort = 80; IpRanges = @(@{ CidrIp = "0.0.0.0/0"; Description = "HTTP public API" }) },
    @{ IpProtocol = "tcp"; FromPort = 443; ToPort = 443; IpRanges = @(@{ CidrIp = "0.0.0.0/0"; Description = "HTTPS reserved for domain/TLS" }) }
)

$permissionsPath = New-TemporaryFile
try {
    $permissions | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $permissionsPath -Encoding UTF8
    aws ec2 authorize-security-group-ingress `
        --region $Region `
        --group-id $securityGroupId `
        --ip-permissions "file://$permissionsPath" 2>$null | Out-Null
}
finally {
    Remove-Item -LiteralPath $permissionsPath -Force
}

$keyPath = Join-Path (Get-Location) "$KeyName.pem"
$existingKey = aws ec2 describe-key-pairs `
    --region $Region `
    --key-names $KeyName `
    --query "KeyPairs[0].KeyName" `
    --output text 2>$null

if ([string]::IsNullOrWhiteSpace($existingKey) -or $existingKey -eq "None") {
    aws ec2 create-key-pair `
        --region $Region `
        --key-name $KeyName `
        --query "KeyMaterial" `
        --output text | Set-Content -LiteralPath $keyPath -Encoding ascii
}
elseif (-not (Test-Path -LiteralPath $keyPath)) {
    throw "Key pair $KeyName exists in AWS but $keyPath is missing. Use the existing private key or create a new KeyName."
}

$amiId = aws ssm get-parameter `
    --region $Region `
    --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 `
    --query "Parameter.Value" `
    --output text

$userDataPath = New-TemporaryFile
try {
    @"
#!/bin/bash
set -euxo pipefail
dnf update -y
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user
mkdir -p /usr/local/lib/docker/cli-plugins
curl --fail --location --show-error --silent \
  https://github.com/docker/compose/releases/download/v2.27.1/docker-compose-linux-x86_64 \
  --output /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
mkdir -p /opt/alovecino/prod/current
chown -R ec2-user:ec2-user /opt/alovecino
"@ | Set-Content -LiteralPath $userDataPath -Encoding ascii

    $instanceId = aws ec2 run-instances `
        --region $Region `
        --image-id $amiId `
        --instance-type $InstanceType `
        --key-name $KeyName `
        --security-group-ids $securityGroupId `
        --subnet-id $subnetId `
        --associate-public-ip-address `
        --block-device-mappings "DeviceName=/dev/xvda,Ebs={VolumeSize=$VolumeSizeGb,VolumeType=gp3,DeleteOnTermination=true}" `
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$Name},{Key=Application,Value=AloVecino},{Key=Environment,Value=prod},{Key=Jira,Value=AV-82-HU-24}]" `
        --user-data "file://$userDataPath" `
        --query "Instances[0].InstanceId" `
        --output text
}
finally {
    Remove-Item -LiteralPath $userDataPath -Force
}

aws ec2 wait instance-running --region $Region --instance-ids $instanceId

$publicHost = aws ec2 describe-instances `
    --region $Region `
    --instance-ids $instanceId `
    --query "Reservations[0].Instances[0].PublicDnsName" `
    --output text

$privateKey = Get-Content -LiteralPath $keyPath -Raw
$privateKey | gh secret set PROD_EC2_SSH_KEY --repo $Repo
"ec2-user" | gh secret set PROD_EC2_USER --repo $Repo
$publicHost | gh secret set PROD_EC2_HOST --repo $Repo
"http://$publicHost" | gh variable set PROD_API_BASE_URL --repo $Repo

Write-Host "EC2 production instance created."
Write-Host "InstanceId: $instanceId"
Write-Host "PublicHost: $publicHost"
Write-Host "Private key saved at: $keyPath"
Write-Host "GitHub secrets PROD_EC2_HOST, PROD_EC2_USER and PROD_EC2_SSH_KEY were updated."
