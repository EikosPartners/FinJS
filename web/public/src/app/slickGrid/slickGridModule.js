import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import slickGridBindings from './slickGridBindings';
import slickGridViewModel from './slickGridViewModel';
import slickGridTemplate from './slickGrid.html';


registerTemplates(slickGridTemplate);
registerBindings(slickGridBindings);
registerViewModels({
    slickGrid: slickGridViewModel
});