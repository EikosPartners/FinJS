import { merge } from 'scalejs';
import { observable, observableArray } from 'knockout';

function routeFactory(url) {
    return () => {
        location.search = url;
    }
}

export default function globalNavigation(node) {
    var navLinks = observableArray([{
        action: function () {
            windowfactory.Window({
                url: "?emsblotter_blotter",
                left: 100, //headerBoundingBox.left,
                top: 200, //headerBoundingBox.bottom,
                width: 1150,
                height: 400
            });
        },//routeFactory("emsblotter_blotter"),
        text: "Blotter"
    }]);
    let activeLink = observable();

    let blotterWindow = windowfactory.Window({
        url: "?emsblotter_blotter",
        left: 100, //headerBoundingBox.left,
        top: 200, //headerBoundingBox.bottom,
        width: 1150,
        height: 400
    });
    if (windowfactory.runtime.isBrowser) {
        blotterWindow.onReady(function () {
            blotterWindow.maximize();
        });
    }

    return merge(node, {
        navLinks: navLinks,
        activeLink: activeLink,
        url: location.search.substr(1),
        dispose: function () {
        },
        minimize: function () {
            windowfactory.Window.current.minimize();
        },
        close: function () {
            windowfactory.Window.current.close();
        }
    });
}
