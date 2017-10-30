import 'scalejs.metadatafactory-common/dist/list/listModule';
import 'scalejs.metadatafactory-common/dist/listAdvanced/listAdvancedModule';
import 'scalejs.metadatafactory-common/dist/template/templateModule';
import 'scalejs.metadatafactory-common/dist/input/inputModule';
import 'scalejs.metadatafactory-common/dist/adapter/adapterModule';
import 'scalejs.metadatafactory-common/dist/action/actionModule';
import 'scalejs.metadatafactory-common/dist/action/actions/ajax';
import 'scalejs.metadatafactory-common/dist/action/actions/event';
import 'scalejs.metadatafactory-common/dist/action/actions/route';
import 'scalejs.metadatafactory-common/dist/action/actions/redirect';
import 'scalejs.metadatafactory-common/dist/action/actions/popup/popup';

import './globalNavigation/globalNavigationModule';
import './blotter/blotterModule';

import './themeEditorPopup/themeEditorPopupModule';
import './slickGrid/slickGridModule';

if (module.hot) {
    module.hot.accept();
}
