/**
 * Object is the base class for all renderable objects.
 * @constructor
 * @param  {string} options.alias
 * @param  {string} options.tagname
 * @param  {LEEWGL.GameObject} options.parent
 * @param  {array} options.children
 * @param  {Object} options.components
 * @param  {array} options.up - representation of the up vector
 * @param  {bool} options.inOutline
 * @param  {bool} options.picking - if the object is affected by LEEWGL.Picker
 * @param  {bool} options.visible
 * @param  {bool} options.render
 * @param  {bool} options.needsUpdate
 */
LEEWGL.GameObject = function(options) {
  LEEWGL.REQUIRES.push('GameObject');
  this.options = {
    'alias': 'GameObject_' + LEEWGL.GameObjectCount,
    'tagname': 'GameObject_' + LEEWGL.GameObjectCount,
    'up': vec3.clone(LEEWGL.VECTOR3D.UP),
    'inOutline': true,
    'picking': true,
    'visible': true,
    'render': true,
    'needsUpdate': true
  };

  extend(LEEWGL.GameObject.prototype, LEEWGL.Options.prototype);
  this.setOptions(options);

  Object.defineProperties(this, {
    /** @inner {number} */
    'id': {
      value: LEEWGL.GameObjectCount++,
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
      value: 'GameObject',
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

  this.addComponent(new LEEWGL.Component.Transform());
  /** @inner {LEEWGL.Component.Transform} */
  this.transform = this.components['Transform'];

  this.editables = {};
  this.setEditables();

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
};

LEEWGL.GameObject.prototype = {
  constructor: LEEWGL.GameObject,

  /**
   * Initializes this.editables
   */
  setEditables: function() {
    var editables = {
      'alias': {
        'name': 'Alias',
        'type': 'string',
        'value': this.alias
      },
      'tagname': {
        'name': 'Tagname',
        'type': 'string',
        'value': this.tagname
      },
      'renderProperties': {
        'picking': {
          'name': 'Picking',
          'value': this.picking
        },
        'visible': {
          'name': 'Visible',
          'value': this.visible
        },
        'render': {
          'name': 'Render',
          'value': this.render
        },
        'name' : 'RenderProperties',
        'type': 'checkbox'
      }
    };

    addToJSON(this.editables, editables);
    addPropertyToAllJSON(this.editables, 'alias');
    addSetMethodToJSON(this.editables);
  },
  /**
   * Adds the given object to the children array of this.
   * @param  {LEEWGL.GameObject} object
   * @return {LEEWGL.GameObject} - this
   */
  add: function(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; ++i) {
        this.add(arguments[i]);
      }
      return this;
    }

    if (object instanceof Array) {
      for (var i = 0; i < object.length; ++i) {
        this.add(object[i]);
      }
      return this;
    }

    if (object === this) {
      console.error("LEEWGL.GameObject.add:", object, " can't be added as a child of itself");
      return this;
    }

    if (object instanceof LEEWGL.GameObject) {
      if (typeof object.parent !== 'undefined') {
        object.parent.remove(object);
      }
      object.parent = this;
      this.children.push(object);
    } else {
      console.error("LEEWGL.GameObject.add:", object, " is not an instance of LEEWGL.GameObject");
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
    if (component instanceof LEEWGL.Component) {
      this.components[component.type.substr('Component.'.length)] = component;
      return this.components[component.type.substr('Component.'.length)];
    } else {
      var c = functionFromString('LEEWGL.Component.' + component);
      this.components[component] = new c();
      return this.components[component];
    }
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
   * @param  {LEEWGL.GameObject} object
   */
  remove: function(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; ++i) {
        this.remove(arguments[i]);
      }
      return this;
    }

    var index = object.parent.children.indexOf(object);
    object.parent.children.splice(index, 1);
    object.parent = undefined;

    this.needsUpdate = true;
  },
  /**
   * Iterates through children array of this and returns object with given id or null otherwise
   * @param  {number} id
   * @return {LEEWGL.GameObject|null}
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
   * @return {LEEWGL.GameObject|null}
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
   * @return {LEEWGL.GameObject|null}
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
   * @return {LEEWGL.GameObject|null}
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
   * @param  {mixed} arg - arguments
   */
  traverse: function(callback, arg) {
    callback.call(this, arg);
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      child.traverse(callback, arg);
    }
  },
  /**
   * Calls callback function for this and each child with visible option set to true
   * @param  {function} callback
   * @param  {mixed} arg - arguments
   */
  traverseVisible: function(callback, arg) {
    if (this.visible === false)
      return;
    callback.call(this, arg);
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i];
      child.traverseVisible(callback, arg);
    }
  },
  /**
   * Calls setPosition on element and all its children
   */
  setPosition: function() {
    var pos = function() {
      this.transform.setPosition();
    };
    this.traverse(pos);
  },
  /**
   * Calls translate on element and all its children
   * @param  {vec3} vector
   * @param  {string} space - can be local or world
   */
  translate: function(vector, space) {
    var trans = function() {
      this.transform.translate(vector, space);
    };
    this.traverse(trans);
  },
  /**
   * Calls rotateX on element and its children
   */
  rotateX: function() {
    var rot = function() {
      this.transform.rotateX();
    };
    this.traverse(rot);
  },
  /**
   * Calls rotateY on element and its children
   */
  rotateY: function() {
    var rot = function() {
      this.transform.rotateY();
    };
    this.traverse(rot);
  },
  /**
   * Calls rotateZ on element and its children
   */
  rotateZ: function() {
    var rot = function() {
      this.transform.rotateZ();
    };
    this.traverse(rot);
  },
  /**
   * Calls scale on element and its children
   */
  scale: function() {
    var s = function() {
      this.transform.scale();
    };
    this.traverse(s);
  },
  /**
   * Creates a deep copy of this object
   * @param  {LEEWGL.GameObject} object
   * @param  {bool} cloneID   - if set to true this.id gets also applied to the cloned object
   * @param  {bool} recursive - if set to true children of this get also applied to the cloned object
   * @param  {bool|string} addToAlias - if and what text should be appended to this.alias
   * @return {LEEWGL.GameObject}
   */
  clone: function(object, cloneID, recursive, addToAlias) {
    cloneID = (typeof cloneID !== 'undefined') ? cloneID : false;
    recursive = (typeof recursive !== 'undefined') ? recursive : false;
    addToAlias = (typeof addToAlias !== 'undefined') ? addToAlias : 'Clone';

    if (typeof object === 'undefined')
      object = new LEEWGL.GameObject(this.options);

    var alias = this.alias;

    if (typeof addToAlias === 'string')
      alias = this.alias + addToAlias;

    object.alias = alias;
    object.tagname = this.tagname;

    if (typeof this.parent !== 'undefined')
      object.parent = this.parent.clone(object.parent, cloneID, false, addToAlias);

    if (cloneID === true)
      object.id = this.id;

    object.transform = LEEWGL.Component.Transform.prototype.clone.call(this.transform, object.transform);
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

    var exportObject = this.clone(undefined, true, true, false);
    var invalidateParent = function() {
      this.parent = null;
    };
    exportObject.traverse(invalidateParent);

    for (var prop in exportObject) {
      if (exportObject.hasOwnProperty(prop))
        json[prop] = exportObject[prop];
    }

    var stringified = JSON.stringify(json);
    return stringified;
  },
  /**
   *
   * @param  {string} stringified_json - the exported string form of the object.
   * @return {LEEWGL.GameObject}
   */
  import: function(stringified_json, recursive) {
    recursive = (typeof recursive !== 'undefined') ? recursive : true;
    var object = new LEEWGL.GameObject();
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
 * Add event dispatcher prototype to gameobject
 */
LEEWGL.EventDispatcher.prototype.apply(LEEWGL.GameObject.prototype);
/**
 * Globals
 */
LEEWGL.GameObjectCount = 0;
