import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import sandbox from 'scalejs.sandbox';
import _ from 'lodash';
import $ from 'jquery';
import { observable } from 'knockout';
import dataservice from 'dataservice';
import { createViewModel } from 'scalejs.metadataFactory';
import "babel-polyfill";

export default function main() {
    // TODO: Add a loading animation template.
    let metadata = observable({
        "type": "template",
        "template": "empty_template"
    });
    let page = location.search.substr(1) || "header";

    dataservice.ajax("/pjson?name=pages/" + page).then((data) => {
        metadata(data);
    });

    return {
        metadata
    };
}