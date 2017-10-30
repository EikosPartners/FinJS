import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import themeEditorPopupBindings from './themeEditorPopupBindings';
import themeEditorPopupViewModel from './themeEditorPopupViewModel';
import themeEditorPopupTemplate from './themeEditorPopup.html';


registerTemplates(themeEditorPopupTemplate);
registerBindings(themeEditorPopupBindings);
registerViewModels({
    themeEditorPopup: themeEditorPopupViewModel
});