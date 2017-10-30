import { is } from 'scalejs';
import _ from 'lodash';
import { observable, computed } from 'knockout';
import * as noticeboard  from 'scalejs.noticeboard';
import { setValue } from 'scalejs.noticeboard';
import { getCurrent } from 'scalejs.navigation';

//TODO: Remove this file!
// grid needs the following functions
/*

evaluateIfDefined,
operators,
objectContains,
immutableObservable
*/

var state = {};

noticeboard.subscribe('state', function (value) {
    state = value;
});

// when given a function, checks if the function is defined
// and calls it with the rest of the arguments
function evaluateIfDefined(func) {
    if (is(func, 'function')) {
        return func.apply(null, Array.prototype.slice.call(arguments, 1));
    }
    console.warn("Function not defined. Arguments:", Array.prototype.slice.call(arguments, 1));
    return;
}


// will check that object 1 contains object 2
function objectContains(obj1, obj2) {
    return Object.keys(obj2 || {}).every(function (prop) {
        return obj1[prop] && obj1[prop] === obj2[prop];
    });
}

// Json Operations -> functions
var operators = {
    '=': function (l, r) {
        return l == r; //use unstrict comparisions so strings can be compared with numbers
    },
    '!=': function (l, r) {
        return l != r;
    },
    '<': function (l, r) {
        return Number(l) < Number(r);
    },
    '>': function (l, r) {
        return Number(l) > Number(r);
    },
    '<=': function (l, r) {
        return Number(l) <= Number(r);
    },
    '>=': function (l, r) {
        return Number(l) >= Number(r);
    },
    'minDate': function (l, r) {
        return new Date(l) >= new Date(r);
    },
    'maxDate': function (l, r) {
        return new Date(l) <= new Date(r);
    },
    'contains': function (l, r) {
        //console.log("contains", arguments);
        return Array.isArray(l) || typeof l === "string" ? l.indexOf(r) !== -1 : false;
    },
    'notcontains': function (l, r) {
        //console.log("notcontains", arguments);
        return Array.isArray(l) || typeof l === "string" ? l.indexOf(r) === -1 : false;
    },
    'containsatleastone': function (l, r) {
        //console.log("containsatleastone", arguments);
        if (!Array.isArray(l) || !Array.isArray(r)) { return false; }
        return r.some(function (i) {
            return l.indexOf(i) !== -1;
        });
    },
    '': function () {
        return true;
    }
};


function immutableObservable(initVal) {
    var observableWrapper = observable(_.cloneDeep(initVal));
    observableWrapper.equalityComparer = function (old, val) {
        return JSON.stringify(old) === JSON.stringify(val);
    }

    return computed({
        read: function () {
            return _.cloneDeep(observableWrapper());
        },
        write: function (newVal) {
            observableWrapper(_.cloneDeep(newVal));
        }
    })
}

//TODO - do this somewhere else?
computed(function() {
    var query = getCurrent().query || {};
    setValue('state', query);
});

//Export array of arrays to CSV file via url
//note: chrome has a popup that will apear if ran more then once in a single session about site trying to dl multiple files
//but chromium does not seem to have an argument to turn off and this will stop working and require a restart of the app
function exportArrayToCsv(arrayOfArrays) {
    let csv = "";
    arrayOfArrays.forEach(a => { csv += a.toString() + "\r"; });

    //Send the request and listen for a response
    const filename = "timelog_" + new Date().toISOString() + ".csv";
    const blob = new Blob([csv], { type: "text/csv" });

    //Create the link in the blotter window
    const parentdoc = window.document;
    const link = parentdoc.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.style.display = "none";
    link.setAttribute("href", url);
    link.setAttribute("download", filename);    
    parentdoc.body.appendChild(link);

    //Click the link and clean up
    link.click();
    window.URL.revokeObjectURL(url);
    parentdoc.body.removeChild(link);
}

export {
    evaluateIfDefined,
    objectContains,
    operators,
    immutableObservable,
    exportArrayToCsv
} 