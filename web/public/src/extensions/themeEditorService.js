import doT from './doT.js';
import tinycolor from './tinycolor-min.js';
import cssTemplate from '../../css/doTjs.template.css';

;
let compileCSS = doT.compile(cssTemplate.toString());
let themeStyleEl;

const themeElements = [
    //grid elements
    {
        varName: "gridCellBackground",
        name: "Cell Background"
    },
    {
        varName: "gridBorderColor",
        name: "Cell Border"
    },
    {
        varName: "gridTextColor",
        name: "Cell Text"
    },
    {
        varName: "gridHeaderBackground",
        name: "Header Background"
    },
    {
        varName: "headerSortedBackground",
        name: "Header Background (Sorted)"
    },
    {
        varName: "contrastColor",
        name: "Header Text"
    },
    {
        varName: "gridFilterBackground",
        name: "Filter Background"
    },
    {
        varName: "filterTextColor",
        name: "Filter Text"
    },
    //window elements
    {
        varName: "backgroundColor",
        name: "Window Background"
    },
    {
        varName: "windowBorderColor",
        name: "Window Border"
    },
    {
        varName: "frontColor",
        name: "Window Text and Icons"
    },
    {
        varName: "uiWidgetHeaderColor",
        name: "Header Background"
    },
    {
        varName: "buttonBackgroundColor",
        name: "Button Background"
    },
    {
        varName: "frontColor2",
        name: "Button Text"
    },
    {
        varName: "backgroundColor4",
        name: "Input Field Background"
    },
    {
        varName: "inputTextColor",
        name: "Input Field Text"
    },
    {
        varName: "accentColor",
        name: "Accents"
    }
];

const themeObj = {
	accentColor: "#00ffae",
	altProgressBarDone: "#264B21",
	altProgressBarRemaining: "#29466B",
	askPriceColor: "#fa3c3c",
	automatedParams: {
		buttonActiveBackground: "#ffa800",
		buttonActiveFrontColor: "#000",
		delayedDataAskColor: "#C20B0B",
		delayedDataBidColor: "#0F32EC",
		delayedDataLabelColor: "#000",
		sortIconColor: "#ff0000"
	},
	backgroundColor: "#090909",
	backgroundColor4: "#000000",
	bidPriceColor: "#37affa",
	buttonBackgroundColor: "#2e2e2e",
	cancelledBackground: "#2E2E2E",
	contrastColor: "#ffa800",
	filledBackground: "#0B0B0B",
	filterTextColor: "#00ffae",
	frontColor: "#c0c0c0",
	frontColor2: "#fff",
	gridBorderColor: "#2e2e2e",
	gridCellBackground: "#090909",
	gridFilterBackground: "#090909",
	gridHeaderBackground: "#090909",
	gridTextColor: "#fff",
	headerSortedBackground: "#555555",
	iconColor: "#676869",
	iconPath: "../images/base",
	imagePath: "../images",
	initialBackground: "#CE9F0D",
	inputTextColor: "#fff",
	newBackground: "#6C4907",
	partialBackground: "#1E2A41",
	rejectedBackground: "#B91818",
	uiWidgetHeaderColor: "#000000",
	utils: {
	    lighten: lighten,
	    brighten: brighten,
	    brightenOrDarken: brightenOrDarken,
	    luminance: luminance,
	    mixColors: mixColors,
	    filterWhiteColor: filterWhiteColor,
	    whiteOrBlack: whiteOrBlack,
	    whiteOrBlackOpposite: whiteOrBlackOpposite,
	    mostReadableError: mostReadableError
    },
	windowBorderColor: "#2e2e2e"
};


function lighten(color, percent) {
    return tinycolor(color).lighten(percent).toString();
}

function brighten(color, percent) {
    return tinycolor(color).brighten(percent).toString();
}

function brightenOrDarken(color, percent) {
    color = tinycolor(color);
    return (color.isLight() ? color.darken(percent) : color.brighten(percent)).toString();
}

function luminance(color) {
    return tinycolor(color).getLuminance();
}

function mixColors(color1, color2, percent) {
    return tinycolor.mix(color1, color2, percent).toString();
}

function filterWhiteColor(color) {
    // TODO: Finish formula! This formula is a little buggy.
    //brightness(0.5) sepia(1) hue-rotate(132deg) saturate(103.2%) brightness(91.2%)
    var baseHSL = tinycolor("#f00").toHsl();//"rgb(178, 160, 128)").toHsl();
    var hsla = tinycolor(color).toHsl(),
        h = hsla.h - baseHSL.h,
        s = 1 + (hsla.s - baseHSL.s),
        l = 1+(hsla.l - baseHSL.l);//#ff0080
    return "hue-rotate(" + h + "deg)saturate(" + s + ")brightness(" + l + ")";
}

function whiteOrBlack(color) {
    return (tinycolor(color).isLight() ? "white" : "black");
}

function whiteOrBlackOpposite(color) {
    return (tinycolor(color).isLight() ? "black" : "white");
}

//tiny color takes in the background color of the error popup and returns the most readable shade of red for the error text
function mostReadableError(backgroundColor) {
    return tinycolor.mostReadable(backgroundColor, ["#ff0000", "#ff2d2d", "#ff4c4c", "#fe7373", "#e40000", "#c90101", "#a40101", "#960101"], { includeFallbackColors: false }).toHexString();
}

function applyStyleToWindow (doc, elementName, newColor) {
	if (themeStyleEl == null) {
		themeStyleEl = doc.createElement("style");
	}
	themeObj[elementName] = newColor;
	themeStyleEl.innerHTML = compileCSS(themeObj);
	//console.log("css", themeStyleEl.innerHTML)
	doc.head.appendChild(themeStyleEl);
}

function getThemeColors () {
	return themeObj;
}

function getThemeElements () {
	return themeElements;
}
applyStyleToWindow(document, themeObj);

export default {
	applyStyleToWindow: applyStyleToWindow,
	getThemeColors: getThemeColors,
	getThemeElements: getThemeElements
};