import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import globalNavigationViewModel from './globalNavigationViewModel.js';
import globalNavigationView from './globalNavigation.html';
import globalNavigationBindings from './globalNavigationBindings';

registerTemplates(globalNavigationView);
registerBindings(globalNavigationBindings);
registerViewModels({
    globalNavigation: globalNavigationViewModel
});
