const baseConfig = require('./karma.config.base.js');

module.exports = function (config) {
    baseConfig.logLevel = config.LOG_INFO;
    baseConfig.autoWatch = false;
    baseConfig.singleRun = true;
    config.set(baseConfig);
};