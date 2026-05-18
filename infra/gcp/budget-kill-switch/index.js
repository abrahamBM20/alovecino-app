const functions = require('@google-cloud/functions-framework');
const { google } = require('googleapis');

const DEFAULT_SERVICES = [
  'geocoding-backend.googleapis.com',
  'maps-android-backend.googleapis.com',
];

function parseBudgetMessage(pubsubMessage) {
  const rawData = pubsubMessage.data
    ? Buffer.from(pubsubMessage.data, 'base64').toString('utf8')
    : '{}';

  try {
    return JSON.parse(rawData);
  } catch (error) {
    return JSON.parse(rawData.replace(/\\"/g, '"'));
  }
}

function servicesToDisable() {
  return (process.env.SERVICES_TO_DISABLE || DEFAULT_SERVICES.join(','))
    .split(',')
    .map((service) => service.trim())
    .filter(Boolean);
}

async function disableService(serviceusage, projectId, serviceName) {
  const name = `projects/${projectId}/services/${serviceName}`;
  await serviceusage.services.disable({
    name,
    requestBody: {
      disableDependentServices: false,
    },
  });
}

functions.cloudEvent('budgetKillSwitch', async (cloudEvent) => {
  const projectId = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const disableAtPercent = Number(process.env.DISABLE_AT_PERCENT || '1');
  const payload = parseBudgetMessage(cloudEvent.data.message || {});
  const threshold = Number(payload.alertThresholdExceeded || 0);

  console.log('Budget notification received', {
    budgetDisplayName: payload.budgetDisplayName,
    alertThresholdExceeded: threshold,
    costAmount: payload.costAmount,
    budgetAmount: payload.budgetAmount,
    currencyCode: payload.currencyCode,
  });

  if (!projectId) {
    throw new Error('PROJECT_ID or GOOGLE_CLOUD_PROJECT is required');
  }

  if (threshold < disableAtPercent) {
    console.log(`Threshold ${threshold} is below ${disableAtPercent}; no action taken.`);
    return;
  }

  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const serviceusage = google.serviceusage({ version: 'v1', auth });
  const results = [];

  for (const serviceName of servicesToDisable()) {
    try {
      await disableService(serviceusage, projectId, serviceName);
      results.push({ serviceName, status: 'disable_requested' });
    } catch (error) {
      results.push({ serviceName, status: 'error', message: error.message });
      console.error(`Could not disable ${serviceName}`, error);
    }
  }

  console.log('Kill switch result', results);
});
