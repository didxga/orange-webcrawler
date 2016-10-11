"use strict";
/**
 * GUI module:
 *  - create window and all its components
 */
RecorderApp.registerModule('gui', (function() {
    var GuiModule = function() {
	var R={},
	    windowEl=null,
	    saveIFrameEl=null,
	    titleBarEl=null,
	    buttonEl = null,
	    saveFormUrl,
	    cssNode=null,
	    draggedClass = 'dragged';
	
	function getInitialPosition(element) {
	    var top = 0;
	    var left = 0;
	    var currentElement = element;
	    do {
	      top += currentElement.offsetTop;
	      left += currentElement.offsetLeft;
	    } while (currentElement = currentElement.offsetParent);

	    var computedStyle = getComputedStyle? getComputedStyle(element) : false;
	    if (computedStyle) {
	      left = left - (parseInt(computedStyle['margin-left']) || 0) - (parseInt(computedStyle['border-left']) || 0);
	      top = top - (parseInt(computedStyle['margin-top']) || 0) - (parseInt(computedStyle['border-top']) || 0);
	    }

	    return {
	      top: top,
	      left: left
	    };
	  }
	
	function _onWindowDrag(event) {
	    var style = windowEl.style;
	    var elementXPosition = parseInt(style.left, 10);
	    var elementYPosition = parseInt(style.top, 10);

	    var elementNewXPosition = elementXPosition + (event.clientX - windowEl.lastXPosition);
	    var elementNewYPosition = elementYPosition + (event.clientY - windowEl.lastYPosition);
	    
	    if (elementNewXPosition >= 0 && elementNewYPosition >= 0) {
		style.left = R.utils.inPixels(elementNewXPosition);
		style.top = R.utils.inPixels(elementNewYPosition);
		windowEl.lastXPosition = event.clientX;
		windowEl.lastYPosition = event.clientY;
	    } else {
		R.utils.cancelEvent(event);
		if (R.trace.DBG_GUI) {
		    R.trace.warn('Prevent window to go outside viewport');
		}
	    }
	}
	
	function _stopWindowDrag(e) {
	    windowEl.classList.remove(draggedClass);
	    R.utils.removeEvent(document, 'selectstart', R.utils.cancelEvent);
	    R.utils.removeEvent(document,'mousemove',_onWindowDrag);
	    R.utils.removeEvent(document,'mouseup',_stopWindowDrag);
	}
	
	function _startWindowDrag(e) {
	    windowEl.classList.add(draggedClass);
	    var initialPosition = getInitialPosition(windowEl);
	    windowEl.style.left = R.utils.inPixels(initialPosition.left);
	    windowEl.style.top = R.utils.inPixels(initialPosition.top);
	    windowEl.lastXPosition = e.clientX;
	    windowEl.lastYPosition = e.clientY;
	    
	    R.utils.addEvent(document, 'selectstart', R.utils.cancelEvent);
	    R.utils.addEvent(document,'mousemove',_onWindowDrag);
	    R.utils.addEvent(document,'mouseup',_stopWindowDrag);
	}
	
	function _createTitleBar() {
	    var titleBar = document.createElement('div');
	    titleBar.classList.add('titleBar');
	    titleBar.textContent = 'Orange Recorder';
	    return titleBar;
	}
	
	function _createSaveIFrame(saveFormUrl) {
	    var saveIFrame = document.createElement('iframe');
	    saveIFrame.src = saveFormUrl;
	    return saveIFrame;
	}
	
	function _toggleRecordButton() {
	    buttonEl.classList.toggle('active');
	}
	
	function _createRecordButton() {
	    var button = document.createElement('button');
	    button.textContent='Inspect';
	    button.classList.add('recordButton');
	    return button;
	}
	
	function _createWindow(saveFormUrl) {
	    var el = document.createElement('div');
	    el.classList.add('recorder');
	    titleBarEl = _createTitleBar();
	    R.utils.addEvent(titleBarEl,'mousedown',_startWindowDrag);
	    el.appendChild(titleBarEl);
	    buttonEl = _createRecordButton();
	    R.utils.addEvent(buttonEl, 'click', function(e) {
		R.message.publish('inspector.toggle');
		R.utils.cancelEvent(e);
	    }); 
	    el.appendChild(buttonEl);
	    saveIFrameEl = _createSaveIFrame(saveFormUrl);
	    var iframeWrapperEl = document.createElement('div');
	    iframeWrapperEl.classList.add('iframeWrapper');
	    iframeWrapperEl.appendChild(saveIFrameEl);
	    el.appendChild(iframeWrapperEl);
	    return el;
	}
	
	function _display(saveFormUrl) {
	    if (!windowEl) {
		windowEl = _createWindow(saveFormUrl);
		document.body.appendChild(windowEl);
	    } else {
		if (R.trace.DBG_GUI) {
		    R.trace.log('Window already created, ignore creation');    
		}
	    }
	}
	
	function _onInspect(target) {
	    if (target != windowEl && !windowEl.contains(target)) {
		R.message.publish('inspector.validSelection', target);
	    } else {
		if (R.trace.DBG_GUI) {
		    R.trace.log('node selected is a part of window');    
		}
	    }
	};
	
	function _onUpdate(capture) {
	    var node = capture.toHTML();
	    saveIFrameEl.contentWindow.postMessage(node.outerHTML, saveFormUrl);
	};
	
	this.init = function(moduleName,param) {
	    R = RecorderApp.modules;
	    var url = param.portletUrl + 'css/recorder.css';
	    cssNode = R.utils.injectCss(url, document.head);
	    saveFormUrl = param.widgetUrl;
	    
	    _display(saveFormUrl);
	    R.message.subscribe('inspector.toggle', _toggleRecordButton);
	    R.message.subscribe('gui.update', _onUpdate);
	    R.message.subscribe('inspector.validation', _onInspect);
	    
	    if (R.trace.DBG_INITIALIZE) {
		R.trace.log(moduleName, 'initialization completed using parameters', param);
	    }
	};
	
	this.destroy = function() {
	    if (cssNode) {
		cssNode.parentNode.remove(cssNode);
	    }
	    if (windowEl) {
		windowEl.parentNode.remove(windowEl);
	    }
	};

    };
    return GuiModule;
})());