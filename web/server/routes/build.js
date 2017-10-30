var express = require('express');
var router = express.Router();
var proxy = require('http-proxy').createProxyServer();

router.get('/*', function (req, res, next) {
    proxy.web(req, res, {
        target: 'http://localhost:8081/build'
    });
});

proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

module.exports = router;