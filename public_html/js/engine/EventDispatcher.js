function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload)
        oldonload();
      func();
    };
  }
}

LEEWGL.REQUIRES.push('EventDispatcher');

LEEWGL.EventDispatcher = function() {
  this.listeners = undefined;
};

LEEWGL.EventDispatcher.prototype = {
  constructor: LEEWGL.EventDispatcher,
  apply: function(object) {
    object.addEventListener = LEEWGL.EventDispatcher.prototype.addEventListener;
    object.hasEventListener = LEEWGL.EventDispatcher.prototype.hasEventListener;
    object.hasEventListenerType = LEEWGL.EventDispatcher.prototype.hasEventListenerType;
    object.removeEventListener = LEEWGL.EventDispatcher.prototype.removeEventListener;
    object.removeEventListenerType = LEEWGL.EventDispatcher.prototype.removeEventListenerType;
    object.dispatchEvent = LEEWGL.EventDispatcher.prototype.dispatchEvent;
  },
  addEventListener: function(type, listener) {
    if (this.listeners === undefined)
      this.listeners = {};
    var listeners = this.listeners;

    if (listeners[type] === undefined)
      listeners[type] = [];

    if (listeners[type].indexOf(listener) === -1)
      listeners[type].push(listener);
  },
  hasEventListener: function(type, listener) {
    if (this.listeners === undefined)
      return false;
    var listeners = this.listeners;

    if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1)
      return true;
    return false;
  },
  hasEventListenerType: function(type) {
    if (this.listeners === undefined)
      return false;
    var listeners = this.listeners;

    if (listeners[type] !== undefined)
      return true;
    return false;
  },
  removeEventListener: function(type, listener) {
    if (this.listeners === undefined)
      return;

    var listeners = this.listeners;
    var listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      var index = listenerArray.indexOf(listener);
      if (index !== -1)
        listenerArray.splice(index, 1);
      else
        this.listeners = {};
    }
  },
  removeEventListenerType: function(type) {
    if (this.listeners === undefined)
      return;

    var listeners = this.listeners;
    var listenerArray = listeners[type];

    if (listenerArray !== undefined)
      this.listeners[type] = [];
  },
  dispatchEvent: function(event, bind) {
    if (this.listeners === undefined)
      return;

    bind = (typeof bind !== 'undefined') ? bind : this;

    var listeners = this.listeners;
    var listenerArray = listeners[event.type];

    if (listenerArray !== undefined) {
      event.target = bind;

      var array = [];
      var length = listenerArray.length;

      for (var i = 0; i < length; ++i) {
        array[i] = listenerArray[i];
      }

      for (i = 0; i < length; ++i) {
        array[i].call(bind, event);
      }
    }
  }
};

window.addEventListener('load', function() {
  LEEWGL.EventDispatcher.prototype.apply(Window.prototype);
});
