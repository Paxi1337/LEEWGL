LEEWGL.REQUIRES.push('Object3D');

/**
 * [Object3D description]
 * @param  {object} options
 */
LEEWGL.Object3D = function(options) {
  this.options = {
    'alias': 'Object3D_' + LEEWGL.Object3DCount,
    'parent': undefined,
    'children': [],
    'components': {},
    'up': vec3.clone(LEEWGL.Object3D.DefaultUp),
    'inOutline': true,
    'draggable': true,
    'visible': true,
    'render': true,
    'needsUpdate': true
  };

  var extend = new LEEWGL.Class();
  extend.extend(LEEWGL.Object3D.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  Object.defineProperties(this, {
    'id': {
      value: LEEWGL.Object3DCount++,
      enumerable: false,
      writable: true
    },
    'alias': {
      value: this.options.alias,
      enumerable: true,
      writable: true
    },
    'type': {
      value: 'Object3D',
      enumerable: true,
      writable: true
    },
    'parent': {
      value: this.options.parent,
      enumerable: false,
      writable: true
    },
    'children': {
      value: this.options.children,
      enumerable: true,
      writable: true
    },
    'components': {
      value: this.options.components,
      enumerable: true,
      writable: true
    },
    'up': {
      value: this.options.up,
      enumerable: true,
      writable: true
    },
    'inOutline': {
      value: this.options.inOutline,
      enumerable: true,
      writable: true
    },
    'draggable': {
      value: this.options.draggable,
      enumerable: true,
      writable: true
    },
    'visible': {
      value: this.options.visible,
      enumerable: true,
      writable: true
    },
    'render': {
      value: this.options.render,
      enumerable: true,
      writable: true
    },
    'needsUpdate': {
      value: this.options.needsUpdate,
      enumerable: true,
      writable: true
    }
  });

  this.addComponent(new LEEWGL.Component.Transform());
  this.transform = this.components['Transform'];
};

LEEWGL.Object3D.DefaultUp = [0.0, 1.0, 0.0];

LEEWGL.Object3D.prototype = {
  constructor: LEEWGL.Object3D,
  onInit: function() {

  },
  onUpdate: function() {

  },
  onRender: function() {

  },
  add: function(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; ++i) {
        this.add(arguments[i]);
      }
      return this;
    }

    if (object === this) {
      console.error("LEEWGL.Object3D.add:", object, " can't be added as a child of itself");
      return this;
    }

    if (object instanceof LEEWGL.Object3D) {
      if (typeof object.parent !== 'undefined') {
        object.parent.remove(object);
      }
      object.parent = this;
      this.children.push(object);
    } else {
      console.error("LEEWGL.Object3D.add:", object, " is not an instance of LEEWGL.Object3D");
    }
    this.needsUpdate = true;
    return this;
  },
  addComponent: function(component) {
    this.components[component.type.substr('Component.'.length)] = component;
  },
  removeComponent: function(component) {
    var type = '';
    if (component instanceof LEEWGL.Component)
      type = component.type.substr('Component.'.length);
    else
      type = component;
    delete this.components[type];
  },
  remove: function(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; ++i) {
        this.remove(arguments[i]);
      }

      return this;
    }

    var index = this.children.indexOf(object);
    if (index !== -1) {
      object.parent = undefined;
      this.children.splice(index, 1);
    }

    this.needsUpdate = true;
  },
  getObjectById: function(id, recursive) {
    if (this.id === id)
      return this;

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      var object = child.getObjectById(id, recursive);
      if (object !== 'undefined') {
        return object;
      }
    }
    return 'undefined';
  },
  getObjectByAlias: function(alias, recursive) {
    if (this.alias === alias)
      return this;

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      var object = child.getObjectByAlias(alias, recursive);
      if (object !== 'undefined') {
        return object;
      }
    }
    return 'undefined';
  },
  traverse: function(callback) {
    callback(this);
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      child.traverse(callback);
    }
  },
  traverseVisible: function(callback) {
    if (this.visible === true)
      return;
    callback(this);
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      child.traverseVisible(callback);
    }
  },
  clone: function(object, cloneID, recursive) {
    cloneID = (typeof cloneID !== 'undefined') ? cloneID : false;
    recursive = (typeof recursive !== 'undefined') ? recursive : true;

    if (typeof object === 'undefined')
      object = new LEEWGL.Object3D();

    LEEWGL.Component.Transform.prototype.clone.call(this.transform, object.transform);
    object.alias = this.alias + 'Clone';
    object.parent = this.parent;

    if (cloneID === true)
      object.id = this.id;

    for (var component in this.components) {
      if (this.components.hasOwnProperty(component))
        object.components[component] = LEEWGL.Component[component].prototype.clone.call(this.components[component], object.components[component]);
    }

    if (typeof this.listeners !== 'undefined') {
      object.listeners = {};
      for (var listener in this.listeners) {
        object.listeners[listener] = this.listeners[listener];
      }
    }

    vec3.copy(object.up, this.up);
    object.inOutline = this.inOutline;
    object.draggable = this.draggable;
    object.visible = this.visible;
    object.render = this.render;

    if (recursive === true) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        object.add(child.clone());
      }
    }

    return object;
  },
  /**
   * [export description]
   *
   * @return {string} A string-form of the object which can be imported later
   */
  export: function() {
    var json = {};

    for (var prop in this) {
      if (this.hasOwnProperty(prop))
        json[prop] = this[prop];
    }

    var stringified = JSON.stringify(json);
    return stringified;
  },
  /**
   * [import description]
   *
   * @return {json} imported object
   */
  import: function(stringified_json, recursive, object) {
    recursive = (typeof recursive !== 'undefined') ? recursive : true;

    if (typeof object === 'undefined')
      object = new LEEWGL.Object3D();

    var json = JSON.parse(stringified_json);

    console.log(json);
    console.log(object);
    console.log(this);


    // LEEWGL.Component.Transform.prototype.clone.call(this.transform, object.transform);
    // object.alias = this.alias + 'Clone';
    // object.parent = this.parent;
    //
    // for (var component in this.components) {
    //   if (this.components.hasOwnProperty(component))
    //     object.components[component] = this.components[component].clone();
    // }
    // vec3.copy(object.up, this.up);
    // object.inOutline = this.inOutline;
    // object.draggable = this.draggable;
    // object.visible = this.visible;
    // object.render = this.render;
    //
    // if (recursive === true) {
    //   for (var i = 0; i < this.children.length; ++i) {
    //     var child = this.children[i];
    //     object.add(child.clone());
    //   }
    // }

    return object;
  }
};

LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Object3D.prototype);
LEEWGL.Object3DCount = 0;
