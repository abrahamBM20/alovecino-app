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
    let source = await driver.getPageSource();
    await fs.writeFile(path.join(evidenceDir, 'appium-page-source.xml'), source);
    assert.match(source, /AloVecino|Crear cuenta|Crear Cuenta|Correo|Contrase/i);
    await captureScreenshot(driver, '02-smoke-validated');

    await tapIfPresent(driver, 'Ir a inicio de sesion');
    await waitForSource(driver, /Correo electr[oó]nico|Contrase/i);
    source = await driver.getPageSource();
    await fs.writeFile(path.join(evidenceDir, 'appium-login-page-source.xml'), source);
    assert.match(source, /Correo electr[oó]nico/i);
    assert.match(source, /Contrase/i);
    assert.match(source, /Entrar/i);
    await captureScreenshot(driver, '03-login-screen');

    await driver.back();
    await waitForSource(driver, /Bienvenido|Crear cuenta/i);
    await tapIfPresent(driver, 'Ir a crear cuenta');
    await waitForSource(driver, /Crear cuenta|Tipo de usuario|Nombre completo/i);
    source = await driver.getPageSource();
    await fs.writeFile(path.join(evidenceDir, 'appium-register-page-source.xml'), source);
    assert.match(source, /Crear cuenta/i);
    assert.match(source, /Tipo de usuario/i);
    assert.match(source, /Nombre completo/i);
    await captureScreenshot(driver, '04-register-screen');

    if (process.env.APPIUM_LOGIN_EMAIL && process.env.APPIUM_LOGIN_PASSWORD) {
      await driver.back();
      await waitForSource(driver, /Bienvenido|Iniciar sesion/i);
      await tapIfPresent(driver, 'Ir a inicio de sesion');
      await waitForSource(driver, /Correo electr[oó]nico|Contrase/i);

      await setValueByLabel(driver, 'Correo electrónico', process.env.APPIUM_LOGIN_EMAIL);
      await setValueByLabel(driver, 'Contraseña', process.env.APPIUM_LOGIN_PASSWORD);
      await tapIfPresent(driver, 'Iniciar sesion');
      source = await waitForSource(driver, /Almacenes cercanos|Mis consultas|Abrir mapa de almacenes|Panel almacenero|Ver perfil del almacén|No hay almacenes activos/i);
      assert.match(source, /Almacenes cercanos|Panel almacenero|Ver perfil del almacén|No hay almacenes activos/i);
      await captureScreenshot(driver, '05-home-after-login');

      if (/Mis consultas|Abrir historial de consultas/i.test(source)) {
        await tapIfPresent(driver, 'Abrir historial de consultas');
        source = await waitForSource(driver, /Mis consultas|registradas|Sin consultas|Volver/i);
        assert.match(source, /Mis consultas|Sin consultas/i);
        await captureScreenshot(driver, '06-client-consultas-history');
      }

      if (/Panel almacenero|Ver perfil del almacén/i.test(source)) {
        await tapIfPresent(driver, 'Ver perfil del almacén');
        source = await waitForSource(driver, /Configuración|Dirección|Teléfono principal|Cerrar sesión/i);
        assert.match(source, /Configuración/i);
        await captureScreenshot(driver, '06-store-profile');
      }
    }
  } catch (error) {
    await captureScreenshot(driver, '99-failure');
    throw error;
  } finally {
    await driver.deleteSession();
  }
}

async function setValueByLabel(driver, accessibilityLabel, value) {
  const element = await driver.$(`~${accessibilityLabel}`);

  await element.waitForDisplayed({ timeout: 15000 });
  await element.setValue(value);
}

async function tapIfPresent(driver, accessibilityLabel) {
  const selector = `~${accessibilityLabel}`;
  const element = await driver.$(selector);

  await element.waitForDisplayed({ timeout: 15000 });
  await element.click();
}

async function waitForSource(driver, pattern) {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const source = await driver.getPageSource();
    if (pattern.test(source)) {
      return source;
    }

    await driver.pause(1000);
  }

  const source = await driver.getPageSource();
  assert.match(source, pattern);
  return source;
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
