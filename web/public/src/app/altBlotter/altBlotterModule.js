import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import altBlotterBindings from './altBlotterBindings';
import altBlotterViewModel from './altBlotterViewModel';
import altBlotterTemplate from './altBlotter.html';

import '../../../../sass/emsblotter.scss';

registerTemplates(altBlotterTemplate);
registerBindings(altBlotterBindings);
registerViewModels({
    emsblotter_altBlotter: altBlotterViewModel
});