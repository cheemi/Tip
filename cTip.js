/*
Author: Cheemi
Blog URL: http://cheemi.com
*/
var cTip = {
	$: function(){
		var elements = new Array();
		for (var i = 0; i < arguments.length; i++) {
			var element = arguments[i];
			if (typeof element == "string") 
				element = document.getElementById(element);
			if (arguments.length == 1) 
				return element;
			elements.push(element);
		}
		return elements;
	},
    addEvent: function (el,type,handler) { 
        if (el.addEventListener) {
            el.addEventListener(type, handler, false);
        } else if (el.attachEvent) {
            el.attachEvent("on"+type, handler);
        }
        else {
            el["on" + type] = handler;
        }
    },
    removeEvent: function (el, type, handler) {
   
        if (el.removeEventListener) {
            el.removeEventListener(type,handler,false);
        } else if (el.detachEvent) {
            el.detachEvent("on"+type);
        } else {
            el["on" + type] = null;
        }
    },
	preventDefault:function(e){
		e=e||window.event;
		if(e.preventDefault){
			e.preventDefault();	
		}else{
			e.returnValue= false;
		}
	},
	 getPageScroll: function () {
        var xScroll;
        var yScroll;
        if (self.pageYOffset) {
            xScroll = self.pageXOffset;
            yScroll = self.pageYOffset;
        }
        else
            if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
                xScroll = document.documentElement.scrollLeft;
                yScroll = document.documentElement.scrollTop;
            }
            else
                if (document.body) {// all other Explorers
                    xScroll = document.body.scrollLeft;
                    yScroll = document.body.scrollTop;
                }
        return [xScroll, yScroll];
    },
    getPageSize: function () {
        var xScroll, yScroll;
        if (window.innerHeight && window.scrollMaxY) {
            xScroll = document.body.scrollWidth;
            yScroll = window.innerHeight + window.scrollMaxY;
        }
        else
            if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
                xScroll = document.body.scrollWidth;
                yScroll = document.body.scrollHeight;
            }
            else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
                xScroll = document.body.offsetWidth;
                yScroll = document.body.offsetHeight;
            }
        var windowWidth, windowHeight;
        if (self.innerHeight) { // all except Explorer
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        }
        else
            if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
                windowWidth = document.documentElement.clientWidth;
                windowHeight = document.documentElement.clientHeight;
            }
            else
                if (document.body) { // other Explorers
                    windowWidth = document.body.clientWidth;
                    windowHeight = document.body.clientHeight;
                }
         
        if (yScroll < windowHeight)
            pageHeight = windowHeight;
        else
            pageHeight = yScroll;
        if (xScroll < windowWidth)
            pageWidth = windowWidth;
        else
            pageWidth = xScroll;
        return [pageWidth, pageHeight, windowWidth, windowHeight];
    },
    getDrapMaxPos: function (el) {
        el = typeof (el) == "string" ? cTip.$(el) : el;
        var pageScroll = cTip.getPageScroll();
        var pageSize = cTip.getPageSize();
        //var x = pageSize[0] - el.offsetWidth;
        var x = document.documentElement.scrollWidth - el.offsetWidth;
        var y = pageSize[1] - el.offsetHeight;
        return [x, y];
    },
    getPos: function (el) {
        el = typeof (el) == "string" ? cTip.$(el) : el;
        if (arguments.length != 1 || el == null)
            return null;
        var offsetLeft = el.offsetLeft;
        var offsetTop = el.offsetTop;
        while (el = el.offsetParent) {
            offsetTop += el.offsetTop;
            offsetLeft += el.offsetLeft;
        }
        return [offsetLeft, offsetTop];
    },
    getWindowCenterPos: function (el) {
        el = typeof (el) == "string" ? cTip.$(el) : el;
        var pageScroll = cTip.getPageScroll();
        var pageSize = cTip.getPageSize();
        var x = (pageSize[2] - el.offsetWidth) / 2 + pageScroll[0];
        var y = (pageSize[3] - el.offsetHeight) / 2 + pageScroll[1];
        return [x, y];
    },
    setWindowCenter: function (el) {
        var pos = cTip.getWindowCenterPos(el);
         
        el.style.left = pos[0] + "px";
        el.style.top = pos[1] + "px";
    },
    setStyle: function (el, style) {
        el = typeof (el) == "string" ? cTip.$(el) : el;
        if (typeof el != "object" || typeof style != "object")
            return;
        for (var x in style) {
            if (x == "opacity" && cTip.browser.msie){
                el.style.filter = (style[x] == 1) ? "" : "alpha(opacity=" + (style[x] * 100) + ")";
            el.style.filter="alpha(opacity=30)";
			}
        el.style[x] = style[x];
			 
        }
    }
};

cTip.browser = {
    version: (navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
    msie: /msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase()),
    mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/(compatible|webkit)/.test(navigator.userAgent.toLowerCase()),
    opera: /opera/.test(navigator.userAgent.toLowerCase()),
    safari: /webkit/.test(navigator.userAgent.toLowerCase())
}

cTip.zIndex = 10000;

