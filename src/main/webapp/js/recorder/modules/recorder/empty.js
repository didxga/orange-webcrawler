"use strict";
/**
 * An empty module to use as template
 */
RecorderApp.registerModule('moduleName', (function() {
    var ModuleNameModule = function() {
	var R={};

	this.init = function(moduleName) {
	    R = RecorderApp.modules;
	        
	    if (R.trace.DBG_INITIALIZE) {
		R.trace.log(moduleName, 'initialization completed');
	    }
	};
	
	this.destroy = RecorderApp.modules.utils.noop;

    };
    return ModuleNameModule;
})());