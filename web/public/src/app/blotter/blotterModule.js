import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import blotterBindings from './blotterBindings';
import blotterViewModel from './blotterViewModel';
import blotterTemplate from './blotter.html';

import '../../../sass/emsblotter.scss';

registerTemplates(blotterTemplate);
registerBindings(blotterBindings);
registerViewModels({
    emsblotter_blotter: blotterViewModel
});