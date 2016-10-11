"use strict";
/**
 * Cache module:
 *  - cache all elements in the page
 *  - cache CSS stylesheets
 */
RecorderApp.registerModule('cache', (function() {
    var R;
    var cacheUID = 0;
    var createCache = function() {

	var map = {};
	var CID = RecorderApp.modules.cache.GlobalID;

	// better detection
	var supportsDeleteExpando = !document.all;

	var cacheFunction = function(element) {
	    return cacheAPI.set(element);
	};

	var cacheAPI = {
	    get : function(key) {
		return map.hasOwnProperty(key) ? map[key] : null;
	    },

	    set : function(element) {
		var id = element[CID];

		if (!id) {
		    id = ++cacheUID;
		    element[CID] = id;
		}

		if (!map.hasOwnProperty(id)) {
		    map[id] = element;
		}

		return id;
	    },

	    unset : function(element) {
		var id = element[CID];

		if (supportsDeleteExpando) {
		    delete element[CID];
		} else if (element.removeAttribute) {
		    element.removeAttribute(CID);
		}

		delete map[id];

	    },

	    key : function(element) {
		return element[CID];
	    },

	    has : function(element) {
		return map.hasOwnProperty(element[CID]);
	    },

	    clear : function() {
		for ( var id in map) {
		    var element = map[id];
		    cacheAPI.unset(element);
		}
	    }
	};

	// TODO to clean
	R.utils.append(cacheFunction, cacheAPI);
	
	return cacheFunction;

    };

    var CacheModule = function() {
	
	this.init = function(moduleName){
	    R = RecorderApp.modules;
	    this.GlobalID = 'recorder' + new Date().getTime();
	    this.StyleSheet = createCache();
	    this.Element = createCache();
	    if (RecorderApp.modules.trace.DBG_INITIALIZE) {
		RecorderApp.modules.trace.log(moduleName, 'initialization completed');
	    }
	};
	
	this.destroy = function(){
	    this.StyleSheet.clear();
	    this.Element.clear();
	    delete this.StyleSheet;
	    delete this.Element;
	};
    };
    return CacheModule;
})());