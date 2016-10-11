"use strict";
/**
 * Recorder module: main controller of the application
 */
RecorderApp.registerModule('recorder', (function() {
    var R={};
    var rootPath = null ;
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
        function _getRootPath(doc){
            var curWwwPath=doc.location.href;
            var pathName=doc.location.pathname;
            var pos=curWwwPath.indexOf(pathName);
            var localhostPath=curWwwPath.substring(0,pos);
            var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
            return(localhostPath+projectName+"/");
        }

      
        function _handleImgSrc(element){
            var temSrc =  _getImgSrc(element);
            return temSrc?_processImgSrc(temSrc):_handleImgBgSrc(element);
        }
        function _handleImgBgSrc(element){
            var temSrc =  _getImgBgSrc(element);
            return temSrc?_processImgBgSrc(temSrc):null;
        }
        function _getAHref(element){
            return element.getAttribute("href");
        }
        function _getAText(element){
            return element.innerText;
        }
        function _getImgSrc(element){
            return R.utils.getAttr(element,"src");
        }
        function _getImgBgSrc(element){
            return R.utils.getStyleAttr(element,"backgroundImage")||R.utils.getDefaultStyleAttr(element,"backgroundImage");
        }
        function _processImgSrc(src){
            src = R.utils.isString(src)?src:(src.value||src.nodeValue||src.textContent);
            var re = /(?=(http[s]{0,1}|data):|\/\/)(.+)/g;
            if(re.test(src)){
                src.replace(re,function(match,p1,p2,p3){
                    return p2;
                });
            }
            else{
                src = rootPath+src ;
            }
            return src;
        }
        function _processImgBgSrc(src){
            src = R.utils.isString(src)?src:(src.value||src.nodeValue||src.textContent);
            if(src==="none"){return;}
            var re = /(?=(http[s]{0,1}|data):|\/\/)(.+)/g;
            src.replace(re,function(match,p1,p2,p3){
                return p2;
            });
            return src;
        }
        function _filterImgOnTree(element){
            var srcArr = [] ;
            var src = _collectImgSrc(element,srcArr);
            var elements = element.querySelectorAll('*');
            for ( var i = 0; i < elements.length; i++) {
                src = _collectImgSrc(elements[i],srcArr);
            }
            return R.utils.arrDistinct(srcArr);
        }
        function _filterOnTree(element){
            var srcArr = [] ;
            var src = _collectASrc(element,srcArr);
            var elements = element.querySelectorAll('*');
            for ( var i = 0; i < elements.length; i++) {
                src = _collectASrc(elements[i],srcArr);
            }
            return srcArr;
        }

        function _collectASrc(element,srcArr){
            var tagName = element.tagName;
            if(tagName==="A"){
            	var href = _getAHref(element);
            	var text = _getAText(element);
            	var imgSrc = _filterImgOnTree(element);
            	srcArr.push({"text":text,"href":href,"img":imgSrc}) ;
            }
        }
        function _collectImgSrc(element,srcArr){
            var tagName = element.tagName;
            var src = tagName==="IMG"?_handleImgSrc(element):_handleImgBgSrc(element);
            if(src){srcArr.push(src);}
        }
        
        
        function _onSelect(element) {
            var clone = element ;
            var arr = _filterOnTree(clone);
            if (R.trace.DBG_RECORDER) {
            	R.trace.debug("capture",arr);
            }
            R.message.publish('gui.update', arr);
        }
        this.init = function(moduleName) {
            R = RecorderApp.modules;
            // Document must be cached before chrome initialization
            _cacheDocument();
            rootPath = _getRootPath(document);
            R.message.subscribe('inspector.select', _onSelect);
            if (R.trace.DBG_INITIALIZE) {
                R.trace.log(moduleName, 'initialization completed');
            }
        };
        this.destroy = RecorderApp.modules.utils.noop;
    };
    return RecorderModule;
})());