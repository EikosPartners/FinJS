//This provides general utilities with some thread-safety in terms of scope.  i.e. it can be pulled into
//a web worker safely since it will not make any DOM specific references.  Any function added should take
//extra care to NOT add any code that might referenced elements of the UI thread.

function getWebsocketURL () {
	return `ws://${location.hostname}:4080`;
}

export {
    getWebsocketURL
};