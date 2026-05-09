const assert = require('node:assert/strict');
const { remote } = require('webdriverio');

const appPath = process.env.APPIUM_APP_PATH;
assert.ok(appPath, 'APPIUM_APP_PATH must point to an Android APK');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
  'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION,
  'appium:app': appPath,
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 120,
};

Object.keys(capabilities).forEach((key) => {
  if (capabilities[key] === undefined || capabilities[key] === '') {
    delete capabilities[key];
  }
});

async function main() {
  const driver = await remote({
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: Number(process.env.APPIUM_PORT || 4723),
    path: '/',
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
