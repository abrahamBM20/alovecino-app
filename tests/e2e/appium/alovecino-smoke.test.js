const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { remote } = require('webdriverio');

const appPath = process.env.APPIUM_APP_PATH;
assert.ok(appPath, 'APPIUM_APP_PATH must point to an Android APK');
const evidenceDir = process.env.QA_EVIDENCE_DIR || 'qa-evidence';

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
  'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION,
  'appium:app': appPath,
  'appium:appPackage': 'com.alovecino.app.qa',
  'appium:appActivity': 'com.alovecino.app.qa.MainActivity',
  'appium:appWaitActivity': '*',
  'appium:autoGrantPermissions': true,
  'appium:disableWindowAnimation': true,
  'appium:ignoreHiddenApiPolicyError': true,
  'appium:skipDeviceInitialization': true,
  'appium:skipUnlock': true,
  'appium:newCommandTimeout': 180,
  'appium:adbExecTimeout': 120000,
  'appium:androidInstallTimeout': 240000,
  'appium:appWaitDuration': 120000,
  'appium:uiautomator2ServerInstallTimeout': 120000,
  'appium:uiautomator2ServerLaunchTimeout': 120000,
};

Object.keys(capabilities).forEach((key) => {
  if (capabilities[key] === undefined || capabilities[key] === '') {
    delete capabilities[key];
  }
});

async function main() {
  await waitForAppium();
  await fs.mkdir(evidenceDir, { recursive: true });

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
    await captureScreenshot(driver, '01-app-launched');
    const source = await driver.getPageSource();
    await fs.writeFile(path.join(evidenceDir, 'appium-page-source.xml'), source);
    assert.match(source, /AloVecino|Crear Cuenta|Correo|Contrase/i);
    await captureScreenshot(driver, '02-smoke-validated');
  } catch (error) {
    await captureScreenshot(driver, '99-failure');
    throw error;
  } finally {
    await driver.deleteSession();
  }
}

async function captureScreenshot(driver, name) {
  const screenshotPath = path.join(evidenceDir, `${name}.png`);

  try {
    await driver.saveScreenshot(screenshotPath);
    console.log(`Saved Appium screenshot: ${screenshotPath}`);
  } catch (error) {
    console.warn(`Could not save Appium screenshot ${screenshotPath}: ${error.message}`);
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
