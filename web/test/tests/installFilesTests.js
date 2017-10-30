/* eslint-env mocha */
import { expect } from 'chai';
import { waitsFor } from 'mocha-waitsfor';
import { getUrlResponseType, getUrlData } from '../utils/urlUtils';
import Promise from 'bluebird';

//Location and port url
const webUrl = `http://${location.hostname}:3000`;
const dbUrl = `http://${location.hostname}:4080`;

describe('electron installation files available', () => {
    it('windows exe file available', function () {
        this.timeout(3000);
        const url = `${webUrl}/install/electron?windows`;
        const contentTypePromise = getUrlResponseType(url);
        return contentTypePromise.should.eventually
            .be.a('string')
            .equals('exe');
    });
    it('linux AppImage file available', function () {
        this.timeout(3000);
        const url = `${webUrl}/install/electron?linux`;
        const contentTypePromise = getUrlResponseType(url);
        return contentTypePromise.should.eventually
            .be.a('string')
            .equals('x-executable');
    });
    it('macos dmg file available', function () {
        this.timeout(3000);
        const url = `${webUrl}/install/electron?macos`;
        const contentTypePromise = getUrlResponseType(url);
        return contentTypePromise.should.eventually
            .be.a('string')
            .equals('dmg');
    });
});

describe('general files test', () => {
    it('wpf installation file is available', function () {
        this.timeout(3000);
        const url = `${webUrl}/wpf/setup.exe`;
        const contentTypePromise = getUrlResponseType(url);
        return contentTypePromise.should.eventually
            .be.a('string')
            .equals('application/x-msdownload');
    });

    it('app.json file is available', function () {
        this.timeout(3000);
        const url = `${webUrl}/app.json`;
        const filePromise = getUrlData(url);
        return filePromise.should.eventually
            .be.a('string')
            .have.length.above(0);
    });

    it('index.dot file is available', function () {
        this.timeout(3000);
        const url = `${dbUrl}/index.dot`;
        const filePromise = getUrlData(url);
        return filePromise.should.eventually
            .be.a('string')
            .have.length.above(0);
    });
});