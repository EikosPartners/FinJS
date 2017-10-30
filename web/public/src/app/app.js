import modules from 'app/modules';
import mainModule from './main/mainModule'; // always run main module after others
import sandbox from 'scalejs.sandbox';

import ko from 'knockout';
window.ko = ko;

windowfactory.onReady(function () {
    mainModule(); // prevent hot updates from breaking entire app!
});