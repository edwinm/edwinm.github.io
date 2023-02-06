/**!
 @preserve miq 1.11.1
 @copyright 2016 Edwin Martin
 @see {@link http://www.bitstorm.org/javascript/miq/}
 @license MIT
 */
var isLoaded;

/**
 * Miq, the micro jQuery library
 */
(function () {
    isLoaded = true;
    var miq = function(arg, doc) {
        doc = doc && doc.first || doc || document;

        // $(function() {...})
        if (typeof arg == 'function') {
            if (doc.readyState === 'loading') {
                doc.addEventListener('DOMContentLoaded', arg);
            } else {
                arg();
            }
        } else {
            var ret = Object.create(miq.fn), match;

            // $([domObject]) or $(miqObject)
            if (typeof arg == 'object') {
                if ('length' in arg) {
                    ret.length = arg.length;
                    for (var i = 0; i < arg.length; i++) {
                        ret[i] = arg[i];
                    }

                    // $(domObject)
                } else {
                    ret[0] = arg;
                    ret.length = 1;
                }

                // $()
            } else if (!arg) {
                ret[0] = doc.createDocumentFragment();
                ret.length = 1;

                // $('<div>')
            } else if ((match = arg.match(/<(.+)>/))) {
                ret[0] = doc.createElement(match[1]);
                ret.length = 1;

                // $('div.widget')
            } else {
                ret = miq(doc.querySelectorAll(arg));
            }

            return ret;
        }
    };

    miq.fn = Object.create(Array.prototype, {
        first: {get: function() {
            return this[0];
        }},

        eq: {value: function(i) {
            return miq(this[i||0]);
        }},

        on: {value: function(evt, fn) {
            for (var i = 0; i < this.length; i++) {
                this[i].addEventListener(evt, fn);
            }
            return this;
        }},

        off: {value: function(evt, fn) {
            for (var i = 0; i < this.length; i++) {
                this[i].removeEventListener(evt, fn);
            }
            return this;
        }},

        addClass: {value: function(cls) {
            for (var i = 0; i < this.length; i++) {
                if(!miq.fn.hasClass.call({first: this[i]}, cls)) {
                    this[i].className += ' ' + cls;
                }
            }
            return this;
        }},

        removeClass: {value: function(cls) {
            for (var i = 0; i < this.length; i++) {
                this[i].className = this[i].className.replace(cls, '');
            }
            return this;
        }},

        hasClass: {value: function(cls) {
            return this.first.className !== '' && new RegExp('\\b' + cls + '\\b').test(this.first.className);
        }},

        prop: {value: function(property, value) {
            if (typeof value == 'undefined') {
                return this.first[property];
            } else {
                for (var i = 0; i < this.length; i++) {
                    this[i][property] = value;
                }
                return this;
            }
        }},

        attr: {value: function(property, value) {
            if (typeof value == 'undefined') {
                return this.first.getAttribute(property);
            } else {
                for (var i = 0; i < this.length; i++) {
                    this[i].setAttribute(property, value);
                }
                return this;
            }
        }},

        removeAttr: {value: function(property) {
            for (var i = 0; i < this.length; i++) {
                this[i].removeAttribute(property);
            }
            return this;
        }},

        val: {value: function(value) {
            var el = this.first;
            var prop = 'value';

            switch (el.tagName) {
                case 'SELECT':
                    prop = 'selectedIndex';
                    break;
                case 'OPTION':
                    prop = 'selected';
                    break;
                case 'INPUT':
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        prop = 'checked';
                    }
                    break;
            }

            return this.prop(prop, value);
        }},

        append: {value: function(value) {
            var t = this, v = miq(value), len = v.length;

            for (var i = 0; i < len; i++) {
                t.first.appendChild(v[i].first || v[i]);
            }
            return this;
        }},

        before: {value: function(value) {
            this.first.parentElement.insertBefore(miq().append(value).first, this.first);
            return this;
        }},

        parent: {value: function() {
            return miq(this.first.parentNode);
        }},

        clone: {value: function() {
            return miq(this.first.cloneNode(true));
        }},

        remove: {value: function() {
            for (var i = 0; i < this.length; i++) {
                this[i].parentNode.removeChild(this[i]);
            }
            return this;
        }},

        find: {value: function(value) {
            return miq(value, this.first);
        }},

        closest: {value: function(selector) {
            var el = this.first;
            do {
                if (el[miq.matches](selector)) {
                    return miq(el);
                }
                el = el.parentElement;
            } while (el);
            return null;
        }},

        is: {value: function(selector) {
            return miq(this.filter(function(el) {
                return el[miq.matches](selector);
            }));
        }},

        css: {value: function(property, value) {
            if (typeof value == 'undefined') {
                return this.first.style[property];
            } else {
                for (var i = 0; i < this.length; i++) {
                    this[i].style[property] = value;
                }
                return this;
            }
        }},

        html: {value: function(value) {
            return this.prop('innerHTML', value);
        }},

        text: {value: function(value) {
            return this.prop('textContent', value);
        }}
    });

    miq.miq = '1.10.0';

    miq.ajaxCallback = function(url, resolve, reject, options) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = function () {
            var result;
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    switch(options.dataType) {
                        case 'xml':
                            result = xmlHttp.responseXML;
                            break;
                        case 'json':
                            result = JSON.parse(xmlHttp.responseText);
                            break;
                        default:
                            result = xmlHttp.responseText;
                            break;
                    }
                    resolve(result);
                } else if (reject) {
                    reject('Ajax error: ' + xmlHttp.status);
                }
            }
        };
        xmlHttp.open(options.method || 'GET', url, true);
        if (options.headers) {
            for (var key in options.headers) {
                xmlHttp.setRequestHeader(key, options.headers[key]);
            }
        }
        xmlHttp.send(options.data || '');
    };

    miq.ajax = function(url, options) {
        return new Promise(function (resolve, reject) {
            miq.ajaxCallback(url, resolve, reject, options);
        });
    };

    miq.matches = ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector'].filter(function(sel) {
        return sel in document.documentElement;
    })[0];

    // Support MD and CommonJS module loading
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return miq;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = miq;
    } else if (typeof $ == 'undefined') {
        $ = miq;
    }
})();


