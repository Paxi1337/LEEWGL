LEEWGL.DOM = {};

LEEWGL.DOM.Element = function(type, attributes) {
    this.e = null;
    if (typeof type === 'object') {
        //     if (typeof type.length === 'undefined')
        //         this.e = type.cloneNode(true);
        //     else
        this.e = type;
    } else
        this.e = document.createElement(type);

    this.set(attributes);
};

LEEWGL.DOM.Element.prototype = {
    constructor: LEEWGL.DOM.Element,

    addClass: function(classname) {
        this.e.className += ' ' + classname;
    },

    hasClass: function(classname) {
        var classes = this.e.className;
        return (classes.search(classname) === -1) ? false : true;
    },

    removeClass: function(classname) {
        this.e.classList.remove(classname);
    },

    appendText: function(text) {
        this.set('text', this.get('text') + ' ' + text);
    },

    appendHTML: function(html) {
        this.set('html', this.get('html') + ' ' + html);
    },

    setAttribute: function() {
        if (typeof arguments[0] === 'object') {
            var attribute = arguments[0];
            for (var a in attribute) {
                this.e.setAttribute(a, attribute[a]);
            }
        } else {
            var name = arguments[0];
            var value = arguments[1];
            this.e.setAttribute(name, value);
        }
    },

    setAttributes: function() {
        if (typeof arguments[0] === 'object') {
            var attributes = arguments[0];
            for (var a in attributes) {
                this.setAttribute(a, attributes[a]);
            }
        } else {
            var name = arguments[0];
            var value = arguments[1];
            if (names.length !== values.length) {
                console.error('LEEWGL.DOM.Element.setAttributes: names and values must be same length arrays!');
                return false;
            }

            for (var i = 0; i < names.length; ++i) {
                this.setAttribute(names[i], values[i]);
            }
        }
    },

    getAttribute: function(name) {
        return this.e.getAttribute(name);
    },

    getAttributes: function(names) {
        var attributes = [];
        for (var i = 0; i < names.length; ++i) {
            attributes.push(this.getAttribute(names[i]));
        }
        return attributes;
    },

    removeAttribute: function(name) {
        this.e.removeAttribute(name);
    },

    removeAttributes: function(names) {
        for (var i = 0; i < names.length; ++i) {
            this.removeAttribute(names[i]);
        }
    },

    setStyle: function() {
        if (typeof arguments[0] === 'object') {
            var styles = arguments[0];
            for (var s in styles) {
                this.e.style[s] = styles[s];
            }
        } else {
            var name = arguments[0];
            var value = arguments[1];
            this.e.style[name] = value;
        }
    },

    setStyles: function() {
        if (typeof arguments[0] === 'object') {
            var styles = arguments[0];
            for (var s in styles) {
                this.setStyle(s, styles[s]);
            }
        } else {
            var names = arguments[0];
            var values = arguments[1];
            if (names.length !== values.length) {
                console.error('LEEWGL.DOM.Element.setStyles: names and values must be same length arrays!');
                return false;
            }

            for (var i = 0; i < names.length; ++i) {
                this.setStyle(names[i], values[i]);
            }
        }
    },

    getStyle: function(name) {
        var defaultView = document.defaultView;
        var style = window.getComputedStyle(this.e, null).getPropertyValue(name);

        if (style === '' || style === null)
            return null;
        else
            return style;
    },

    getStyles: function() {
        if (arguments.length === 0) {
            var defaultView = document.defaultView;
            var style = defaultView.getComputedStyle(this.e, null);
            return style;
        } else {
            var styles = [];
            for (var i = 0; i < names.length; ++i) {
                styles.push(this.getStyle(names[i]));
            }
            return styles;
        }
    },

    set: function() {
        var dispatch = (function(type, value) {
            if (typeof type === 'undefined' || typeof value === 'undefined')
                return;

            if (type === 'styles')
                this.setStyles(value);
            else if (type === 'events')
                this.addEvents(value);
            else if (type === 'html')
                this.e.innerHTML = value;
            else if (type === 'text')
                this.e.innerText = value;
            else
                this.setAttribute(type, value);
        }.bind(this));

        if (typeof arguments[0] === 'object') {
            var types = arguments[0];

            for (var type in types) {
                if (types.hasOwnProperty(type)) {
                    var value = types[type];
                    dispatch(type, value);
                }
            }
        } else {
            var t = arguments[0];
            var v = arguments[1];
            dispatch(t, v);
        }
    },

    get: function() {
        var dispatch = (function(type) {
            if (type === 'html')
                return this.e.innerHTML;
            else if (type === 'text')
                return this.e.innerText;
            else if (this.getAttribute(type) !== null)
                return this.getAttribute(type);
            else
                return this.getStyle(type);
        }.bind(this));

        if (arguments[0] instanceof Array) {
            var types = arguments[0];

            for (var i = 0; i < types.length; ++i) {
                dispatch(types[i]);
            }
        } else {
            var type = arguments[0];
            return dispatch(type);
        }
    },

    grab: function(parent, before) {
        before = (typeof before !== 'undefined') ? before : false;
        var p = (parent instanceof LEEWGL.DOM.Element) ? parent.e : parent;

        if (before === true)
            this.e.insertBefore(p);
        else
            this.e.appendChild(p);
    },

    inject: function(element, before) {
        before = (typeof before !== 'undefined') ? before : false;
        var e = (element instanceof LEEWGL.DOM.Element) ? element.e : element;

        if (before === true)
            e.insertBefore(this.e);
        else
            e.appendChild(this.e);
    },

    remove: function(parent) {
        parent = (typeof parent !== 'undefined') ? parent : this.e.parentNode;
        if (parent instanceof LEEWGL.DOM.Element)
            parent = parent.e;

        parent.removeChild(this.e);
        return this.e;
    },

    replace: function(element) {
        this.e.parentNode.replaceChild(element.e);
        return this.e;
    },

    size: function(inserted, parent) {
        inserted = (typeof inserted !== 'undefined') ? inserted : true;
        parent = (typeof parent !== 'undefined') ? parent : new LEEWGL.DOM.Element(document.body);

        var tmp = this.clone();

        if (inserted === false) {
            tmp = new LEEWGL.DOM.Element(tmp.e.cloneNode(true), {
                'style': {
                    'display': 'block',
                    'position': 'static'
                }
            });
            parent.grab(tmp);
        }

        var size = {
            'width': parseInt(tmp.e.offsetWidth),
            'height': parseInt(tmp.e.offsetHeight),
            'display-width': parseInt(tmp.e.clientWidth),
            'display-height': parseInt(tmp.e.clientHeight),
            'scroll-width': parseInt(tmp.e.scrollWidth),
            'scroll-height': parseInt(tmp.e.scrollHeight),
        };

        if (inserted === false)
            tmp.remove(parent);

        return size;
    },

    position: function(inserted, parent) {
        inserted = (typeof inserted !== 'undefined') ? inserted : true;
        parent = (typeof parent !== 'undefined') ? parent : new LEEWGL.DOM.Element(document.body);

        var element = this.e;
        var tmp = this.clone();

        if (inserted === false) {
            tmp = new LEEWGL.DOM.Element(this.e.cloneNode(true), {
                'style': {
                    'display': 'block',
                    'position': 'static'
                }
            });
            parent.grab(tmp);
        }

        var pos = {
            'x': 0,
            'y': 0
        };

        while (tmp.e) {
            pos.x += (tmp.e.offsetLeft - tmp.e.scrollLeft + tmp.e.clientLeft);
            pos.y += (tmp.e.offsetTop - tmp.e.scrollTop + tmp.e.clientTop);
            tmp.e = tmp.e.offsetParent;
        }

        if (inserted === false)
            element.remove(parent);

        return pos;
    },

    addEvent: function(type, callback) {
        this.e.addEventListener(type, callback);
    },

    addEvents: function(events) {
        for (var type in events) {
            this.addEvent(type, events[type]);
        }
    },

    removeEvent: function(type, callback) {
        this.e.removeEventListener(type, callback);
    },

    clone: function(element) {
        if (typeof element === 'undefined')
            element = new LEEWGL.DOM.Element(this.e);

        element.e = this.e;
        return element;
    }
};

LEEWGL.EventDispatcher.prototype.apply(LEEWGL.DOM.Element.prototype);
