const { join } = require('path');
const { config } = require('./wdio.shared.conf');

// ============
// Capabilities
// ============
// For all capabilities please check
// http://appium.io/docs/en/writing-running-appium/caps/#general-capabilities
config.capabilities = [
    {
        // The defaults you need to have in your config
        deviceName: 'iPhone X',
        platformName: 'iOS',
        platformVersion: '12.2',
        orientation: 'PORTRAIT',
        maxInstances: 1,
        // The path to the app
        app: join(process.cwd(), './apps/iOS-Simulator-NativeDemoApp-0.2.1.app.zip'),
        // Read the reset strategies very well, they differ per platform, see
        // http://appium.io/docs/en/writing-running-appium/other/reset-strategies/
        noReset: true,
        newCommandTimeout: 240,
    },
];

// ====================
// Specs
// ====================
config.specs = [ `${ process.cwd() }/__tests__/app_features/app.feature` ];

// ====================
// Appium Configuration
// ====================
// Default port for Appium
config.port = 4723;

exports.config = config;
