"use strict";
/*
 * inspector module:
 *  - capture selected node by the user
 */
RecorderApp.registerModule('inspector', (function() {
    var InspectorModule = function() {
	var R={},
	    devMode = false,
	    enable = false,
	    selected = null,
	    cssNode = null,
	    validSelectionClass = 'valid-selection',
	    invalidSelectionClass = 'invalid-selection',
	    forbiddenTags =['iframe', 'body', 'html'];
	
	function _applySelectedStyle(el, valid) {
	    if (valid) {
		el.classList.add(validSelectionClass);
	    } else {
		el.classList.add(invalidSelectionClass);
	    }
	}
	function _resetSelectedStyle(el) {
	    el.classList.remove(validSelectionClass);
	    el.classList.remove(invalidSelectionClass);
	}
	function _clearSelection() {
	    if(selected != null) { 
		_resetSelectedStyle(selected);
	    }
	    selected = null;
	}
	
	function _onValidSelection(target) {
	    _clearSelection();
	    //save the new selection and add its highlight
	    selected = target;
	    if (_isSelectionValidTree(target)) {
		_applySelectedStyle(selected, true);    
	    } else {
		_applySelectedStyle(target, false);
	    }
	}
	
	function _isSelectionValid(element) {
	    for ( var i = 0, len = forbiddenTags.length; i < len; i++) {
		if (element.nodeName.toLowerCase() == forbiddenTags[i]) {
		    return false;
		}
	    }
	    return true;
	}
	
	function _isSelectionValidTree(element) {
	    if (_isSelectionValid(element)) {
		var invalidElements = element.querySelectorAll(forbiddenTags.join(','));
		return invalidElements.length == 0;
	    } else {
		return false;
	    }
	}
	
	function _onMouseOver(e) {
	    if (enable) {
		//get event target and convert for text nodes
		var target = e.target ? e.target : e.srcElement;
		while(/#text/i.test(target.nodeName)) { target = target.parentNode; }
		
		R.message.publish('inspector.validation',target);
	    }
	    return true;
	}
	
	function _onMouseClick(e) {
	    if (enable) {
		//get event target and convert for text nodes
		var target = e.target ? e.target : e.srcElement;
		while(/#text/i.test(target.nodeName)) { target = target.parentNode; }
			
		//else if inspection is turned on and the target matches selection
		//(the flow logic means you can never inspect the button itself)
		if(target == selected) {
		    if (_isSelectionValidTree(target)) {
			//block default action
			    try { 
				e.preventDefault();
				e.stopPropagation();
			    } catch(err){}
			    if (devMode) {
				_clearSelection();
			    } else {
				R.message.publish('inspector.toggle');
			    }
			    R.message.publish('inspector.select',target);
			    return false;
		    } else {
			if (R.trace.DBG_INSPECTOR) {
			    R.trace.error("Invalid elements found",target);
			}
		    }
		}
	    }

	    //if we get here just return true
	    return true;
	}
	
	function _toggleEnable() {
	    if (enable) {
		enable = false;
		_clearSelection();
	    } else {
		enable = true;
	    }
	    
	}

	this.init = function(moduleName, param) {
	    R = RecorderApp.modules;
	    var url = param.portletUrl + 'modules/recorder/inspector.css';
	    cssNode = R.utils.injectCss(url, document.head);
	    R.message.subscribe('inspector.toggle', _toggleEnable);
	    R.message.subscribe('inspector.validSelection', _onValidSelection);
	    
	    R.utils.addEvent(document, 'mouseover', _onMouseOver);
	    R.utils.addEvent(document, 'click', _onMouseClick, true);
	        
	    if (R.trace.DBG_INITIALIZE) {
		R.trace.log(moduleName, 'initialization completed');
	    }
	};
	
	this.destroy = function(){
	    if (cssNode) {
		cssNode.parentNode.remove(cssNode);
	    }
	    R.utils.removeEvent(document, 'mouseover', _onMouseOver);
	    R.utils.removeEvent(document, 'click', _onMouseClick, true);
	};

    };
    return InspectorModule;
})());