LEEWGL.REQUIRES.push('Object3D');

/**
 * [Object3D description]
 * @param  {object} options
 */
LEEWGL.Object3D = function(options) {
  this.name = 'LEEWGL.Object3D';

  this.options = {
    'alias': 'Object3D_' + LEEWGL.Object3DCount,
    'parent': 'undefined',
    'children': [],
    'components': {},
    'up': vec3.clone(LEEWGL.Object3D.DefaultUp),
    'in-outline': true,
    'draggable': true,
    'visible': true,
    'render': true,
    'needs-update': true
  };

  var extend = new LEEWGL.Class();
  extend.extend(LEEWGL.Object3D.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  Object.defineProperties(this, {
    'id': {
      value: LEEWGL.Object3DCount++,
      enumerable: false
    },
    'alias': {
      value: this.options.alias,
      enumerable: false,
      writable: true
    },
    'type': {
      value: 'Object3D',
      enumerable: false,
      writable: true
    },
    'parent': {
      value: this.options.parent,
      enumerable: false,
      writable: true
    },
    'children': {
      value: this.options.children,
      enumerable: false,
      writable: true
    },
    'components': {
      value: this.options['components'],
      enumerable: false,
      writable: true
    },
    'up': {
      value: this.options.up,
      enumerable: false,
      writable: true
    },
    'inOutline': {
      value: this.options['in-outline'],
      enumerable: false,
      writable: true
    },
    'draggable': {
      value: this.options.draggable,
      enumerable: false,
      writable: true
    },
    'visible': {
      value: this.options.visible,
      enumerable: false,
      writable: true
    },
    'render': {
      value: this.options.render,
      enumerable: false,
      writable: true
    },
    'needsUpdate': {
      value: this.options['needs-update'],
      enumerable: false,
      writable: true
    }
  });

  this.addComponent(new LEEWGL.Component.Transform());
  this.transform = this.components['Transform'];
};

LEEWGL.Object3D.DefaultUp = [0.0, 1.0, 0.0];

LEEWGL.Object3D.prototype = {
  constructor: LEEWGL.Object3D,
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
      if (object.parent !== 'undefined') {
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
    this.components[component.type] = component;
  },
  removeComponent: function(component) {
    this.components[component.type] = null;
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
      object.parent = 'undefined';
      this.children.splice(index, 1);
    }

    this.needsUpdate = true;
  },
  applyMatrix: function(matrix) {
    mat4.multiply(this.matrix, this.matrix, matrix);
  },
  localToWorld: function(vector) {},
  worldToLocal: function() {

  },
  lookAt: function(vector) {
    var matrix = mat4.create();
    mat4.lookAt(matrix, vector, this.position, this.up);
    return matrix;
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
  clone: function(object, recursive) {
    if (typeof object === 'undefined')
      object = new LEEWGL.Object3D();
    recursive = (typeof recursive !== 'undefined') ? recursive : true;

    LEEWGL.Component.Transform.prototype.clone.call(this.transform, object.transform);
    object.alias = this.alias + 'Clone';
    object.parent = this.parent;

    for (var component in this.components) {
      if (this.components.hasOwnProperty(component))
        object.components[component] = this.components[component].clone();
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
   * Object variables are set to non-enumerable to be able to differ between
   * variable names and function names
   *
   * @return {json} The object which can be imported later
   */
  export: function() {
    /// get enumerable and non-enumerable property names to filter
    /// out the non-enumerable property names [no functions]
    var enum_and_nonenum = Object.getOwnPropertyNames(this);
    var enum_only = Object.keys(this);
    var nonenum_only = enum_and_nonenum.filter(function(key) {
      var index = enum_only.indexOf(key);
      if (index === -1)
        return true;
      else
        return false;
    });

    var json = {};

    console.log(nonenum_only);

    for (var i = 0; i < nonenum_only.length; ++i) {
      json[nonenum_only[i]] = this[nonenum_only[i]];
    }

    console.log(LEEWGL.REQUIRES);
    var stringified = JSON.stringify(json);
    console.log(json);
    // console.log(stringified);

    this.import(stringified);

    // var arr = [10, 20, 30, 40];
    // console.log(JSON.stringify(arr));
  },
  import: function(stringified_json) {
    var json = JSON.parse(stringified_json);
    console.log(json);
  }
};

LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Object3D.prototype);
LEEWGL.Object3DCount = 0;
