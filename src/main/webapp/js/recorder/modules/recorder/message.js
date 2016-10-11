"use strict";
/**
 * Message module:
 * - message bus controller 
 */
RecorderApp.registerModule('message', (function() {
    var MessageModule = function() {
	var R={}, listenersMap={};
	
	this.init = function(moduleName) {
	    R = RecorderApp.modules;
	        
	    if (R.trace.DBG_INITIALIZE) {
		R.trace.log(moduleName, 'initialization completed');
	    }
	};
	
	this.subscribe = function(channel, listener) {
	    if (!listenersMap[channel]) {
		if (R.trace.DBG_MSG) {
		    R.trace.debug('Creating channel',channel);
		}
		listenersMap[channel] = [];
	    }
	    listenersMap[channel].push(listener);
	};
	
	this.publish = function(channel, event) {
	    if (listenersMap[channel]) {
		for ( var i = 0, len = listenersMap[channel].length; i < len; i++) {
		    listenersMap[channel][i](event);
		}
	    } else {
		if (R.trace.DBG_MSG) {
		    R.trace.warn('Try to publish on unlistened channel',channel);    
		}
	    }
	};
	
	this.destroy = function() {
	    for ( var listeners in listenersMap) {
		if (listenersMap.hasOwnProperty(listeners)) {
		    listenersMap[listeners].length=0;
		    delete listenersMap[listeners];    
		}
	    }
	};

    };
    return MessageModule;
})());