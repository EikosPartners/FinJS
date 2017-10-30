import { registerTemplates, root, template } from 'scalejs.mvvm';
import { receive } from 'scalejs.messagebus';
import { windowfactory } from 'scalejs.sandbox';

import mainViewModel from './mainViewModel';
import mainTemplate from './main.html';


import '../../../sass/main.scss';
import 'scalejs.popup/dist/styles/popup-styles.css';

registerTemplates(mainTemplate);

let consoleLog = receive('console.log', function (log) {
    console.log('[mainModule]', log);
});

export default function () {
    const main = mainViewModel();

    root(template('main_template', main));
}
