import $ from 'jquery';
import ko from 'knockout';
import './colorpicker.js';
import tinycolor from './tinycolor-min.js';


ko.bindingHandlers.colorPickerBinding = {
	init: function(
		element,
		valueAccessor,
		allBindings,
		viewModel,
		bindingContext
	) {
		console.log("element", element, "valueAccessor", valueAccessor(), "allBindings", allBindings(), "viewModel", viewModel, "bindingContext", bindingContext);

		let doc = document;
		let colorPicker;
		let colorPickerHex = "";
		let mouseDown = false;
		let hexManager = viewModel.hexManager;

		element.innerHTML = 
			`<div id="picker-wrapper">
	            <div id="picker" marginwidth="0" marginheight="0" style="height:100%"></div>
	            <div id="picker-indicator"></div>
	        </div>
	        <div id="slider-wrapper">
	            <div id="slider" marginwidth="0" marginheight="0" style="height:100%"></div>
	            <div id="slider-indicator"></div>
	        </div>`;


	    //when user drags indicator and mouse leaves the slider area, update color at the location their mouse leaves
	    $(doc.getElementById('slider')).mousedown(function () {
	        mouseDown = true;
	    })
	    .mouseup(function () {
	        mouseDown = false;
	    })
	    .mouseleave(function () {
	        if (mouseDown) hexManager(colorPickerHex, true); // Similar to "mouseup" event on slider
	        mouseDown = false;
	    });

	    //when user drags indicator and mouse leaves the picker area, update color at the location their mouse leaves
	    $(doc.getElementById('picker')).mousedown(function () {
	        mouseDown = true;
	    })
	    .mouseup(function () {
	        mouseDown = false;
	    })
	    .mouseleave(function () {
	        if (mouseDown) hexManager(colorPickerHex, true); // Similar to "mouseup" event on picker
	        mouseDown = false;
	    });
	    //sets the pointer-events CSS property to 'none' so any events on the indicators get passed to color picker
	    ColorPicker.fixIndicators(
	        doc.getElementById('slider-indicator'),
	        doc.getElementById('picker-indicator')
	    );

	    colorPicker = ColorPicker(
	        doc.getElementById('slider'),
	        doc.getElementById('picker'),
	        function(hex,hsv,rgb, pickerCoordinate, sliderCoordinate, evtType) {
	            //doc.body.style.backgroundColor = hex;
	            //themeService.vars.backgroundColor(hex);
	            ColorPicker.positionIndicators(
	                doc.getElementById('slider-indicator'),
	                doc.getElementById('picker-indicator'),
	                sliderCoordinate, pickerCoordinate
	            );
	            colorPickerHex = hex;
	            hexManager(hex, evtType === "click");
	        }
	    );

	    function updateColorPickerIndicator (element) {
	    	colorPicker.setHex(tinycolor(element.obs()).toHexString());
	    }

	    let subscription = viewModel.currentElement.subscribe(function (element) {
	    	//update color picker's indicator when a new element is selected in the theme editor
	    	updateColorPickerIndicator(element);
	    });

	    //when theme editor is hidden, the container for the picker and slider has 
	    //a width and height of 0 so the indicator should be set only after it is opened
	    viewModel.themeEditorShowing.subscribe(function (isShowing) {
	    	if (isShowing) {
			    updateColorPickerIndicator(viewModel.currentElement());	    	
	    	}
	    });


		ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
			subscription.dispose();
		});

	}
}