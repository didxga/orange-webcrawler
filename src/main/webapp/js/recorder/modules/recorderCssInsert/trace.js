"use strict";
/**
 * Trace module:
 *  - log relied on console browser
 *  - config to enable/disable logs for a specific module
 */
RecorderApp.registerModule('trace', (function() {
    var TraceModule = function() {

	var config = {
	    DBG_INITIALIZE : 0,
	    DBG_MSG : 1,
	    DBG_CSS : 0,
	    DBG_INSPECTOR : 1,
	    DBG_RECORDER : 1,
	    DBG_GUI : 0
	};

	this.init = function(moduleName) {
	    for ( var name in config) {
		this[name] = config[name];
	    }
	    if (RecorderApp.modules.trace.DBG_INITIALIZE) {
		this.log(moduleName, 'initialization completed');
	    }
	};
	
	this.destroy = RecorderApp.modules.utils.noop;

	this.timeEnd = Function.prototype.bind.call(console.timeEnd, console);
	this.time = Function.prototype.bind.call(console.time, console);
	this.debug = Function.prototype.bind.call(console.debug, console);
	this.log = Function.prototype.bind.call(console.log, console);
	this.warn = Function.prototype.bind.call(console.warn, console);
	this.error = Function.prototype.bind.call(console.error, console);
    };
    return TraceModule;
})());