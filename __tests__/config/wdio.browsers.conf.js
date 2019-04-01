const { config } = require('./wdio.shared.conf')

config.capabilities = [
    {
        maxInstances: 5,
        browserName: 'chrome',
        chromeOptions: {
            args: [ '--headless', 'disable-infobars' ],
            prefs: {
                download: {
                    prompt_for_download: false,
                    directory_upgrade: true,
                    default_directory: './tmp',
                },
            },
        },
        metadata: {
            browser: {
                name: 'chrome',
                version: '58'
            },
            device: 'MacBook Pro 15',
            platform: {
                name: 'OSX',
                version: '10.12.6'
            }
        },
    },
    // {
    //     maxInstances: 5,
    //     browserName: 'firefox',
    //     'moz:firefoxOptions': {
    //         args: ['-headless']
    //     }
    // },
];

exports.config = config;
