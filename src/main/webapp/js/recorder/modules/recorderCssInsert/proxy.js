"use strict";
RecorderApp.registerModule('proxy',(function() {
    var R;
    var ProxyModule = function() {

	this.init = this.noop;
	
	this.destroy = this.noop;
    };
    return ProxyModule;
})());