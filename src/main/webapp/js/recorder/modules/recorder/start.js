"use strict";
var RecorderApp = (function(doc, cons) {

    var modulesDefinition = [ {
            name : 'utils',
            url : 'modules/recorder/utils.js'
        }, {
            name : 'trace',
            url : 'modules/recorder/trace.js'
        }, {
            name : 'message',
            url : 'modules/recorder/message.js'
        }, {
            name : 'cache',
            url : 'modules/recorder/cache.js'
        },/* {
         name : 'proxy',
         url : 'modules/proxy.js'
         }, {
            name : 'css',
            url : 'modules/css.js'
        },*/ {
            name : 'recorder',
            url : 'modules/recorder/recorder.js'
        }, {
            name : 'inspector',
            url : 'modules/recorder/inspector.js'
        }],
        modules = {};
    
    function _getParams(node) {
	return node.dataset;
    }
    
    function _start() {
	var param = _getParams(doc.getElementById('OrangeRecorder'));
        _loadModules(param);
    }
    _start();
    function _loadModules(param) {
	var serverUrl = param.portletUrl;
	for ( var i = 0, len = modulesDefinition.length; i < len-1; i++) {
	    _injectJs(serverUrl+modulesDefinition[i].url,doc.body);
	}
	_injectJs(serverUrl+modulesDefinition[i].url,doc.body,function(){
	    _init(param);   
	});
    }
    
    // FIXME, code duplicated with utils module
    function _killCacheUrl(url) {
	var result = url;
	var urlParser = doc.createElement('a');
	urlParser.href = url;
	if (urlParser.search.length !== 0) {
	    result += '&';
	} else {
	    result += '?';
	}
	return result + "cachekiller=" + Date.now();
    }

    function _injectJs(url, node, cb) {
	var scriptEl = doc.createElement('script');
	scriptEl.setAttribute('type', 'text/javascript');
	scriptEl.setAttribute('src', url);
	scriptEl.async = false;
	if (cb) {
	    scriptEl.onload = cb;
	}
	node.appendChild(scriptEl);
    }

    function _init(param) {
        debugger;
	for ( var i = 0, len = modulesDefinition.length; i < len; i++) {
	    var moduleName = modulesDefinition[i].name;
	    RecorderApp.modules[moduleName] = new modules[moduleName]();
	    RecorderApp.modules[moduleName].init(moduleName,param);
	    delete modules[moduleName];
	}
    }
    
    function _destroy() {
	for ( var i = modulesDefinition.length-1; i >=0 ; i--) {
	    RecorderApp.modules[modulesDefinition[i].name].destroy();
	    delete RecorderApp.modules[modulesDefinition[i].name];
	}
	delete RecorderApp.modules;
    }

    function _registerModule(name, fn) {
	modules[name] = fn;
    }

    return {
	start : _start,
	stop : _destroy,
	registerModule : _registerModule,
	modules : {}
    };
})(document, console);

