// config files:
const defaultConfig = './config/config-default.js';
const overrideConfig = './config/config-override.js';
const testConfig = './config/config-test.js';
const yanhaiConfig = './config/config-yanhai.js';

const fs = require('fs');

let config = null;

if (process.env.NODE_ENV === 'test') {
    console.log(`Load ${testConfig}...`);
    config = require(testConfig);
} if (process.env.NODE_ENV === 'yanhai') {
    console.log(`Load ${yanhaiConfig}...`);
    config = require(yanhaiConfig);
 } else {
    console.log(`Load ${defaultConfig}...`);
    config = require(defaultConfig);
    try {
        if (fs.statSync(overrideConfig).isFile()) {
            console.log(`Load ${overrideConfig}...`);
            config = Object.assign(config, require(overrideConfig));
        }
    } catch (err) {
        console.log(`Cannot load ${overrideConfig}.`);
    }
}

module.exports = config;
