import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import sandbox from 'scalejs.sandbox';
import _ from 'lodash';
import $ from 'jquery';
import ko from 'knockout';
import {layout} from 'scalejs.navigation';
import { createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { merge } from 'scalejs';
import { startConnection } from 'dbService';


export default function blotter(node) {
    let dbConnection = startConnection();
    this.dictionary({connection: dbConnection});
    let that = this;    //assigning this to that so that we have access to this.data() in the callback below
    let requestId = dbConnection.subscribeToService(that.data); // New messages get pushed to this.data
    //this.data([]);

    let mappedChildNodes = createViewModels.call(this,node.children);
    
    //Prevent window icons from being shown if blotter is embedded in a window with a different domain
    let showIcons = ko.observable(true);
    try {
        if (parent.location.origin !== location.origin) {
            showIcons(false);
        } else {
            showIcons(true);
        }
    } catch (e) {
        showIcons(false);
    }

    return merge(node, {
        openThemeEditor: function () {
            for (let i = 0; i < mappedChildNodes.length; i++) {
                if (mappedChildNodes[i].type === "themeEditorPopup") {
                    mappedChildNodes[i].showEditor();
                }
            }
        },
        mappedChildNodes: mappedChildNodes,
        username: ko.observable(""),
        undock: function () {
            windowfactory.Window.current.undock();
        },
        close: function () {
            windowfactory.Window.current.close();
        },
        maximize: function () {
            if (windowfactory.Window.current.isMaximized()) {
                windowfactory.Window.current.restore();
            } else {
                windowfactory.Window.current.maximize();
            }
        },
        minimize: function () {
            windowfactory.Window.current.minimize();
        },
        dispose: function () {
            dbConnection.close();
        },
        showIcons: showIcons
    });
};
