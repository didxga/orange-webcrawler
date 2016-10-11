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
    function _onclear(){
    	var selectedEls = document.querySelectorAll(".lll-ddd");
    	var len = selectedEls.length;
    	for(var i = 0 ; i<len;i ++ ){
    		var el = selectedEls[i];
    		el.classList.remove("lll-ddd");
    	}
    	var elements = document.getElementsByClassName('delete-btn');
	    while(elements.length > 0){
	    	elements[0].parentNode.removeChild(elements[0]);
	    }
    }
	function _onSelect(element) {
	    //var clone = element.cloneNode(true);
	    var s = R.utils.getElementXPath(element);
	    var reg = /\[(\d+)\]/g;
	   // var reg = /\d+/g;
	    var arr = [] ;
	    var target ;
	    
		s.replace(reg,function(match1,match2,index,p2){
	            arr.unshift([parseInt(match2),index,match2.length]);
		    	return match1;
	         });
		arr.unshift([1,s.length,1]);
		var len = arr.length;
		for(var i = 0 ; i<len;i++){
			target = findBrotherEl(s,arr[i]);
			if(target.length>0){
				break ;
			}
		}
		target.push(getTargetEl(element));
	    for(var i =0,length2=target.length;i<length2;i++){
	    	_applySelectedStyle(target[i],i);
	    }
	    R.message.publish('gui.update', target);
	}
	
	function findBrotherEl(s,arr){
		var preS = s.substring(0,arr[1]);
		var posS = s.substr(arr[1]+arr[2]+2);
		var midS,arr2 = [] ;
		var maxIndex = Math.max(arr[0],100) ;
		for(var i= 0 ; i<maxIndex ;i++){
			midS = "["+i+"]";
			var slibingEl = getElementByXpath(preS+midS+posS);
			if(i!=arr[0]&&slibingEl&&_isSelectionValid(slibingEl)){
				arr2.push(getTargetEl(slibingEl));
			}
		}
		return arr2 ;
	}
	function getElementByXpath(path) {
		  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}
	
	function _applySelectedStyle(el,i) {
		el.classList.add("lll-ddd");
		_addDelBtn(el);
	}
	function getTargetEl(el){
		var x = el
		while (x.tagName != 'A') {
			  x = x.parentNode;
			}
		return x;
	}
	function _addDelBtn (el) {
		   var spanEl = document.createElement('span');
			spanEl.classList.add("delete-btn");
			var targetEl = getTargetEl(el) ;
			if(targetEl){
				targetEl.appendChild(spanEl);
				//insertAfter(,el);
				R.utils.addEvent(spanEl,"click",function(e){
					R.message.publish('gui.delete', targetEl);
					targetEl.removeChild(spanEl);
					el.classList.remove("lll-ddd");
				})
			}
			else{
				return false ;
			}
	}
	
	function insertAfter(newNode, referenceNode) {
	    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
	function _isSelectionValid(element) {
		if (element.childElementCount ==0) {
			if(element.tagName==="A"||element.parentElement.tagName==="A"){
				return true;
			}
			if(element.tagName==="IMG"&&element.parentElement.tagName==="A"){
				return true;
			}
		}
		else {
			if(element.tagName==="A"){
				var childNodes =  element.childNodes;
				var length = childNodes.length;
				for(var i = 0 ; i< length ; i++){
					if(childNodes[i].nodeType===3){
						return true ;
					}
				}
				
			}	
		}
		 return false;
	}
	this.init = function(moduleName) {
	    R = RecorderApp.modules;
	    // Document must be cached before chrome initialization
	    _cacheDocument();

	    
	    
	    R.message.subscribe('inspector.select', _onSelect);
	    R.message.subscribe('gui.clear',_onclear);
	    if (R.trace.DBG_INITIALIZE) {
		R.trace.log(moduleName, 'initialization completed');
	    }
	};
	
	this.destroy = RecorderApp.modules.utils.noop;

    };
    return RecorderModule;
})());