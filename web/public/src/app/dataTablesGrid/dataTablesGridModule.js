import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import dataTablesGridBindings from './dataTablesGridBindings';
import dataTablesGridViewModel from './dataTablesGridViewModel';
import dataTablesGridTemplate from './dataTablesGrid.html';


registerTemplates(dataTablesGridTemplate);
registerBindings(dataTablesGridBindings);
registerViewModels({
    dataTablesGrid: dataTablesGridViewModel
});