cTip.win = function (config) {
    this.config = {
        type: 1,//对话框类型(可选参数,默认值为1) 1:提示 2:警告 3:正确或成功 4:错误 5:问号
        width: 240, //对话框宽度(可选参数,默认为400)
        height: "",//(可选参数,默认是根据里面内容自动增长高度)
        title: "提示",
        msg: "",
        fade: 1000,
        timeout: 2000,
        isOverlay: true ,//显示遮罩层(可选参数,默认为true)
        closeEvent: null,  // type设为5时,取消按钮的回调函数(可选参数)
        confirmEvent: null, //type设为5时,确定按钮的回调函数(可选参数),
        iconClass:""
    };
    for (var par in config) {
        this.config[par] = config[par];
    }
    this.show();
};
cTip.win.prototype = {
   
    show: function () {
        var  config = this.config,
            oThis = this;
        if (config.isOverlay)
            this.overlay = new cTip.overlay();
        var win = document.createElement("div");
        window.win = win;
        if (config.type == 1) {
          
             
            win.className = "alert-row";
          
            var alertDiv = document.createElement("div");
            alertDiv.className = "alert alert-success";
            alertDiv.innerHTML = "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><strong>" + config.msg + "</strong>";

            win.appendChild(alertDiv);

            document.getElementsByTagName("body")[0].appendChild(win);

            setTimeout(function () { $(".alert-row").fadeOut(config.fade); }, config.timeout);
        }
        else  {
           
             cTip.setStyle(win, {
                width: config.width+"px",
                border: "1px solid #CCC",
                position: "absolute",
                background: "#fff",
                zIndex: cTip.zIndex++ 
                
            });
           

            var topDiv = document.createElement("div");
            topDiv.className = "tip_top";
            var sp_close = document.createElement("span");

           
            sp_close.className = "sp_close";
         
            topDiv.innerHTML = "<span>"+config.title+"</span>";
            topDiv.appendChild(sp_close);

            sp_close.onclick = function () {
                oThis.close();
               
            };
            var midDiv = document.createElement("div");
           
            midDiv.className = "tip_mid";
            if (config.type == 2) {
                config.iconClass = "icon_warn";
            }
            else if (config.type == 5) {
                config.iconClass = "icon_question";
            }
            else if (config.type == 4) {
                config.iconClass = "icon_error";
            } else{
                config.iconClass = "icon_success";
            }
            midDiv.innerHTML = "<span class=\""+config.iconClass+"\"></span><span>" + config.msg + "</span>";

            var bottomDiv = document.createElement("div");

           
            
            bottomDiv.className = "tip_bottom";
  if (config.type == 5) {
            var winBtnOk = document.createElement("span");
            winBtnOk.className = "btn_ok";
            winBtnOk.innerHTML = "确定";

            winBtnOk.onclick = function () {
                oThis.close();
                if (config.confirmEvent != null) {
                    config.confirmEvent();
                }
            }
            bottomDiv.appendChild(winBtnOk);
           }
                var winBtnCancel = document.createElement("span");
                winBtnCancel.className = "btn_cancel";
				 if (config.type == 5) {
                 winBtnCancel.innerHTML = "取消";
				 }else{
						 winBtnCancel.innerHTML = "确定";
				}

                winBtnCancel.onclick = function () {
                    oThis.close();
                    if (config.closeEvent != null) {
                        config.closeEvent();
                    }
                };
           
            bottomDiv.appendChild(winBtnCancel);
           
 
            win.appendChild(topDiv);
            win.appendChild(midDiv);
            win.appendChild(bottomDiv);
			
            document.getElementsByTagName("body")[0].appendChild(win);
			 cTip.setWindowCenter(win);
			 
			 addEvent(window,"resize",this.changeSize);
			 this.disableScroll();
        }
    },
	changeSize:function(){
			 cTip.setWindowCenter(win);	
		},
    close: function () {
        var win = window.win;
        var config = this.config;
        win.parentNode.removeChild(win);
		cTip.removeEvent(window,"resize",this.changeSize);
		this.enableScroll();
        if (config.isOverlay)
            this.overlay.close();
    },
	disableScroll:function(){
		addEvent(window, "DOMMouseScroll",this.wheel);
		document.onkeydown=this.keydown;
		 
	},
	wheel:function(e){
		cTip.preventDefault(e);	
	},
	enableScroll:function(){
		cTip.removeEvent(window,"DOMMouseScroll",this.wheel);
		document.onkeydown=null;	
	},
	keydown:function(e){
		 
		var keys=[37,38,39,40];
		 cTip.preventDefault(e);
		for(var i=0,len=keys.length;i<len;i++){
			if(e.keyCode==keys[i]){
				cTip.preventDefault(e);
				return;	
			}	
		}	
	}
   
};

/****************************************
Description:
页面遮罩层
1.可以通过new来创建多个遮罩层
2.当页面大小改变或滚动时,遮罩层会自动调整为网页的高度
Example:
var obj = new cTip.overlay();//显示
obj.close();//关闭(从页面中移出)
 
****************************************/
cTip.overlay = function () {
    var overlay = document.createElement("div");
    cTip.setStyle(overlay, {
        width: "100%",
        height: cTip.getPageSize()[1] + "px",
        position: "absolute",
        left: "0",
        top: "0",
        zIndex: cTip.zIndex++,
		background:"#000",
        opacity: 0.3 ,
		 
    });
    this.changeSize = function () {
        overlay.style.height = cTip.getPageSize()[1] + "px";
    }
    this.show = function () {
        document.getElementsByTagName("body")[0].appendChild(overlay);
	 
		  
        addEvent(window, "resize", this.changeSize);
        addEvent(window, "scroll", this.changeSize);
		
    }
    this.close = function () {
        if (overlay)
            overlay.parentNode.removeChild(overlay);
        cTip.removeEvent(window, "resize", this.changeSize);
        cTip.removeEvent(window, "scroll", this.changeSize);
		 
        overlay = null;
        if (cTip.browser.msie)
            CollectGarbage();
    }
    this.show();
}

var addEvent = addEvent || cTip.addEvent,
	$=$||cTip.$;
 
 