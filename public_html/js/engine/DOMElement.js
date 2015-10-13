LEEWGL.REQUIRES.push('DOMElement');

LEEWGL.DOM = {};

LEEWGL.DOM.Element = function(type, attributes) {
  this.e = null;

  if (typeof type === 'object' && type !== null) {
    if (typeof type.length !== 'undefined') {} else {
      this.e = type;
    }
  } else {
    this.e = document.createElement(type);
  }

  this.set(attributes);
};

LEEWGL.DOM.Element.prototype = {
  constructor: LEEWGL.DOM.Element,

  getParent: function() {
    if (typeof this.e.parentNode !== 'undefined')
      return new LEEWGL.DOM.Element(this.e.parentNode);
    else
      console.error('LEEWGL.DOM.Element.getParent(): Element has no parent!');
    return null;
  },

  getChildren: function(search) {
    if (typeof this.e.children !== 'undefined') {
      var children = [];
      for (var i = 0; i < this.e.children.length; ++i) {
        if (typeof search !== 'undefined') {
          if (this.e.children[i].tagName.toLowerCase() === search.toLowerCase())
            children.push(new LEEWGL.DOM.Element(this.e.children[i]));
        } else {
          children.push(new LEEWGL.DOM.Element(this.e.children[i]));
        }
      }
      return children;
    } else {
      console.error('LEEWGL.DOM.Element.getParent(): Element has no child nodes!');
      return null;
    }
  },

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
      if (typeof type === 'undefined' || typeof value === 'undefined' || value === null)
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

  insert: function(parent, child, where) {
    if (where === 'bottom')
      parent.appendChild(child);
    else if (where === 'top')
      parent.insertBefore(child, parent.firstChild);
    else if (where === 'before')
      parent.insertBefore(child, parent.lastChild);
  },

  grab: function(element, where) {
    where = (typeof where !== 'undefined') ? where : 'bottom';

    if(element instanceof Array) {
      for(var i = 0; i < element.length; ++i) {
        this.grab(element[i], where);
      }
      return;
    }

    var el = (element instanceof LEEWGL.DOM.Element) ? element.e : element;
    this.insert(this.e, el, where);
  },

  inject: function(parent, where) {
    where = (typeof where !== 'undefined') ? where : 'bottom';
    var p = (parent instanceof LEEWGL.DOM.Element) ? parent.e : parent;
    this.insert(p, this.e, where);
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

  empty: function() {
    this.set('html', '');
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
    var isBody = (tmp.e === document.body);

    var size = {
      'width': parseInt(tmp.e.offsetWidth),
      'height': parseInt(tmp.e.offsetHeight),
      'display-width': (isBody === true) ? parseInt(window.innerWidth) : parseInt(tmp.e.clientWidth),
      'display-height': (isBody === true) ? parseInt(window.innerHeight) : parseInt(tmp.e.clientHeight),
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

    var element = this;
    var tmp = this.clone();

    if (inserted === false) {
      element = new LEEWGL.DOM.Element(element.e.cloneNode(true), {
        'styles': {
          'display': 'block',
          'position': 'static'
        }
      });
      parent.grab(element);
      tmp = element.clone();
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

  getScroll: function() {
    return {
      'x' : (window.pageXOffset || this.e.scrollLeft) - (this.e.clientLeft || 0),
      'y' : (window.pageYOffset || this.e.scrollTop) - (this.e.clientTop || 0)
    };
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
