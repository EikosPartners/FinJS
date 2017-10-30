import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import sandbox from 'scalejs.sandbox';
import _ from 'lodash';
import $ from 'jquery';
import ko from 'knockout';
import {layout} from 'scalejs.navigation';
import { createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { merge } from 'scalejs';
import { startConnection } from '../../../extensions/dbService';
import gridViewModel from '../../grid/viewmodels/gridViewModel';



export default function blotter(node) {
    console.log(location);
    //debugger;
    // let dbConnection = startConnection();

    // this.dictionary({connection: dbConnection});
    // let that = this;    //assigning this to that so that we have access to this.data() in the callback below
    // let requestId = dbConnection.subscribeToService(function (message) {    
    //     let response = JSON.parse(message.data);
    //     that.data(response);
    // });
    // //this.data([]);

    // let mappedChildNodes = createViewModels.call(this,node.children);

    function empty () {}

    return merge(node, {
        mappedChildNodes: mappedChildNodes,
        username: ko.observable(""),
        undock: function () {
            windowfactory.Window.current.undock();
        },
        close: function () {
            windowfactory.Window.current.close();
        },
        maximize: empty,
        minimize: empty,
        dispose: function () {
            dbConnection.close();
        }
    });
};
