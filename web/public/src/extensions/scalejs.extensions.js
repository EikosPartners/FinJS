import mvvm from 'scalejs.mvvm';
//import 'scalejs.windowfactory';
import './slickgridBinding.js';
import './dataTablesBinding.js';
import './colorPickerBinding.js';
import svg4everybody from 'svg4everybody';

// for debugging
import ko from 'knockout';
window.ko = ko; // this is fine for dev, but not Test or prod

//Check for svg external reference compatibility
svg4everybody();

mvvm.init({});
