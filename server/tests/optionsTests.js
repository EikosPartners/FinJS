const path = require('path');
const expect = require("chai").expect;
const options = require('../api/options');

it('order messages set to be encoded via protobuf at production server', function () {
    expect(options.isOrdersMessageEncoded).equals(true);
});

it('isProduction flag should be set to true at production server', function () {
    expect(options.isProduction).equals(false);
});

it('message logging is turned off at production server', function () {
    expect(options.isMessageFileLogEnabled).equals(false);
});

it('using mongo as the backend at production server', function () {
    expect(options.backendType).equals("mongo");
});

it('order build interval is 10 milliseconds or higher', function () {
    expect(options.buildIntervalMs).least(10);
});

it('order stream update interval is 200 milliseconds or higher at production server', function(){
    expect(options.viewUpdateIntervalMs).least(200);
});