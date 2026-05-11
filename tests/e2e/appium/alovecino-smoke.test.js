const assert = require('node:assert/strict');
const { remote } = require('webdriverio');

const appPath = process.env.APPIUM_APP_PATH;
const preinstalledApp = process.env.APPIUM_PREINSTALLED_APP === 'true';

if (!preinstalledApp) {
  assert.ok(appPath, 'APPIUM_APP_PATH must point to an Android APK');
}

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
  'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION,
  'appium:app': preinstalledApp ? undefined : appPath,
  'appium:appPackage': 'com.alovecino.app.qa',
  'appium:appActivity': 'com.alovecino.app.qa.MainActivity',
  'appium:appWaitActivity': '*',
  'appium:noReset': preinstalledApp,
  'appium:autoGrantPermissions': true,
  'appium:disableWindowAnimation': true,
  'appium:ignoreHiddenApiPolicyError': true,
  'appium:skipDeviceInitialization': true,
  'appium:skipUnlock': true,
  'appium:newCommandTimeout': 180,
  'appium:adbExecTimeout': 300000,
  'appium:androidInstallTimeout': 300000,
  'appium:appWaitDuration': 180000,
  'appium:uiautomator2ServerInstallTimeout': 300000,
  'appium:uiautomator2ServerLaunchTimeout': 300000,
};

Object.keys(capabilities).forEach((key) => {
  if (capabilities[key] === undefined || capabilities[key] === '') {
    delete capabilities[key];
  }
});

async function main() {
  await waitForAppium();

  const driver = await remote({
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: Number(process.env.APPIUM_PORT || 4723),
    path: '/',
    connectionRetryCount: 2,
    connectionRetryTimeout: 300000,
    capabilities,
  });

  try {
    await driver.pause(5000);
    const source = await driver.getPageSource();
    assert.match(source, /AloVecino|Crear Cuenta|Correo|Contrase/i);
  } finally {
    await driver.deleteSession();
  }
}

async function waitForAppium() {
  const host = process.env.APPIUM_HOST || '127.0.0.1';
  const port = Number(process.env.APPIUM_PORT || 4723);
  const statusUrl = `http://${host}:${port}/status`;

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(statusUrl);
      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Appium can take a few seconds to bind the port in GitHub-hosted runners.
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Appium server did not become ready at ${statusUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
