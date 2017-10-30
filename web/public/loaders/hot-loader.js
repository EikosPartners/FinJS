module.exports = function (loader) {

    loader += '; if (module.hot) { ' +
        'module.hot.accept(); ' +
        'window.hotRender && window.hotRender(window.hot_action); ' +
    '}';
 
    return loader;
}