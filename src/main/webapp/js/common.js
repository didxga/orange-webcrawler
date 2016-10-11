

String.prototype.trim=function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};
String.prototype.ltrim=function() {
	return this.replace(/(^\s*)/g,"");
};
String.prototype.rtrim=function() {
	return this.replace(/(\s*$)/g,"");
};

function checkUrl(str) { 
	str = str.match(/http(s?):\/\/.+/); 
	if (str == null){
		return false;
	}else{
		return true; 
	}
} 

/**
 * 获取浏览器工作区尺寸
 */
function getWindowSize() {
	var windowSize = {};
	
	var winWidth = document.body.clientWidth;
	var winHeight = document.body.clientHeight;
	
	//获取窗口宽度
	if (window.innerWidth)
		winWidth = window.innerWidth;
	else if ((document.body) && (document.body.clientWidth))
		winWidth = document.body.clientWidth;
	
	//获取窗口高度
	if (window.innerHeight)
		winHeight = window.innerHeight;
	else if ((document.body) && (document.body.clientHeight))
		winHeight = document.body.clientHeight;
	
	//通过深入Document内部对body进行检测，获取窗口大小
	if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}
	
	windowSize.winWidth = winWidth;
	windowSize.winHeight = winHeight;
	
	return windowSize;
}

/**
 * 弹出消息提示
 */
function messageBox(txt, showTimeLong) {
	var id = "messagebox_" + new Date().getTime();
	var winSize = getWindowSize();
	var top = winSize.winHeight / 2 - 50;
	var left = winSize.winWidth / 2 - 150;
	
	var html = '<div class="_alert" id="' + id + '" style="top: ' + top + 'px; left: ' + left + 'px;">';
	html += txt;
	html += '</div>';
	$("body").append(html);
	if (showTimeLong == undefined) {
		showTimeLong = 3000;
	}
	setTimeout(function() {closeMessageBox(id);}, showTimeLong);
	
}

/**
 * 隐藏消息提示
 * @param id
 */
function closeMessageBox(id) {
	$('#' + id).toggle("1500", function() {
		$('#' + id).remove();
	});
}
