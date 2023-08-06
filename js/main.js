;(($, win)=> {
	"use strict";
	if(type($)!=='function') {
		return console.error("Can't use jQuery!");;
	}
	let pp = console.log;
	let pd = console.dir;
	function type() {
		return arguments[0] && typeof arguments[0];
	}
	function isJQuery() {
		if(!arguments[0] || type(arguments[0])!=='object') {
			return false;
		}
		return 'jquery' in arguments[0] && arguments[0].length;
	}
	function isElement() {
		return isObject(arguments[0]) && (arguments[0] instanceof Element || arguments[0] instanceof HTMLElement);
	}
	function isString() {
		return type(arguments[0])==='string';
	}
	function isStrings() {
		return isString(arguments[0]) && arguments[0].trim()!=='';
	}
	function isArray() {
		return isObject(arguments[0]) && arguments[0] instanceof Array;
	}
	function isArrays() {
		return isArray(arguments[0]) && arguments[0].length;
	}
	function isObject() {
		return typeof arguments[0]=='object' && arguments[0]!=null;
	}
	function isObjects() {
		return isObject(arguments[0]) && (Object && Object.keys(arguments[0]).length);
	}
	function isFunction() {
		return type(arguments[0])==='function';
	}
	function isNull() {
		return !(arguments[0]!=null && arguments[0]!=undefined);
	}
	function inObject() {
		if(!isStrings(arguments[0]) || !isObjects(arguments[1])) {
			return false;
		}
		return arguments[0] in arguments[1];
	}
	function explode() {
		let separator = arguments[0] || null;
		const str = arguments[1] || null;
		if(!isStrings(str)) {
			return;
		}
		if(isNull(separator) && !isStrings(separator)) {
			separator = ' ';
		}
		return str.split(separator);
	}
	function implode() {
		let separator = arguments[0] || null;
		const ary = arguments[1] || null;
		if(!isArrays(ary)) {
			return;
		}
		if(!isStrings(separator)) {
			separator = ' ';
		}
		return ary.join(separator);
	}
	function toNumber() {
		if(typeof arguments[0]!='string' || arguments[0]=='' || !/^(\d|\.)+$/i.test(arguments[0])) {
			return arguments[0];
		}
		if(arguments[0].indexOf('.')!=-1){
			return parseFloat(arguments[0]);
		}
		return parseInt(arguments[0], 10);
	}
// extend new function to jquery
	$.extend($.fn, {
		reverseEach: function() {
			const callback = arguments[0];
			if((this && !this.length) || !isFunction(callback)) {
				return;
			}
			let i = this.length;
			while(i--) {
				callback.call(this[i], i, this[i]);
			}
		}
	});
	$.extend($, {
		reverseEach: function() {
			if((!isArrays(arguments[0]) || !isObjects(arguments[0])) || !isFunction(arguments[1])) {
				return;
			}
			return this.fn.reverseEach.apply(arguments[0], [arguments[1]]);
		}
	});
	if(Object && typeof Object.defineProperty==='function') {
// add capitalize to String
		Object.defineProperty(String.prototype, 'capitalize', {
			value: function() {
				return (arguments[0] && (arguments[0]===true || arguments[0]===1) ? this.toLowerCase() : this).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
			},
			enumerable: false
		});
// add combine to Array
		Object.defineProperty(Array.prototype, 'combine', {
			value: function() {
				if(typeof Object.fromEntries!=='function' || !this || !this.length) {
					return;
				}
				const data = arguments[0] || null;
				if(!(typeof arguments[0]=='object' && arguments[0] instanceof Array) || !arguments[0].length || this.length!==arguments[0].length) {
					return;
				}
				let type = arguments[1] || null;
				if([0, 1].indexOf(type)===-1) {
					type = 0;
				}
				let options = [this, data];
				if(type===1) {
					options.reverse();
				}
				const transpose = (r, a)=> a.map((v, i)=> [...(r[i] || []), v]);
				return Object.fromEntries(options.reduce(transpose, []));
			},
			enumerable: false
		});
	}

	const MEM_KEY_BEGIN = 'sero-github-page-';
	function getStorageItem() {
		if(!isStrings(arguments[0]) || !isObject(localStorage) || !isFunction(localStorage.getItem)) {
			return;
		}
		return localStorage.getItem(MEM_KEY_BEGIN + arguments[0]);
	}
	function setStorageItem() {
		if(!isStrings(arguments[0]) || !isObject(localStorage) || !isFunction(localStorage.setItem)) {
			return false;
		}
		localStorage.setItem(MEM_KEY_BEGIN + arguments[0], arguments[1] || '');
		return true;
	}

	let main = function() {
		return new main.fn.init();
	};
	main.fn = main.prototype = {
		constructor: main,
		inited: false,
		lang: 'en',
		dataSource: './js/data.json',
		data: null,
		cache: null,
		vue: {},
		elements: {},
		sectionObserver: null,
		init: function() {
			const self = main.fn.getSelf(this);
			const name = 'init';
			self.addElement($('body>.loader'), 'loader');
			return self.start();
		},
		getElement: function() {
			const self = main.fn.getSelf(this);
			const name = 'getElement';
			const key = arguments[0] || null;
			if(!isStrings(key) || !inObject(key, self.elements)) {
				return;
			}
			return self.elements[key];
		},
		removeElement: function() {
			const self = main.fn.getSelf(this);
			const name = 'removeElement';
			const key = arguments[0] || null;
			if(!isStrings(key) || !inObject(key, self.elements)) {
				return self;
			}
			delete self.elements[key];
			return self;
		},
		addElement: function() {
			const self = main.fn.getSelf(this);
			const name = 'addElement';
			let key = arguments[0] || null;
			let id = arguments[1] || null;
			const force = arguments[2] || null;
			if((isStrings(key) && key.indexOf(',')!==-1) || isArrays(key)) {
				if(isStrings(key)) {
					key = explode(',', key);
				}
				key.forEach((k)=> {
					if(isStrings(k) && (/^\s/.test(k) || /\s$/.test(k))) {
						k = k.trim();
					}
					self.addElement(k);
				});
				return self;
			}
			if(!isStrings(key) && !isElement(key) && !isJQuery(key)) {
				return self;
			}
			if(isStrings(key) || isElement(key)) {
				key = $(key);
			}
			if(!isJQuery(key)) {
				return self;
			}
			if(!isStrings(id)) {
				if(isStrings(key.attr('id'))) {
					id = key.attr('id');
				}else if(isStrings(key[0].tagName)) {
					id = key[0].tagName;
				}
			}
			if(isStrings(id) && isJQuery(key)) {
				if(!inObject(id, self.elements) || (force===true && inObject(id, self.elements))) {
					self.elements[id] = key;
				}
			}
			return self;
		},
		loaderHide: function() {
			if(main.fn.elements.loader.is(':hidden')) {
				return;
			}
			return main.fn.elements.loader.animate({opacity: 0}, 500, function() {$(this).removeAttr('style').hide()});
		},
		loaderShow: function() {
			if(main.fn.elements.loader.is(':visible')) {
				return;
			}
			return main.fn.elements.loader.show();
		},
		toTop: function(e) {
			e.preventDefault();
			$('html, body').stop().animate({scrollTop: 0}, 100);
		},
		getSelf: function() {
			return arguments[0] && arguments[0]===main.fn ? arguments[0] : main.fn;
		},
		listen: {
			load: {
				photoswipe: function() {
					let thisElement = $(this);
					if(!thisElement.attr('data-photoswipe-width') && !isNull(this.naturalWidth)) {
						thisElement.attr('data-photoswipe-width', this.naturalWidth);
					}
					if(!thisElement.attr('data-photoswipe-height') && !isNull(this.naturalHeight)) {
						thisElement.attr('data-photoswipe-height', this.naturalHeight);
					}
				}
			}
		},
		viewPhoto: function() {
			if(!isElement(this)) {
				return;
			}
			const self = main.fn.getSelf();
			const name = 'viewPhoto';
			const thisElement = $(this);
			const sectionBox = thisElement.parents('section');
			const src = thisElement.data('src') || (thisElement.attr('src') || null);
			if(!isJQuery(sectionBox) || !isStrings(src)) {
				return;
			}
			const list = sectionBox.find('.photoswipe-image').filter(function() {
				return $(this).data('src') || $(this).attr('src');
			});
			if(!isJQuery(list)) {
				return;
			}
			let index, items, waits, callWait;
			const callPhoto = function() {
				const options = {
					dataSource: items,
					bgOpacity: .85,
					showHideOpacity: true,
					wheelToZoom: true,
					padding: {top: 15, left: 15, right: 15, bottom: 15},
					preloaderDelay: 0,
					// allowPanToNext: false,
					loop: false,
					index: index
				};
				const PSWP = new PhotoSwipe(options);
				PSWP.init();
				index = items = waits = callWait = undefined;
			};
			const callRun = function() {
				index = list.index(thisElement);
				items = list.map(function(i, el) {
					let v = $(el).attr('currentSrc') || ($(el).attr('src') || ($(el).data('src') || null));
					const w = toNumber($(el).attr('data-photoswipe-width')) || (el.naturalWidth || null);
					const h = toNumber($(el).attr('data-photoswipe-height')) || (el.naturalHeight || null);
					return {sourceElement: el, src: v, w: w, h: h};
				}).toArray();
				if(isFunction(arguments[0])) {
					arguments[0]();
				}
			};
			const checkImg = function() {
				if(!isElement(this) || ($(this).attr('data-photoswipe-width') && $(this).attr('data-photoswipe-height'))) {
					return;
				}
				const el = this;
				const s = $(el).data('src') || ($(el).attr('src') || null);
				if(!isStrings(s)) {
					return;
				}
				waits++;
				let newImage = new Image();
				newImage.onload = function() {
					let v = this.naturalWidth;
					if($.isNumeric(v)) {
						$(el).attr('data-photoswipe-width', v);
					}
					v = this.naturalHeight;
					if($.isNumeric(v)) {
						$(el).attr('data-photoswipe-height', v);
					}
					v = undefined;
					waits--;
					setTimeout(function(){newImage = undefined}, 100);
					if(waits===0 && isFunction(callWait)) {
						callWait();
					}
				};
				newImage.src = s;
			};
			const checkLoad = function() {
				if(!$.isNumeric(waits)) {
					waits = 0;
				}
				callWait = arguments[0] || null;
				if(isJQuery(list.not('[data-photoswipe-width][data-photoswipe-height]'))) {
					list.each((i, el)=> checkImg.call(el));
				}else {
					if(isFunction(callWait)) {
						callWait();
					}
				}
			};
			$.when((async()=> {
				await checkLoad(function() {
					callRun(callPhoto);
				});
			})()).then(()=> {
			});
		},
		setLang: function() {
			const self = main.fn.getSelf(this);
			const name = 'setLang';
			const support = explode(' ', 'en zh-tw');
			if(!isStrings(arguments[0])) {
				return false;
			}
			let val = arguments[0];
			if(support.indexOf(arguments[0])==-1) {
				val = 'en';
			}
			setStorageItem('lang', val);
			self.lang = val;
		//
			let tagLang = 'en';
			if(val=='zh-tw') {
				tagLang = 'zh-Hant';
			}
			$('html').attr('lang', tagLang);
			self.run();
			return true;
		},
		translate: function() {
			const self = main.fn.getSelf(this);
			const name = 'translate';
			const callBack = arguments[0] || null;
			const callEnd = function() {
				if(isFunction(callBack)) {
					callBack();
				}
			};
			if(!isArrays(self.data) && !isObjects(self.data)) {
				callEnd();
				return self;
			}
			let lang = self.lang || 'en';
			let data = {
				year: new Date().getFullYear(),
				cliLang: lang
			};
			let mainLang = null;
			if(inObject('lang', self.data) && isObjects(self.data.lang) && inObject(lang, self.data.lang)) {
				mainLang = $.extend(true, {}, self.data.lang[lang]);
			}
		// import some data and check
			$.each(['web', 'language', 'navbarTitle', 'cvImagesPath'], (i, k)=> {
				$.extend(data, {[k]: self.data[k] || null});
			});
		// start run translate
			return $.when((async()=> {
				if(!inObject('section', self.data)){
					return;
				}
				let sectionData = $.extend(true, {}, self.data.section);
				if(!isArray(sectionData)) {
					sectionData = Object.values(sectionData);
				}
			// first translate data
				await $.when($.each(sectionData, (idx, row)=> {
					if(!isObjects(row) || (!inObject('name', row) || !inObject('data', row))) {
						return;
					}
				//
					if(isObjects(mainLang) && !inObject('title', row) && inObject(row.name, mainLang)) {
						row.title = mainLang[row.name];
					}
				//
					if(lang=='en' || !inObject('lang', row) || isNull(row.lang)) {
						if(lang=='en' && inObject('lang', row)) {
							delete row.lang;
						}
						return;
					}
					const rowLang = row.lang;
					const rowName = row.name;
					let rowData = row.data;
				//
					if($.inArray(rowName, ['news', 'about'])!==-1 && inObject(lang, rowLang)) {
						$.extend(rowData, rowLang[lang]);
					}else {
						if(!inObject(lang, rowLang) || (!isObjects(rowLang[lang]) && !isArrays(rowLang[lang]))) {
							return;
						}
						if(/^history(.+)?/.test(rowName) && inObject('title', row)) {
							if(inObject('title', rowLang[lang])) {
								row.title = rowLang[lang].title;
							}
						}else {
							$.each(rowData, (i, col)=> {
								Object.keys(col).forEach((k1)=> {
									if(!inObject(k1, rowLang[lang]) || isNull(rowLang[lang][k1][i])) {
										return;
									}
									rowData[i][k1] = rowLang[lang][k1][i];
								});
							});
						}
					}
					delete row.lang;
					sectionData[idx] = row;
				})).then(()=> {
				// some push to data top
					$.reverseEach(sectionData, (idx, row)=> {
						if(!isObjects(row) || (!inObject('name', row) || !inObject('data', row)) || $.inArray(row.name, ['news', 'menu', 'card'])==-1) {
							return;
						}
						data[row.name] = row.data;
						sectionData.splice(idx, 1);
					});
				// push to cache.section
					data.section = sectionData;
				});
			})()).then(()=> {
				self.cache = data;
				callEnd();
				return self;
			});
		},
		extra: function() {
			const self = main.fn.getSelf(this);
			const name = 'extra';
			const callBack = arguments[0] || null;
			const callEnd = function() {
				if(isFunction(callBack)) {
					callBack();
				}
			};
			if((!isArrays(self.data) && !isObjects(self.data)) || !inObject('section', self.data) || !isArrays(self.data.section)) {
				callEnd();
				return self;
			}
			let data = $.extend(true, {}, self.data);
		//
			return $.when((async()=> {
				let cache = {};
			// section data extend to cache
				$.each(data.section, (i, v)=> {
					let val = $.extend(true, {}, v);
					$.extend(val.data, self.cache[v.name]);
					cache[v.name] = val;
				});
			// get only extra data
				let extraData = $.map(data.section, (v, i)=> {
					if(!isObjects(v) || !inObject('extra', v) || !isStrings(v.extra) || !inObject(v.extra, cache) || (!isArrays(v.data) && !isObjects(v.data))) {
						return;
					}
					return v;
				});
				if(!isArrays(extraData)) {
					return;
				}
			//
				$.each(extraData, (idx, row)=> {
					let addcols, addlang;
					$.each(row.data, (i1, v1)=> {
						if(!isObjects(v1) || (!inObject('title', v1) || !inObject('url', v1)) || !/^github/i.test(v1.title)) {
							return;
						}
						if(!isArray(addcols)) {
							addcols = [];
						}
						let v2 = v1.title.substr(v1.title.indexOf(' ') + 1);
						addcols.push({title: v2, url: v1.url, text: v2});
						if(inObject('lang', row)) {
							Object.keys(v1).forEach((k1)=> {
								if(!inObject(k1, row.lang) || (!isObjects(row.lang[k1]))) {
									return;
								}
								if(!isObject(addlang)) {
									addlang = {};
								}
								if(!isObject(addlang[k1])) {
									addlang[k1] = {};
								}
								$.each(row.lang[k1], (k2, v2)=> {
									if(!isArray(addlang[k1][k2])) {
										addlang[k1][k2] = [];
									}
									addlang[k1][k2].push(v2[i1]);
								});
							});
						}
					});
				//
					if(isArrays(addcols)) {
						cache[row.extra].data = cache[row.extra].data.concat(addcols);
					}
					if(isObjects(addlang)) {
						$.each(addlang, (k1, v1)=> {
							if((!isObjects(v1) && !isArrays(v1)) || !inObject(k1, cache[row.extra].lang)) {
								return;
							}
							$.each(v1, (k2, v2)=> {
								if(!inObject(k2, cache[row.extra].lang[k1])) {
									return;
								}
								cache[row.extra].lang[k1][k2] = cache[row.extra].lang[k1][k2].concat(v2);
							});
						});
					}
				});
			//
				$.each(cache, (k, v)=> {
					if(!isObjects(v) || !inObject(k, self.cache)) {
						return;
					}
					self.cache[k] = v.data;
				});
			})()).then(()=> {
				callEnd();
			});
			return self;
		},
		create: function() {
			const self = main.fn.getSelf(this);
			const name = 'create';
			if(!isArrays(self.cache) && !isObjects(self.cache)) {
				return self;
			}
			$.when((async()=> {
				let cache = $.extend(true, {}, self.cache);
				let methods = {
					updateData: function() {
						this._data = $.extend(true, {}, self.cache);
						this.$forceUpdate();
					}
				};
				const callEnd = function() {
				//update element
					self.addElement('#app,#spy', null, true);
					const app = self.getElement('app');
					const spy = self.getElement('spy');
					self.addElement(app.find('>main'), 'root');
					const main = self.getElement('root');
				//
					if(isNull(self.obViewer)) {
						self.obViewer = $.obViewer(main, {
							debug: true,
							selector: '*[id][data-viewer-title]'
						}, function() {
							// pp(this)
						});
					}else {
						self.obViewer.updated();
					}
				//
					const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
					if(inObject('tooltip', self)) {
						self.tooltip.map(el=> el.dispose());
					}
					self.tooltip = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
					// app.find('[data-bs-toggle="tooltip"]').tooltip();
				//
					app.find('.photoswipe-image').on('load', self.listen.load.photoswipe);
				//
					if(!inObject('lazy', self)) {
						self.lazy = new LazyLoad();
					}else {
						self.lazy.update();
					}
				};
				const skillLvAry = [
					'no idea',
					'learned',
					'average',
					'above average',
					'great',
					'awesome'
				];
				await $.each(['head', '#app'],  (idx, tag)=> {
					const el = $(tag);
					if(!isJQuery(el)) {
						return;
					}
					if(inObject(tag, self.vue) && isObjects(self.vue[tag])) {
						if(tag==='head') {
							return;
						}
						self.vue[tag].updateData();
						return;
					}
					let data = $.extend(true, {}, cache);
					let method = $.extend(true, methods);
					if(tag==='#app') {
						$.extend(method, {
							isUrl: function(url) {
								return /^http(s)*/.test(url);
							},
							toTop: function(e) {
								e.preventDefault();
								return self.toTop.call(this, e);
							},
							skillLevel: function(v) {
								let i = 0;
								if(v>=10 && v<40) {i = 1;}
								else if(v>=40 && v<60) {i = 2;}
								else if(v>=60 && v<80) {i = 3;}
								else if(v>=80 && v<100) {i = 4;}
								else if(v>=100) {i = 5;}
								return skillLvAry[i].capitalize();
							},
							viewPhoto: function(e) {
								e.preventDefault();
								let element = e.srcElement;
								if(!isElement(element)) {
									return;
								}
								return self.viewPhoto.call(element, e);
							},
							getHost: function(url) {
								if(!this.isUrl(url)) {
									return;
								}
								return new URL(url).hostname;
							},
							getCVImages: function(url) {
								return this.cvImagesPath + url;
							},
							getFavicon: function(url) {
								return "https://www.google.com/s2/favicons?domain=" + this.getHost(url);
							},
							getProgress: function(v) {
								return "width: " + v + "%";
							},
							setLang: function(e) {
								let element = e.srcElement;
								if(!isElement(element)) {
									return;
								}
								let newLang = $(element).data('lang');
								if(newLang===self.lang) {
									return;
								}
								self.setLang(newLang);
							}
						});
					}else if(tag==='head') {
						data = {
							web: data.web
						};
					}
					let options = {
						el: el[0],
						data: data,
						methods: method
					};
					if(tag==='#app') {
						$.extend(options, {
							mounted: function() {
								this.$nextTick(function() {
									callEnd();
								});
							},
							updated: function() {
								this.$nextTick(function() {
									callEnd();
								});
							}
						});
					}
					try {
						self.vue[tag] = new Vue(options);
					}catch(e) {
						console.error(name, "new Vue fail, detail=>", e);
					}
				});
			})()).then(()=> {
			});
			return self;
		},
		import: function() {
			const self = main.fn.getSelf(this);
			const name = 'import';
			const callBack = arguments[0] || null;
			const callEnd = function() {
				$.when((async()=> {
					await self.translate(()=> self.extra(()=> self.create()));
				})()).then(()=> {
					if(isFunction(callBack)) {
						callBack();
					}
				});
			};
			const callStart = (async()=> await callEnd());
			if(!isArrays(self.data) && !isObjects(self.data)) {
				const callAlways = function(response, textStatus) {
					if(textStatus!=="success" || isNull(response) || (!isArrays(response) && !isObject(response))) {
						return;
					}
					self.data = response;
					callStart();
				};
				const callRun = function() {
					try {
						$.getJSON(self.dataSource).always(callAlways);
					}catch(e) {
						console.error('import fail, detail=> ', e);
					}
				};
				callRun();
			}else {
				callStart();
			}
			return self;
		},
		run: function() {
			const self = main.fn.getSelf(this);
			const name = 'run';
			if(self.inited===true && isObjects(self.cache)) {
				self.cache = null;
			}
			return self.import(()=> self.end());
		},
		start: function() {
			const self = main.fn.getSelf(this);
			const name = 'start';
			let lang = getStorageItem('lang');
			if(!isStrings(lang)) {
				lang = self.lang;
				setStorageItem('lang', lang);
			}
			self.lang = lang;
			if(lang=='zh-tw') {
				$('html').attr('lang', 'zh-Hant');
			}
			return self.run();
		},
		end: function() {
			const self = main.fn.getSelf(this);
			const name = 'end';
			self.loaderHide();
			if(self.inited===false) {
				self.inited = true;
				$('html').attr('inited', 1);
			}
			return self;
		}
	};

	$(function() {
		win.Main = main();
	});

})(jQuery, window);