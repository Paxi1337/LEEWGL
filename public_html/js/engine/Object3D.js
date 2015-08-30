LEEWGL.REQUIRES.push('Object3D');

/**
 * Object3D is the base class for all renderable objects.
 * @constructor
 * @param  {string} options.alias
 * @param  {string} options.tagname
 * @param  {LEEWGL.Object3D} options.parent
 * @param  {array} options.children
 * @param  {Object} options.components
 * @param  {array} options.up - representation of the up vector
 * @param  {bool} options.inOutline
 * @param  {bool} options.picking - if the object is affected by LEEWGL.Picker
 * @param  {bool} options.visible
 * @param  {bool} options.render
 * @param  {bool} options.needsUpdate
 */
LEEWGL.Object3D = function(options) {
  this.options = {
    'alias': 'Object3D_' + LEEWGL.Object3DCount,
    'tagname': 'Object3D_' + LEEWGL.Object3DCount,
    'up': vec3.clone(LEEWGL.Object3D.DefaultUp),
    'inOutline': true,
    'picking': true,
    'visible': true,
    'render': true,
    'needsUpdate': true
  };

  extend(LEEWGL.Object3D.prototype, LEEWGL.Options.prototype);
  this.setOptions(options);

  Object.defineProperties(this, {
    /** @inner {number} */
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
    'tagname': {
      value: this.options.tagname,
      enumerable: true,
      writable: true
    },
    'type': {
      value: 'Object3D',
      enumerable: true,
      writable: true
    },
    'parent': {
      value: undefined,
      enumerable: true,
      writable: true
    },
    'children': {
      value: [],
      enumerable: true,
      writable: true
    },
    'components': {
      value: {},
      enumerable: true,
      writable: true
    },
    'up': {
      value: vec3.clone(this.options.up),
      enumerable: true,
      writable: true
    },
    'inOutline': {
      value: this.options.inOutline,
      enumerable: true,
      writable: true
    },
    'picking': {
      value: this.options.picking,
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

  /**
   * Gets called at begin of the play event
   * @abstract
   * @param  {LEEWGL.Scene} scene
   */
  this.onInit = function(scene) {};
  /**
   * Gets called every frame in the update loop
   * @abstract
   * @param  {LEEWGL.Scene} scene
   */
  this.onUpdate = function(scene) {};
  /**
   * Gets called every frame in the update loop
   * @abstract
   * @param  {LEEWGL.Scene} scene
   */
  this.onRender = function(scene) {};
  /**
   * Gets called at begin of the stop event
   * @abstract
   * @param  {LEEWGL.Scene} scene
   */
  this.onStop = function(scene) {};

  this.addComponent(new LEEWGL.Component.Transform());
  /** @inner {LEEWGL.Component.Transform} */
  this.transform = this.components['Transform'];
};

LEEWGL.Object3D.DefaultUp = [0.0, 1.0, 0.0];

LEEWGL.Object3D.prototype = {
  constructor: LEEWGL.Object3D,

  /**
   * Adds the given object to the children array of this.
   * @param  {LEEWGL.Object3D} object
   * @return {LEEWGL.Object3D} - this
   */
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
  /**
   * Adds the given component to the components object of this.
   * Key is the unique component type name without 'Component.'
   * @param  {LEEWGL.Component} component
   */
  addComponent: function(component) {
    this.components[component.type.substr('Component.'.length)] = component;
  },
  /**
   * Removes the given component from the components object of this.
   * @param  {LEEWGL.Component|string} component
   */
  removeComponent: function(component) {
    var type = '';
    if (component instanceof LEEWGL.Component)
      type = component.type.substr('Component.'.length);
    else
      type = component;
    delete this.components[type];
  },
  /**
   * Removes the given object from the children array of this.
   * @param  {LEEWGL.Component} object
   */
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
  /**
   * Iterates through children array of this and returns object with given id or null otherwise
   * @param  {number} id
   * @return {LEEWGL.Object3D|null}
   */
  getObjectById: function(id) {
    if (this.id === id)
      return this;

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      var object = child.getObjectById(id);
      if (object !== null)
        return object;
    }
    return null;
  },
  /**
   * Iterates through children array of this and returns object with given type or null otherwise
   * @param  {string} type
   * @return {LEEWGL.Object3D|null}
   */
  getObjectByType: function(type) {
    if (this.type === type)
      return this;

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      var object = child.getObjectByType(type);
      if (object !== null)
        return object;
    }
    return null;
  },
  /**
   * Iterates through children array of this and returns object with given alias or null otherwise
   * @param  {string} alias
   * @return {LEEWGL.Object3D|null}
   */
  getObjectByAlias: function(alias) {
    if (this.alias === alias)
      return this;

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      var object = child.getObjectByAlias(alias);
      if (object !== null)
        return object;
    }
    return null;
  },
  /**
   * Iterates through children array of this and returns object with given tagname or null otherwise
   * @param  {string} tagname
   * @return {LEEWGL.Object3D|null}
   */
  getObjectByTagname: function(tagname) {
    if (this.tagname === tagname)
      return this;

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      var object = child.getObjectByTagname(tagname);
      if (object !== null)
        return object;
    }
    return null;
  },
  /**
   * Calls callback function for this and each child
   * @param  {function} callback
   */
  traverse: function(callback) {
    callback(this);
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      child.traverse(callback);
    }
  },
  /**
   * Calls callback function for this and each child with visible option set to true
   * @param  {function} callback
   */
  traverseVisible: function(callback) {
    if (this.visible === false)
      return;
    callback(this);
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      child.traverseVisible(callback);
    }
  },
  /**
   * Creates a deep copy of this object
   * @param  {LEEWGL.Object3D} object
   * @param  {bool} cloneID   - if set to true this.id gets also applied to the cloned object
   * @param  {bool} recursive - if set to true children of this get also applied to the cloned object
   * @param  {bool|string} addToAlias - if and what text should be appended to this.alias
   * @return {LEEWGL.Object3D}
   */
  clone: function(object, cloneID, recursive, addToAlias) {
    cloneID = (typeof cloneID !== 'undefined') ? cloneID : false;
    recursive = (typeof recursive !== 'undefined') ? recursive : false;
    addToAlias = (typeof addToAlias !== 'undefined') ? addToAlias : 'Clone';

    if (typeof object === 'undefined')
      object = new LEEWGL.Object3D(this.options);

    var alias = this.alias;

    if (typeof addToAlias === 'string')
      alias = this.alias + addToAlias;

    object.alias = alias;
    object.tagname = this.tagname;

    if (typeof this.parent !== 'undefined')
      object.parent = this.parent.clone(object.parent, cloneID, false, addToAlias);

    if (cloneID === true)
      object.id = this.id;

    LEEWGL.Component.Transform.prototype.clone.call(this.transform, object.transform);
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
    object.picking = this.picking;
    object.visible = this.visible;
    object.render = this.render;

    if (recursive === true) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        object.add(child.clone(undefined, cloneID, recursive, addToAlias));
      }
    }
    return object;
  },
  /**
   * Stringifies every enumerable property of this.
   * @return {string} - A string-form of the object.
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
   *
   * @param  {string} stringified_json - the exported string form of the object.
   * @return {LEEWGL.Object3D}
   */
  import: function(stringified_json, recursive) {
    recursive = (typeof recursive !== 'undefined') ? recursive : true;
    var object = new LEEWGL.Object3D();
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
/**
 * Globals
 */
LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Object3D.prototype);
LEEWGL.Object3DCount = 0;
