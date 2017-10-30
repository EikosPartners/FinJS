import sandbox from 'scalejs.sandbox';

var bindings = {
    'globalNavlinks': function (ctx) {
        var navLinks = this.navLinks().filter(function (link) {
                return link.inNav !== false && ((link.inDesktop != null ? link.inDesktop : true) || windowfactory.runtime.isBrowser);
        })
        return {
            foreach : navLinks
        }
    }
}

export default bindings;
