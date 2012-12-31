/**
 * jQuery插件
 * select模拟插件
 * 支持css样式
 * 自动获取选项value值，并触发onchange事件
 * 支持selected默认选项
 * 支持键盘事件
 * */

(function($) {
	$.fn.extend({
		jSelect: function(options) {
				
			var defaults = {
				top: 0,
				left: 0,
				liActive: "active",
				maxItems: 115
			},
			/*
			 * top					控件距原select上边距，默认为0
			 * left					控件距原select左边距，默认为0
			 * liActive				鼠标经过相应条目时的样式
			 * maxItems				下拉选项大于此项目时出现滚动条
			 * j-select-arrrowDown	“向下”按钮为a标签，样式和鼠标经过时的样式可按a标签定义规则定义
			 */
			options = $.extend(defaults, options);
			/*
			 * select对象构造函数
			 */
			function SelectObj(o) {
				//原select对象的引用
				this.select = $(o);
				this.selectId = this.select.attr("id") || Math.random();
				
				//原select内的相关数据存储
				this.data = {};	
				
				this._init();
			}
			
			SelectObj.prototype = {
				/*
				 * 把原select内数据放入SelectObj中
				 */
				_initData: function() {
					var self = this;
					self.data.key = [];
					self.data.value = [];
					
					self.select.find("option").each(function() {
						self.data.key.push( $(this).text() );
						self.data.value.push( $(this).attr("value") );
					});
					// 滚动条滚动后，鼠标mouseover事件起作用的依据
					self.mouseoverCanUseful = true;
				},
				
				/*
				 * 构建对象的标签结构
				 */
				_initStructure: function() {
					var	self = this;		
					self.sContainer = $("<div></div>")
									.attr("id", "j_container_"+self.selectId)
									.addClass("j-container")
									.insertAfter( self.select );
									
					self.arrowDown = $("<a href='javascript:;'></a>")
									.addClass("j-select-arrrowDown")
									.appendTo(self.sContainer);
								
					self.viewContainer = $("<div></div>")
									.attr("id", "first_item_"+self.selectId)
									.css("cursor", "default")
									.appendTo(self.sContainer);
								
					self.itemContainer = $("<ul></ul>")
										.attr("id", "item_container_"+self.selectId)
										.css("cursor", "default")
										.addClass("j-select-list")
										.hide()
										.appendTo( $(document.body) );
					
					$.each(self.data.key, function(i) {
						$("<li>"+self.data.key[i]+"</li>").attr("list-value", self.data.value[i])
															.appendTo(self.itemContainer);
					});
					/*
					 * 鼠标停留项目判断
					 */
					self.index = 0;
					self.prevNum = 0;
					self.nextNum = self.data.value.length-1;
					/*
					 * 当前选中条目判断
					 */
					self.currentIndex = 0;
					self.currentPrevNum = 0;
					self.currentNextNum = self.data.value.length-1;
					
					self.select.find("option").each(function(i) {
						if ( $(this).attr("selected") ) {
							self.currentIndex = self.index = i;
							self.currentPrevNum = self.prevNum = i;
							self.currentNextNum = self.nextNum = self.data.value.length-i-1;
						}
					});
					var initView = self.itemContainer.find("li").eq(self.currentIndex).html();
					self.viewContainer.html(initView);
					self.itemContainer.find("li").eq(self.currentIndex).addClass(options.liActive);
					
					options.width = self.sContainer.width();
					options.height = self.sContainer.height();
				},
				
				/*
				 * 设置元素各个位置
				 */
				_initPosition: function() {
					var self = this,
						left = self.select.offset().left,
						top = self.select.offset().top,
						width = options.width,
						height = options.height,
						bodyHeight = document.documentElement.clientHeight,
						scrollTop = document.documentElement.scrollTop;
					
					self.viewContainer.css({
						height: height
					});
					
					self.arrowDown.css({
						display: "block",
						position: "absolute"
					});
					
					self._setItemUlPosition(left, top, width, height, bodyHeight, scrollTop);
					
					self.itemContainer.find("li").each(function(i) {
						$(this).hover(function() {
							if ( self.mouseoverCanUseful ) {
								self.index = i;
								self.prevNum = i;
								self.nextNum = self.data.value.length - i - 1;
								self.itemContainer.find("li").removeClass(options.liActive);
								self.itemContainer.find("li").eq(self.index).addClass(options.liActive);
							}
						});
					});
					/*
					 * 多于此条目时出现滚动条
					 */
					if ( !options.maxItems ) {
						return;
						
					} else if ( self.data.value.length > options.maxItems ) {
						self.itemContainer.css({
							height: height*options.maxItems,
							"overflow-y": "scroll"
						});
					}
				},
				
				_setItemUlPosition: function(left, top, width, height, bodyHeight, scrollTop) {
					var self = this;
					
					if ( (height*(self.data.value.length+1) + (top-scrollTop)) > bodyHeight
							&& height*(self.data.value.length) < (top-scrollTop) ) {
						/*
						 * 下拉列表向上展开情况
						 */
						self.itemContainer.css({
							position: "absolute",
							width: width,
							left: left,
							top: top - (height*self.data.value.length)
						});
						
					} else {
						/*
						 * 下拉列表向下展开情况
						 */
						self.itemContainer.css({
							position: "absolute",
							width: width,
							left: left,
							top: top + (options.top ? options.top : height)
						});
						
					}
				},
				
				/*
				 * 初始化相关元素的事件
				 */
				_initEvent: function() {
					var self = this;
					self.listIsOpen = false;
					
					self.viewContainer.add(self.arrowDown).click(function(event) {
						/*
						 * 解决页面中多个jSelect插件同时出现下拉情况
						 */
						var temp = self.listIsOpen;
						$(document).click();
						self.listIsOpen = temp;
						
						self.itemContainer.find("li").removeClass(options.liActive)
						.eq(self.currentIndex).addClass(options.liActive);
						
						if ( self.listIsOpen ) {
							self.itemContainer.hide();
							self.listIsOpen = false;
							
						} else {

							var left = self.sContainer.offset().left,
								top = self.sContainer.offset().top,
								width = options.width,
								height = options.height,
								bodyHeight = document.documentElement.clientHeight,
								scrollTop = document.documentElement.scrollTop;
							
							self._setItemUlPosition(left, top, width, height, bodyHeight, scrollTop);

							self.itemContainer.show();
							self._initScrollbarPosition();
							self.listIsOpen = true;
							
						}
						
						event.stopPropagation();
					});
					
					self.itemContainer.find("li").each(function(i) {
						$(this).click(function() {
							self.switchTo(i);
						});
					});
					
				},
				
				/*
				 * 定义键盘事件，操作下拉条目
				 */
				_inintKeyboardEvent: function() {
					var self = this;
					$(document).keydown(function(event) {
						if ( self.listIsOpen ) {
							var code = event.keyCode;
							if ( code === 37 || code === 38 ) {
								/*
								 * 向上去一个条目项
								 */
								self.goPrev();
								event.preventDefault();
							} else if ( code === 39 || code === 40 ) {
								/*
								 * 向上去一个条目项
								 */
								self.goNext();
								event.preventDefault();
							} else if ( code === 13 ) {
								/*
								 * 选择当前条目
								 */
								if ( self.currentIndex === self.index ) {
									self._setChangeStatus(self.currentIndex);
									
								} else {
									self._setChangeStatus(self.index);
									
									self.currentIndex = self.index;
									self.currentPrevNum = self.prevNum;
									self.currentNextNum = self.nextNum;
									
								}
								/*
								 * 取消下拉状态
								 */
								self.itemContainer.hide();
								self.listIsOpen = false;
								
							} else if ( code === 27 ) {
								/*
								 * 取消下拉状态
								 */
								self._hideUlList();
								
							}
						}
					})
					.click(function(e) {
						/*
						 * 取消下拉状态
						 */
						self._hideUlList();
						e.stopPropagation();
					});
				},
				/*
				 * 取消下拉状态
				 */
				_hideUlList: function() {
					var self = this;
					self.itemContainer.hide();
					self.listIsOpen = false;
				},
				
				/*
				 * 定义window大小改变时jSelect位置
				 */
				_initWindowResize: function() {
					var self = this;
					/*
					 * 取消下拉状态
					 */
					self._hideUlList();
				},
				
				/*
				 * 初始化操作
				 */
				_init: function() {
					var self = this;
					/*
					 * 取出select内数据，并存储
					 */
					self._initData();
					/*
					 * 构造插件的html结构
					 */
					self._initStructure();
					/*
					 * 设置插件标签位置和表现
					 */
					self._initPosition();
					/*
					 * 添加事件
					 */
					self._initEvent();
					/*
					 * 定义window大小改变时jSelect位置
					 */
					$(window).resize(function() {
						self._initWindowResize();
					});
					
					/*
					 * 隐藏要应用插件的select元素
					 */
					self.select.hide();
					/*
					 * 添加键盘事件
					 */
					self._inintKeyboardEvent();
					/*
					 * 插件准备就绪，显示并使用
					 */
					self.sContainer.show();
				},
				
				goPrev: function() {
					this.switchTo(-1, true);
				},
				goNext: function() {
					this.switchTo(1, true);
				},
				
				/*
				 * 跳转到相关条目
				 */
				switchTo: function(index, param) {
					var self = this,
						bool = param || false;
					if ( bool ) {
						/*
						 * 有两个参数的情况，即param为true的情况，index为1时向下走一个条目，为-1时向上走一个条目
						 */
						if ( self.prevNum == 0 && index < 0 ) {
							return;
							
						} else if ( self.nextNum == 0  && index > 0 ) {
							return;
							
						} else {
							
							self.index += index;
							self.prevNum += index;
							self.nextNum -= index;
							
							self.currentIndex = self.index;
							self.currentPrevNum = self.prevNum;
							self.currentNextNum  = self.nextNum;
							
						}
						
						self.itemContainer.find("li").removeClass(options.liActive);
						self.itemContainer.find("li").eq(self.currentIndex).addClass(options.liActive);
						
						var value = self.itemContainer.find("li").eq(self.currentIndex).attr("list-value"),
							txt = self.itemContainer.find("li").eq(self.currentIndex).html();
						self.viewContainer.html(txt);
						self.setValue(value);
						
						self._resizeScrollbar();
						
					} else {
						/*
						 * 只有一个参数的情况，即param为false的情况，直接跳转到指定的条目数
						 */			
						self.currentIndex = self.index = index;
						self.currentPrevNum = self.prevNum = index;
						self.currentNextNum = self.nextNum = self.data.value.length-index-1;

						self._setChangeStatus(self.currentIndex);
					}

				},
				
				/*
				 * 设置触发查change事件之前的数据
				 */
				_setChangeStatus: function(index) {
					var self = this,
						value = self.itemContainer.find("li").eq(index).attr("list-value"),
						txt = self.itemContainer.find("li").eq(index).html();
					self.viewContainer.html(txt);
					self.setValue(value);
					
					if ( self.temptIndex !== index ) {
						self.toChange();
					}
					self.temptIndex = index;
					
					self.itemContainer.hide();
					self.itemContainer.find("li").eq(index).addClass(options.liActive);
					self.listIsOpen = false;
				},
				
				/*
				 * 设置控件（原select）的value值
				 */
				setValue: function(value) {
					this.select.val( value );
				},
				
				/*
				 * 触发控件（原select）的onchange事件
				 */
				toChange: function() {
					this.select.change();
				},
				
				/*
				 * 调整滚动条的位置
				 */
				_resizeScrollbar: function() {
					var self = this,
						countTime,
						ulViewHeight = options.height*options.maxItems;
					/*
					 * 向下滚动情况
					 */
					if ( (self.currentIndex+1)*options.height > 
							ulViewHeight + self.itemContainer.scrollTop() ) {	//当前条目下的整个ul高度大于ul可视区域和滚动条高度的总和
						clearTimeout(countTime);
						self.mouseoverCanUseful = false;
						self.itemContainer.scrollTop( ((self.currentIndex+1)-options.maxItems)*options.height );
						countTime = setTimeout(function() {
							self.mouseoverCanUseful = true;
						}, 3000);
					}
					/*
					 * 向上滚动情况
					 */
					if ( ulViewHeight+self.currentIndex*options.height <
							ulViewHeight + self.itemContainer.scrollTop() ) {	//当前条目下的整个ul高度小于ul可视区域和滚动条高度的总和
						clearTimeout(countTime);
						self.mouseoverCanUseful = false;
						self.itemContainer.scrollTop( self.currentIndex*options.height );
						countTime = setTimeout(function() {
							self.mouseoverCanUseful = true;
						}, 3000);
					}
				},
				
				/*
				 * 下拉项打开时设定滚动条位置
				 */
				_initScrollbarPosition: function() {
					var self = this;
					if ( options.maxItems ) {
						if ( self.currentIndex + 1 < options.maxItems ) {
							self.itemContainer.scrollTop(0);
							
						} else {
							self.itemContainer.scrollTop( (self.currentIndex+1-options.maxItems)*options.height );
							
						}
					}
				}
			};
			/*
			 * 创建新的select控件对象
			 */
			$.each(this, function(i,o) {
				new SelectObj(o);
			});
		}
	});
})(jQuery);