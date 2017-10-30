import Promise from 'bluebird';
import $ from 'jquery';
import ko from 'knockout';
import { waitsFor } from 'mocha-waitsfor';

function getUrlResponseType(url) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;

            try {
                if (xhr.status === 200) {
                    resolve(xhr.getResponseHeader("Content-type"));
                } else {
                    throw Error("URL " + url + " returned non-200 status: " + xhr.status + ":" + xhr.statusText);
                }
            } catch (e) {
                reject(e);
            }
        };

        xhr.open("GET", url);
        xhr.send();
    });    
}

function getUrlData(url) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;

            try {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    throw Error("URL " + url + " returned non-200 status: " + xhr.status + ":" + xhr.statusText);
                }
            } catch (e) {
                reject(e);
            }
        };

        xhr.open("GET", url);
        xhr.send();
    });    
}

export {
    getUrlResponseType,
    getUrlData

};
export default {
    getUrlResponseType,
    getUrlData
};