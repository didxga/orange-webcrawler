/**
 * Created by Administrator on 12/1/14.
 */
$(window)
		.load(
				function() {

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
					var R = null;
					var selectZoneEl = $('#select-zone');
					var $image = $(".cropper");
					var $iframe = $("#imgIframe");
					var $editZone = $("#edit-zone");

					$iframe
							.load(
									function() {
										R = null;
										console.log("iframe load"
												+ window.frames.length);
										autoInject(
												window.frames['imgIframe'].contentDocument,
												'OrangeRecorder',
												recorderCtx
														+ 'modules/recorder/start.js?'
														+ 'cachekiller='
														+ Date.now(), 
												recorderCtx,
												recorderCtx);
										$("#lodingloding").css("display", "none");
										$("#inspector").css("display", "");
									});

					$("#inspector")
							.click(
									function(e) {
										if (!R) {
											R = document
													.getElementById('imgIframe').contentWindow.RecorderApp.modules;
											R.message.subscribe(
													'inspector.toggle',
													_toggleRecordButton);
											R.message.subscribe('gui.update',
													_onUpdate);
											R.message.subscribe(
													'inspector.validation',
													_onInspect);
										}
										R.message.publish('inspector.toggle');
										R.utils.cancelEvent(e.originalEvent);
									});

					$("#select-zone").delegate("img", "click", function() {
						var src = $(this).attr("src");
						$("#ad_img").attr('src', src);
					});

					function _onInspect(target) {
						R.message.publish('inspector.validSelection', target);
					}
					;

					/**
					 * 选中了图片
					 */
					function _onUpdate(capture) {
						console.log(capture);
						selectZoneEl.empty();
						var html = "";
						var length = capture.length;
						if (length === 0) {
							alert("please try again!");
							return
						}
						for ( var i = length - 1; i >= 0; i--) {
							var item = capture[i];
							var el = handleImgItem(item);
							if (el) {
								html += el;
							}
						}
						selectZoneEl.append(html);

					}
					;
					/**
					 * 制作图片标签的HTML代码
					 */
					function handleImgItem(src) {
						var prefix = src.slice(0, 4);
						if ("http" === prefix) {
							return "<img src='" + src + "' />"
						} else if ("url(" === prefix) {
							var bgRrc = src.slice(4, src.length - 1);
							return "<img src='" + bgRrc + "' />"
						} else {
							return null;
						}
					}
					function _toggleRecordButton() {
						//Todo
					}

				});
