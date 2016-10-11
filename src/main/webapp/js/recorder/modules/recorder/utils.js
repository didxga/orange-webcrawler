"use strict";
/**
 * Utils module:
 *  - gather all utils methods
 */
RecorderApp.registerModule('utils', (function() {
    var UtilsModule = function() {

	
	var urlParser = document.createElement('a');
	
	/**
	 * I am not big fan of inserting removing a base element on each call
	 * 
	 * see http://jsfiddle.net/ecmanaut/RHdnZ/ and http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue/12965135#12965135
	 */
	this.resolve = function(url,base_url) {
	    var doc      = document,
	    	resolver = doc.createElement('a'),
	        resolved_url;
	    if (base_url) {
		var    old_base = doc.getElementsByTagName('base')[0]
		      , old_href = old_base && old_base.href
		      , doc_head = doc.head || doc.getElementsByTagName('head')[0]
		      , our_base = old_base || doc_head.appendChild(doc.createElement('base'))
		      ;
		    our_base.href = base_url;
		    resolver.href = url;
		    resolved_url  = resolver.href; // browser magic at work here

		    if (old_base) old_base.href = old_href;
		    else doc_head.removeChild(our_base);
		    return resolved_url;
	    } else {
		resolver.href = url;
		resolved_url  = resolver.href; // browser magic at work here
		return resolved_url;
	    }
	  };
	
	/**
	 * code from http://www.broofa.com/Tools/Math.uuid.js
	 * Copyright (c) 2010 Robert Kieffer
	 * Dual licensed under the MIT and GPL licenses
	 * 
	 */
	this.uuid = function(length, radix) {
	    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	    var len = length || 16, uuid = [];
	    radix = radix || CHARS.length;
	    for ( var i = 0; i < len; i++) {
		uuid[i] = CHARS[0|Math.random()*CHARS.length];
	    }
	    return uuid.join('');
	};
	
	this.noop = function() {
	};

	this.init = this.noop;
	
	this.isIE = false; 

	this.destroy = this.noop;
	
	function getElementTreeXPath(element) {
	    var paths = [];

	    for (; element && element.nodeType == 1; element = element.parentNode) {
	        var index = 0;
	        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
	            if (sibling.nodeName == element.nodeName)
	                ++index;
	        }

	        var tagName = element.nodeName.toLowerCase();
	        var pathIndex = (index ? "[" + (index+1) + "]" : "");
	        paths.splice(0, 0, tagName + pathIndex);
	    }

	    return paths.length ? "/" + paths.join("/") : null;
	};
	
	this.inPixels = function(value) {
	    return value + 'px';
	};
	
	function _killCacheUrl(url) {
	    var result = url;
	    urlParser.href = url;
	    if (urlParser.search.length !== 0) {
		result += '&';
	    } else {
		result += '?';
	    }
	    return result + "cachekiller=" + Date.now();
	}

	this.getElementXPath = function(element) {
	    if (element && element.id)
		return '//*[@id="' + element.id + '"]';
	    else
		return getElementTreeXPath(element);
	};
	
	this.addEvent = function(node, ename, handler, capturePhase) {
	    if(typeof document.addEventListener != 'undefined') {
		node.addEventListener(ename, handler, capturePhase);
	    } else if(typeof document.attachEvent != 'undefined') {
		node.attachEvent('on' + ename, handler);
	    }
	};
	
	this.cancelEvent = function(event) {
	    event.preventDefault && event.preventDefault();
	    event.stopPropagation && event.stopPropagation();
	    event.returnValue = false;
	    return false;
	};
	
	this.removeEvent = function(node, ename, handler, capturePhase) {
	    if(typeof document.removeEventListener != 'undefined') {
		node.removeEventListener(ename, handler, capturePhase);
	    } else if(typeof document.attachEvent != 'undefined') {
		node.detachEvent('on' + ename, handler);
	    }
	};
				
	this.injectCss = function(url, node) {
	    var cssEl = document.createElement('link');
	    cssEl.setAttribute('type', 'text/css');
	    cssEl.setAttribute('rel', 'stylesheet');
	    cssEl.setAttribute('href', url);
	    node.appendChild(cssEl);
	    return node;
	};

	// TODO: to clean, use in CacheModule
	this.append = function(l, r) {
	    for ( var n in r)
		l[n] = r[n];
	    return l;
	};
	
	this.Selector = function(selector, doc) {
	    return document.querySelectorAll(selector);
	};

	this.Selector.matches = function(sel, arr){
	    var result = [];
	    var selectedEls = document.querySelectorAll(sel);
	    for ( var i = 0; i < arr.length; i++) {
		var found = false;
		for ( var j = 0; j < selectedEls.length && !found; j++) {
		    if (selectedEls[j] === arr[i]) {
			result.push(arr[i]);
			found = true;
		    }
		}
	    }
	    return result;
	};
    this.isDOM = ( typeof HTMLElement === 'object' ) ?
            function(obj){
                return obj instanceof HTMLElement;
            } :
            function(obj){
                return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
            }
    this.getDefaultStyleAttr = function(element,attribute,doc){
        if(this.isDOM(element)&&attribute){
            doc=doc?doc:document;
            return element.currentStyle?element.currentStyle[attribute]:document.defaultView.getComputedStyle(element,false)[attribute];
        }
    }
    this.getStyleAttr = function(element,attribute,doc){
        if(this.isDOM(element)&&attribute){
            var attr = element.style.attribute;
            return attr ;
        }
    }
    this.getAttr = function(element,attribute){
        if(this.isDOM(element)&&attribute){
            return element.attributes[attribute];
        }
    }
    this.isString = function (str){
            return (typeof str=='string')&&str.constructor==String;
    }
    this.arrDistinct = function(arg){
         var value = [];
         var hash = {};
         for(var i=0,j=arg.length;i<j;++i){
             var type = typeof arg[i]+arg[i];
             if(!hash[type]){
                 hash[type] = 1;
                 value[value.length] = arg[i];
             }
         }
         return value;
     }
    };
    return UtilsModule;
})());