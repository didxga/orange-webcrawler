/**
 * Created by Administrator on 28/04/16.
 */
var originData = null;
$inspector = $('#inspector');
$save = $('#save');
$loader = $('.loader-container');
$('.search-box').delegate("button",'click',function(){
    navIframe();
})
$('#i-frame').load(imgIframeOnLoad);
/**
 * 内嵌浏览器加载完成
 * @returns
 */
function imgIframeOnLoad() {
    try {
        if (window.frames['i-frame'].contentDocument.title == '404') {
            alert('Please enter the address and press the "Browse" button.');
            return;
        }
    } catch (e) {}
    try {
        $(window.frames["i-frame"].contentDocument).find("a").each(function() {
            var a = $(this);
            if (a.attr('target') == '_blank') {
                a.attr('target', '');
            }
            a.attr('onmousedown', 'top.iframeAClick(this,event)');
        });
    } catch (e) {}
    try {
        $(window.frames["i-frame"].contentDocument).find("a").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } catch (e) {}
    
    //alert('Click on the "Capture Image" button to capture images.');
    //$inspector.parent().show();
    R = null;
    // 进行代码注入
    autoInject(
            window.frames['i-frame'].contentDocument,
            'OrangeRecorder',
            recorderCtx
                    + 'modules/recorder/start.js?'
                    + 'cachekiller='
                    + Date.now(), 
            recorderCtx,
            recorderCtx);
    
    $inspector.removeAttr('disabled');
    $save.removeAttr('disabled');
    $loader.hide();
    $inspector.click(inspectorOnClick);
    isWorking = false;
    setTimeout(function () {
        if ($inspector.attr('disabled')) {
            isWorking = false;
            inspectorOnClick();
        }
        
    }, 1000);
    
    
}
/**
 * 浏览按钮被点击
 */
function navIframe() {
    var targetUrl = $('#url').val();
    if (!checkUrl(targetUrl)) {
        alert('Please enter a correct URL');
        return;
    }
    document.domain= '123.127.237.161';
    navByProxy(targetUrl);
}
/**
 * 代理访问网址
 */
function navByProxy(targetUrl) {
    var url = ctx + '/PageServlet?url=' + encodeURIComponent(targetUrl);
    
    $("#i-frame").attr('src', url);
    $loader.show();
    //$browsemask.remove();
    //changeBrowseTip("loading...");
}
//抓取图片相关的方法和代码
/**
 * 注入代码
 */
function autoInject(doc, scriptId, scriptSrc, widgetUrl,
        portletUrl) {
    if (doc.getElementById(scriptId)) {
        console
                .warn('script already injected, refresh page to restart recorder');
        return;
    }
    var script = doc['createElement' + 'NS']
            && doc.documentElement.namespaceURI;
    script = script ? doc['createElement' + 'NS'](script,
            'script') : doc['createElement']('script');
    script.dataset['widgetUrl'] = widgetUrl;
    script.dataset['portletUrl'] = portletUrl;
    script['setAttribute']('id', scriptId);
    script['setAttribute']('src', scriptSrc);
    (doc['getElementsByTagName']('head')[0] || doc['getElementsByTagName']
            ('body')[0]).appendChild(script);
}
function iframeAClick(a,e) {
    //if (isWorking) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    //}
    /*else{
        var url = $(a).attr('href');
        var baseUrl = $('#url').val();
        baseUrl = baseUrl.substring(7);
        var domain = 'http://' + baseUrl.split('/')[0];
        if (url.substring(0, 1) == '/') {
            url = domain + url;
        }
        
        // 分析url是否绝对路径
        if (url.substring(0, 4) == 'http') {
            navByProxy(url);
            $('#url').val(url);
        } else {
            // 非绝对url,需要进行处理
            
            alert(url);
        }
    }*/
    
    
    
    
}
/**
 * 抓图按钮被点击
 */
function inspectorOnClick(e) {
    if (!R) {
        R = document
                .getElementById('i-frame').contentWindow.RecorderApp.modules;
        R.message.subscribe(
                'inspector.toggle',
                _toggleRecordButton);
        R.message.subscribe('gui.update',
                _onUpdate);
        R.message.subscribe(
                'inspector.validation',
                _onInspect);
        R.message.subscribe(
                'gui.delete',
                _onDelete);
        
        $save.click(function(e){
            
            
            //http://123.127.237.161:8080/orange-crawler/api/selector/add
            if(originData&&originData.length>0){
                console.log(originData);
                var obj ={url:$('#url').val(),paths:[]}
                originData.forEach(function(item,index){
                    obj.paths.push(R.utils.getElementXPath(item));
                });
                console.log(obj);
                 $.ajax({
                     url:"api/selector/add",
                     type:'POST',
                     data:obj,
                     dataType:'json',
                     success:function(data,code) {
                         if(code === 'success') {
                             console.log(data);
                         }else{
                             console.log(data);
                         }
                     },
                     error:function(msg){
                         console.log(msg);
                     }
                 })
            }
        });
    }
    else{
        R.message.publish('gui.clear');
        originData = null; delData =null ;
    }
    R.message.publish('inspector.toggle');
    isWorking = !isWorking ;
    if (isWorking) {
        //messageBox('Click on the image which you need.');
    }
    try {
        R.utils.cancelEvent(e.originalEvent);
    } catch(e) {
        
    }
    function _toggleRecordButton() {
        //Todo
    }
    
    function _onInspect(target) {
        R.message.publish('inspector.validSelection', target);
    }
    ;
    /**
     * 选中了图片
     */
    function _onUpdate(capture) {
        //isWorking = false ;
        console.log(capture);
        originData = capture ;
        
    }
    function _onDelete(capture) {
        //isWorking = false ;
        console.log(capture);
        if(originData){
            originData = originData.filter(function(element,pos){
                return element!==capture})
        }
    }
}