"use strict";
/**
 * Recorder module: main controller of the application
 */
RecorderApp.registerModule('recorder', (function() {
    var R={};
    var Capture = function() {
	this.classId = 'recorder-'+R.utils.uuid();
	this.html;
	this.inheritedRules=[];
	this.rules=[];
	this.css;
	this.parentClasses;
    };
    
    Capture.prototype = {
	    _replaceRelativeUrl : function(rule) {
		var re = /(url\(['"]{0,1})(?!(http[s]{0,1}|data):|\/\/)([^'")]+)/g;
		return rule.cssText.replace(re,function(match,p1,p2,p3){
		    return p1 + R.utils.resolve(p3,rule.parentStyleSheet.href);
		});
	    },
	    _prefixSelector : function(selector) {
		var re = /\s*(.+?)(,|$)/g;
		var prefix = '.'+this.classId;
		return selector.replace(re,prefix + ' $1$2');
	    },
	    _replaceIdSelector : function(selector) {
		var re = /#([\w\d_-]+)/g;
		return selector.replace(re,".$1");
	    },
	    _formatInheritedRules : function() {
		var cssProperties = '';
		for ( var i = this.inheritedRules.length-1; i >= 0; i--) {
		    var ruleData = this.inheritedRules[i];
		    if (ruleData.rule && ruleData.rule.cssText) {
			cssProperties += '/*'+ruleData.selector+'*/\n';
			var cssText = this._replaceRelativeUrl(ruleData.rule);
			cssProperties += cssText.replace(new RegExp(ruleData.selector+'\\s*{(.*)}','g'),'$1');
		    } else {
			if (R.trace.DBG_RECORDER) {
			    R.trace.warn('Skip rule:',ruleData);
			}
		    }
		}
		return '.'+this.classId + '{'+cssProperties+'}\n';
	    },
	    _formatRules : function() {
		var result = '';
		for ( var i = 0, len = this.rules.length; i < len; i++) {
		    var ruleData = this.rules[i];
		    var selector = this._replaceIdSelector(ruleData.selector);
		    selector = this._prefixSelector(selector);
		    if (ruleData.rule && ruleData.rule.cssText) {
			var cssText = this._replaceRelativeUrl(ruleData.rule);
			result += selector + cssText.substring(ruleData.selector.length)+'\n';
		    } else {
			if (R.trace.DBG_RECORDER) {
			    R.trace.warn('Skip rule:',ruleData);
			}
		    }
		}
		return result;
	    },
	    buildCss : function() {
		return this._formatRules() + this._formatInheritedRules();
	    },
	    toHTML : function() {
		var container = document.createElement('div');
		container.classList.add(this.classId);
		var wrapper = document.createElement('div');
		wrapper.className = this.parentClasses;
		wrapper.appendChild(this.html);
		var styleEl = document.createElement('style');
		styleEl.type='text/css';
		styleEl.textContent=this.buildCss();
		container.appendChild(styleEl);
		container.appendChild(wrapper);
		return container;
	    }
    };
    
    
    var RecorderModule = function() {
	var cssExtractor={},
	    attributes = [
		'onkeydown',
		'onkeyup',
	        'onkeypress',
	        'onclick',
	        'ondblclick',
	        'onmousedown',
	        'onmousemove',
	        'onmouseout',
	        'onmouseover',
	        'onmouseup',
	        'onmousewheel',
	        'onscroll',
	        'ondrag',
	        'ondragend',
	        'ondragenter',
	        'ondragleave',
	        'ondragover',
	        'ondragstart',
	        'ondrop'
		],
		tagsToClean = ['script'];
	function _cacheDocument() {
	    var ElementCache = R.cache.Element;
	    var els = document.getElementsByTagName("*");
	    for (var i=0, l=els.length, el; i<l; i++)
	    {
	        el = els[i];
	        ElementCache(el);
	    }
	}
	
	function _collectParentClassesAndIds(element) {
	    var result = '', current = element;
	    while ((current = current.parentNode) != document) {
		result += ' ' + current.className;
		if (current.id) {
		    result += ' ' + current.id;    
		}
	    }
	    return result.trim();
	}
	
	function _removeDuplicates(rules) {
	    var visited = {};
	    rules = rules.filter(function (value) {
		var id = value.rule.cssText;
		if (id in visited) {
		    return false;
		} else {
		    visited[id] = true;
		    return true;
		}
	    });
	    return rules;
	}
	
	function _extractInheritedRules(element) {
	    var rules = [],
	    	sections = [],
		usedProps = {};
	    cssExtractor.getInheritedRules(element, sections,
			usedProps);
	    rules = sections.reduce(function(prev,current) {
		return prev.concat(current.rules);
	    }, rules);
	    return _removeDuplicates(rules);
	}
	
	function _extractCssRules(element) {
	    var rules = [],
		usedProps = {};
	    cssExtractor.getElementRules(element, rules, usedProps);
	    var subElements = element.getElementsByTagName("*");
	    for (var i = 0, len = subElements.length; i < len; i++) {
		cssExtractor.getElementRules(subElements[i], rules, usedProps);
	    }
	    
	    return _removeDuplicates(rules);
	}
	
	function _replaceIdByClass(element) {
	    if (element.id) {
		var id = element.id;
		element.classList.add(id);
		element.removeAttribute('id');
	    }
	    return element;
	}
	
	function _replaceIdByClassOnTree(element) {
	    _replaceIdByClass(element);
	    // TODO use selector API in utils?
	    var elements = element.querySelectorAll('[id]');
	    for ( var i = 0; i < elements.length; i++) {
		_replaceIdByClass(elements[i]);
	    }
	    return element;
	}
	
	function _cleanUpAttributes(element) {
	    for ( var i = 0, len=attributes.length; i < len; i++) {
		element.removeAttribute(attributes[i]);
	    }
	}
	
	function _cleanUpAttributesOnTree(element) {
	    _cleanUpAttributes(element);
	    // TODO use selector API in utils?
	    var elements = element.querySelectorAll(attributes.map(function(a){return '['+a+']';}).join(','));
	    for ( var i = 0; i < elements.length; i++) {
		_cleanUpAttributes(elements[i]);
	    }
	    return element;
	}
	
	function _cleanUpTagsOnTree(element) {
	    // TODO use selector API in utils?
	    var elements = element.querySelectorAll(tagsToClean.join(','));
	    for ( var i = 0; i < elements.length; i++) {
		elements[i].parentNode.removeChild(elements[i]);
	    }
	    return element;
	}
	
	function _replaceRelativeUrl(element) {
	    var re = /(?!(http[s]{0,1}|data):|\/\/)(.+)/g;
	    if (element.href) {
		element.href = element.href.replace(re,function(match,p1,p2){
		    return R.utils.resolve(p2);
		});
	    } else if (element.src) {
		element.src = element.src.replace(re,function(match,p1,p2){
		    return R.utils.resolve(p2);
		});
	    }
	}
	
	function _replaceRelativeUrlOnTree(element) {
	    _replaceRelativeUrl(element);
	    var elements = element.querySelectorAll('[href],[src]');
	    for ( var i = 0; i < elements.length; i++) {
		_replaceRelativeUrl(elements[i]);
	    }
	    return element;
	}
	
	function _onSelect(element) {
	    var capture = new Capture(),
	    	clone = element.cloneNode(true);
	    capture.parentClasses = _collectParentClassesAndIds(element);
	    capture.inheritedRules = _extractInheritedRules(element);
	    capture.rules = _extractCssRules(element);
	    _replaceIdByClassOnTree(clone);
	    _cleanUpAttributesOnTree(clone);
	    _cleanUpTagsOnTree(clone);
	    _replaceRelativeUrlOnTree(clone);
	    capture.html = clone;
	    
	    if (R.trace.DBG_RECORDER) {
		R.trace.debug("capture",capture);
	    }
	    R.message.publish('gui.update', capture);
	}

	this.init = function(moduleName) {
		debugger;
	    R = RecorderApp.modules;
	    // Document must be cached before chrome initialization
	    _cacheDocument();
	        
	    if (R.css.processAllStyleSheets) {
		R.css.processAllStyleSheets(document);
	    } else {
		R.trace.error("Unable to start recorder, css module was not ready");
	    }
	    
	    cssExtractor = R.css.createCssExtractor();
	    
	    R.message.subscribe('inspector.select', _onSelect);
	    
	    if (R.trace.DBG_INITIALIZE) {
		R.trace.log(moduleName, 'initialization completed');
	    }
	};
	
	this.destroy = RecorderApp.modules.utils.noop;

    };
    return RecorderModule;
})());