(function() {
	var controls = {
		speed: {
			min: 0,
			max: 1000
		},
		top: {
			min: 0,
			max: 1000
		},
		height: {
			min: 0,
			max: 1000
		},
		width: {
			min: 1,
			max: 5000
		},
		slope: {
			min: 0,
			max: 1000
		},
		stroke: {
			min: 0,
			max: 1000
		},
		hue: {
			min: 0,
			max: 255
		},
		saturation: {
			min: 0,
			max: 1000
		},
		luminance: {
			min: 0,
			max: 1000
		},
		opacity: {
			min: 0,
			max: 1000
		}
	};

	var params = [{
		"speed": 20,
		"top": 244,
		"width": 1000,
		"stroke": 275,
		"slope": 207,
		"height": 96,
		"hue": 78,
		"saturation": 739,
		"luminance": 370,
		"opacity": 200
	}, {
		"speed": 61,
		"top": 289,
		"width": 700,
		"stroke": 146,
		"slope": 207,
		"height": 44,
		"hue": 53,
		"saturation": 574,
		"luminance": 219,
		"opacity": 296
	}, {
		"speed": 12,
		"top": 177,
		"width": 800,
		"stroke": 40,
		"slope": 207,
		"height": 33,
		"hue": 26,
		"saturation": 1000,
		"luminance": 549,
		"opacity": 346
	}];

	var panelsN = 3;
	var x = [0, 0, 0];
	var line = [$('#swirl1'), $('#swirl2'), $('#swirl3')];
	var svg = $('.swirls');
	var startTime = new Date().valueOf();

	var el = $('<div>').addClass('controls').addClass('hidden');

	for (var p = 0; p < panelsN; p++) {
		var panel = createPanel(p);
		el.append(panel);
		panelChange(p);
		redraw(p);
	}
	$(document.body).append(el);

	if (!navigator.userAgent.match(/Edge|MSIE/)) {
		setTimeout(function() {
			$('.controls').removeClass('hidden');
		}, 10);
	}

	requestAnimationFrame(animationTick);

	keyHandler();

	function makeBezier(x, y, width, w, h, n) {
		var path = "M" + x + " " + y;

		for (var wave = 0; wave < n; wave++) {
			path += " C " + (wave * width + x + w) + " " + (y + h) + ", " + (wave * width + x + width / 2 - w) + " " + (y + h) + ", " + (wave * width + x + width / 2) + " " + y
				+ " C " + (wave * width + x + width / 2 + w) + " " + (y - h) + ", " + (wave * width + x + width - w) + " " + (y - h) + ", " + (wave * width + x + width) + " " + y;
		}

		return path;
	}

	function redraw(p) {
		var bezier = makeBezier(-params[p].stroke, params[p].top, params[p].width, params[p].slope * params[p].width / 1000, params[p].height, Math.ceil(1000 / params[p].width) + 2);
		var color = "hsla(" + params[p].hue + ", " + (params[p].saturation / 10) + "%, " + (params[p].luminance / 10) + "%, " + (params[p].opacity / 1000) + ")";

		line[p] = $(document.createElementNS("http://www.w3.org/2000/svg", 'path'))
			.attr("d", bezier)
			.attr("stroke-width", params[p].stroke)
			.attr("fill", "transparent")
			.attr("stroke", color);

		$('.swirls path').remove();
		for (var i = 0; i < line.length; i++) {
			svg.append(line[i]);
		}
	}

	function createPanel(p) {
		var panel = $('<div>').addClass('panel').attr('data-panel', p);
		for (name in controls) {
			var control = controls[name];
			var input = $('<input>').attr('type', 'range').attr('min', control.min).attr('max', control.max).attr('name', name);
			input.val(params[p][name]);
			var label = $('<label>').text(name).append(input);
			panel.append(label);

			input.on('input', function () {
				panelChange(p);
				redraw(p);
			});
		}
		return panel;
	}

	function panelChange(p) {
		$('[data-panel="' + p + '"] input[type=range]').forEach(function (input) {
			params[p][$(input).attr('name')] = parseInt($(input).val(), 10);
		});
	}

	function animationTick() {
		var newTime = new Date().valueOf();
		var ms = newTime - startTime;
		startTime = newTime;
		for (var p = 0; p < panelsN; p++) {
			x[p] -= params[p].speed * ms / 2000;
			if (x[p] < -params[p].width) {
				x[p] += params[p].width;
			}
			line[p].attr('transform', 'translate(' + x[p] + ')');
		}
		requestAnimationFrame(animationTick);
	}
})();


