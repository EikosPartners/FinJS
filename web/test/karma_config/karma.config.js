const baseConfig = require('./karma.config.base.js');

module.exports = function (config) {
    baseConfig.logLevel = config.LOG_INFO;
    config.set(baseConfig);
};