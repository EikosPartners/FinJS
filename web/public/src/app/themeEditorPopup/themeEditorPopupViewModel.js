import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import sandbox from 'scalejs.sandbox';
import _ from 'lodash';
import $ from 'jquery';
import ko from 'knockout';
import { merge } from 'scalejs';
import themeEditorService from '../../extensions/themeEditorService.js';


export default function (node) {
	let elements = [];
	let currentElement;
	let elementHasUndo;
	let themeEditorShowing = ko.observable(false);
	
	function applyStyle (hex) {
		currentElement().obs(hex);
		themeEditorService.applyStyleToWindow(document, currentElement().varName, hex);
	}

    function showEditor () {
    	let editorWindow = document.getElementById("theme-editor-window");
    	editorWindow.style.display = "block";
    	themeEditorShowing(true);
    }

    function closeEditor () {
    	let editorWindow = document.getElementById("theme-editor-window");
    	editorWindow.style.display = "none";
    	themeEditorShowing(false);
    }

    function undoCurrentElement () {
    	console.log("undo");
    }

    function resetCurrentElement () {
    	console.log("reset");
    }

    function changeCurrentElement (element) {
        return function () {
            currentElement(element);
        };
    };

    function hexManager (hex) {
    	applyStyle(hex);
    }
    
	function setUpElements () {
		let colorObj = themeEditorService.getThemeColors();
		let themeElements = themeEditorService.getThemeElements();
		for (let i = 0; i < themeElements.length; i++) {
			let firstColor = colorObj[themeElements[i]["varName"]];
			themeElements[i].isDirty = ko.observable(false);
			themeElements[i].lastSavedHex = "";
			themeElements[i].startHex = firstColor;
			themeElements[i].obs = ko.observable(firstColor);
			elements.push(themeElements[i]);
		}

		currentElement = ko.observable(elements[0]);
		elementHasUndo = ko.computed(function () {
	        return currentElement().isDirty();
	    });
	}

	setUpElements();

    return merge(node, {
    	showEditor: showEditor,
    	closeEditor: closeEditor,
    	elements: elements,
        undoCurrentElement: undoCurrentElement,
        resetCurrentElement: resetCurrentElement,
        currentElement: currentElement,
        changeCurrentElement: changeCurrentElement,
        elementHasUndo: elementHasUndo,
        hexManager: hexManager,
        themeEditorShowing: themeEditorShowing
    });
};

