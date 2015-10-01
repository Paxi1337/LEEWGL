/**
 * Components can be added to LEEWGL.GameObject to provide them with further functionality
 * @constructor
 */
LEEWGL.Component = function(options) {
  LEEWGL.REQUIRES.push('Component');

  this.options = {};

  extend(LEEWGL.Component.prototype, LEEWGL.Options.prototype);
  this.setOptions(options);

  this.type = 'Component';
};

LEEWGL.Component.prototype = {
  /**
   * Function which needs to get called in the update loop of the application
   */
  update: function() {

  },
  /**
   * Function which needs to get called in the render loop of the application
   */
  draw: function() {

  },
  /**
   * Creates deep copy of this
   * @param  {LEEWGL.Component} component
   * @return {LEEWGL.Component} component
   */
  clone: function(component) {
    if (typeof component === 'undefined')
      component = new LEEWGL.Component();

    component.type = this.type;
    return component;
  }
};

/** @global */
LEEWGL.Component.Components = ['Transform', 'CustomScript', 'Texture', 'Collider'];
LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Component.prototype);

/**
 * Handels transform of gameobjects
 * Gets added to every gameobject
 * Has methods to translate, rotate, scale the gameobject
 * @constructor
 * @augments LEEWGL.Component
 */
LEEWGL.Component.Transform = function(options) {
  LEEWGL.Component.call(this, options);

  var ext_options = {
    'translation': mat4.create(),
    'rotation': mat4.create(),
    'scaling': mat4.create(),
    'position-vector': vec3.create(),
    'translation-vector': vec3.create(),
    'rotation-vector': vec3.create(),
    'scale-vector': vec3.fromValues(1.0, 1.0, 1.0)
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  this.type = 'Component.Transform';
  this.mat = mat4.create();

  this.transVec = vec3.clone(this.options['translation-vector']);
  this.rotVec = vec3.clone(this.options['rotation-vector']);
  this.scaleVec = vec3.clone(this.options['scale-vector']);

  // private properties - configurable tag defaults to false
  Object.defineProperties(this, {
    position: {
      value: vec3.clone(this.options['position-vector']),
      enumerable: true
    },
    translation: {
      value: mat4.clone(this.options['translation']),
      enumerable: true
    },
    rotation: {
      value: mat4.clone(this.options['rotation']),
      enumerable: true
    },
    scaling: {
      value: mat4.clone(this.options['scaling']),
      enumerable: true
    }
  });

  this.addEventListener('update-all', function(event) {
    var pos = event['data']['position'];
    var trans = event['data']['translation'];
    var rot = event['data']['rotation'];
    var scale = event['data']['scale'];

    this.setPosition(pos);
    this.translate(trans);
    this.rotateX(rot[0]);
    this.rotateY(rot[1]);
    this.rotateZ(rot[2]);
    this.scale(scale);
  }.bind(this));

  this.addEventListener('update-rotation', function(event) {
    var rot = event['data']['rotation'];

    this.rotateX(LEEWGL.Math.degToRad(rot[0]));
    this.rotateY(LEEWGL.Math.degToRad(rot[1]));
    this.rotateZ(LEEWGL.Math.degToRad(rot[2]));
  }.bind(this));

};

LEEWGL.Component.Transform.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.Transform.prototype.applyMatrix = function(matrix) {
  mat4.multiply(this.mat, this.mat, matrix);
};

LEEWGL.Component.Transform.prototype.lookAt = function(vector, up) {
  var matrix = mat4.create();
  mat4.lookAt(matrix, vector, this.position, up);
  return matrix;
};

LEEWGL.Component.Transform.prototype.offsetPosition = function(vector) {
  vec3.add(this.position, this.position, vector);
  this.translate(vector, 'world');
};

LEEWGL.Component.Transform.prototype.normalizeAngles = function() {
  for (var i = 0; i < this.rotVec.length; ++i) {
    this.rotVec[i] = this.rotVec[i] % 360;
  }
};

LEEWGL.Component.Transform.prototype.setPosition = function() {
  if (arguments === 'undefined') {
    console.error('LEEWGL.Transform.setPosition(): no arguments given!');
    return false;
  }

  if (typeof arguments[0] === 'object')
    vec3.copy(this.position, arguments[0]);
  else
    vec3.set(this.position, arguments[0], arguments[1], arguments[2]);

  this.transVec = vec3.fromValues(0.0, 0.0, 0.0);
  mat4.translate(this.translation, mat4.create(), this.position);
};
LEEWGL.Component.Transform.prototype.translate = function(vector, space) {
  var vec = vector;
  if (space === 'local')
    vec = vec4.transformMat4(vec4.create(), [vector[0], vector[1], vector[2], 1], mat4.invert(mat4.create(), this.rotation));

  vec3.add(this.transVec, this.transVec, vec);
  mat4.translate(this.translation, this.translation, vec);
};

LEEWGL.Component.Transform.prototype.rotateX = function() {
  var rad = false;
  var angle = 0;
  if (arguments.length === 0) {
    angle = (rad === false) ? LEEWGL.Math.degToRad(this.rotVec[0]) : this.rotVec[0];
  } else {
    if (typeof arguments[1] !== 'undefined')
      rad = arguments[1];
    angle = (rad === false) ? LEEWGL.Math.degToRad(arguments[0]) : arguments[0];
    this.rotVec[0] += (rad === false) ? arguments[0] : LEEWGL.Math.radToDeg(arguments[0]);
    this.normalizeAngles();
  }
  mat4.rotateX(this.rotation, this.rotation, angle);
};

LEEWGL.Component.Transform.prototype.rotateY = function() {
  var rad = false;
  var angle = 0;
  if (arguments.length === 0) {
    angle = (rad === false) ? LEEWGL.Math.degToRad(this.rotVec[1]) : this.rotVec[1];
  } else {
    if (typeof arguments[1] !== 'undefined')
      rad = arguments[1];
    angle = (rad === false) ? LEEWGL.Math.degToRad(arguments[0]) : arguments[0];
    this.rotVec[1] += (rad === false) ? arguments[0] : LEEWGL.Math.radToDeg(arguments[0]);
    this.normalizeAngles();
  }

  mat4.rotateY(this.rotation, this.rotation, angle);
};

LEEWGL.Component.Transform.prototype.rotateZ = function() {
  var rad = false;
  var angle = 0;
  if (arguments.length === 0) {
    angle = (rad === false) ? LEEWGL.Math.degToRad(this.rotVec[2]) : this.rotVec[2];
  } else {
    if (typeof arguments[1] !== 'undefined')
      rad = arguments[1];
    angle = (rad === false) ? LEEWGL.Math.degToRad(arguments[0]) : arguments[0];
    this.rotVec[2] += (rad === false) ? arguments[0] : LEEWGL.Math.radToDeg(arguments[0]);
    this.normalizeAngles();
  }

  mat4.rotateZ(this.rotation, this.rotation, angle);
};

LEEWGL.Component.Transform.prototype.scale = function() {
  var vector = [];
  if (typeof arguments[0] === 'object') {
    vec3.copy(vector, arguments[0]);
  } else {
    vec3.set(vector, arguments[0], arguments[1], arguments[2]);
  }

  this.scaleVec = vector;
  mat4.scale(this.scaling, mat4.create(), vector);
};

LEEWGL.Component.Transform.prototype.matrix = function() {
  var mat = mat4.create();
  var negated = vec3.add(vec3.create, this.transVec, this.position);
  vec3.negate(negated, negated);
  mat4.multiply(mat, mat, this.translation);
  mat4.multiply(mat, mat, this.rotation);
  mat4.multiply(mat, mat, this.scaling);
  mat4.multiply(mat, mat, mat4.translate(mat4.create(), this.translation, negated));

  this.mat = mat;
  return mat;
};
/**
 * Creates deep copy of this
 * @param  {LEEWGL.Component.Transform} transform
 * @return {LEEWGL.Component.Transform} transform
 */
LEEWGL.Component.Transform.prototype.clone = function(transform) {
  if (typeof transform === 'undefined')
    transform = new LEEWGL.Component.Transform(this.options);

  LEEWGL.Component.prototype.clone.call(this, transform);

  vec3.copy(transform.position, this.position);
  vec3.copy(transform.transVec, this.transVec);
  vec3.copy(transform.rotVec, this.rotVec);
  vec3.copy(transform.scaleVec, this.scaleVec);
  mat4.copy(transform.mat, this.matrix);
  mat4.copy(transform.translation, this.translation);
  mat4.copy(transform.rotation, this.rotation);
  mat4.copy(transform.scaling, this.scaling);

  return transform;
};

/**
 * Provides gameobjects with script functionality
 * @constructor
 * @augments LEEWGL.Component
 */
LEEWGL.Component.CustomScript = function() {
  LEEWGL.Component.call(this);

  /** @inner {string} */
  this.type = 'Component.CustomScript';
  /** @inner {string} */
  this.code = 'Type your custom code in here!';
  /** @inner {object} */
  this.applied = {};
};

LEEWGL.Component.CustomScript.prototype = Object.create(LEEWGL.Component.prototype);

/**
 * Add script to this.applied
 * @param  {string} id
 * @param  {string} script
 */
LEEWGL.Component.CustomScript.prototype.addScript = function(id, script) {
  this.applied[id] = script;
};
/**
 * Remove script by id from this.applied
 * @param  {string} id
 */
LEEWGL.Component.CustomScript.prototype.removeScript = function(id) {
  delete this.applied[id];
};
/**
 * Creates deep copy of this
 * @param  {LEEWGL.Component.CustomScript} customScript
 * @return {LEEWGL.Component.CustomScript} customScript
 */
LEEWGL.Component.CustomScript.prototype.clone = function(customScript) {
  if (typeof customScript === 'undefined')
    customScript = new LEEWGL.Component.CustomScript();

  LEEWGL.Component.prototype.clone.call(this, customScript);

  customScript.code = this.code;
  customScript.applied = {};

  for (var scriptID in this.applied) {
    customScript.applied[scriptID] = this.applied[scriptID];
  }

  return customScript;
};

/**
 * Offers a abstraction of the LEEWGL.Texture class to provide the gameobject
 * with a renderable texture
 * @constructor
 * @augments LEEWGL.Component
 * @param {string} options.src
 */
LEEWGL.Component.Texture = function(options) {
  LEEWGL.Component.call(this, options);

  var ext_options = {
    'src': '',
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  /** @inner {string} */
  this.type = 'Component.Texture';
  /** @inner {LEEWGL.Texture} */
  this.texture = new LEEWGL.Texture();
  /** @inner {string} */
  this.src = this.options['src'];

  this.addEventListener('init', function(event) {
    var gl = event['data']['gl'];
    var src = event['data']['src'];
    this.init(gl, src);
  }.bind(this));
};

LEEWGL.Component.Texture.prototype = Object.create(LEEWGL.Component.prototype);
/**
 * Creates texture and sets texture image
 * @param  {webGLContext} gl
 * @param  {string} src
 */
LEEWGL.Component.Texture.prototype.init = function(gl, src) {
  src = (typeof src !== 'undefined') ? src : this.options['src'];
  var that = this;
  this.src = src;

  this.texture.create(gl);
  this.texture.setTextureImage(gl, this.src);
};
/**
 * Creates deep copy of this
 * @param  {LEEWGL.Component.Texture} texture
 * @return {LEEWGL.Component.Texture} texture
 */
LEEWGL.Component.Texture.prototype.clone = function(texture) {
  if (typeof texture === 'undefined')
    texture = new LEEWGL.Component.Texture(this.options);

  LEEWGL.Component.prototype.clone.call(this, texture);
  texture.texture = LEEWGL.Texture.prototype.clone.call(this.texture);
  texture.src = this.src;
  return texture;
};

/**
 * @constructor
 * @augments LEEWGL.Component
 */
LEEWGL.Component.Collider = function(options) {
  LEEWGL.Component.call(this, options);

  var ext_options = {};

  /** @inner {string} */
  this.type = 'Component.Collider';

  this.addOptions(ext_options);
  this.setOptions(options);

  /** @inner {LEEWGL.Collider.Sphere} */
  this.bounding = new LEEWGL.Collider.Sphere();
};

LEEWGL.Component.Collider.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.Collider.prototype.init = function(obj) {
  this.bounding.create(obj);
  obj.collider = this;
};

LEEWGL.Component.Collider.prototype.overlaps = function(other) {
  return this.bounding.overlaps(other.collider.bounding);
};

LEEWGL.Component.Collider.prototype.update = function(obj) {
  this.bounding.update(obj);
};

LEEWGL.Component.Collider.prototype.draw = function() {
  var sphere = new LEEWGL.Geometry3D.Sphere({
    'radius': this.bounding.radius
  });
  sphere.transform.setPosition(this.bounding.center);
  return sphere;
};
/**
 * Creates deep copy of this
 * @param  {LEEWGL.Component.Collider} coll
 * @return {LEEWGL.Component.Collider} coll
 */
LEEWGL.Component.Collider.prototype.clone = function(coll) {
  if (typeof coll === 'undefined')
    coll = new LEEWGL.Component.Collider(this.options);

  LEEWGL.Component.prototype.clone.call(this, coll);
  coll.bounding = LEEWGL.Collider.Sphere.prototype.clone.call(this, this.bounding);
  return coll;
};

/**
 * @constructor
 * @param {string} options.type - type of the billboard; can be normal or fixed
 * @param {bool} options.picking
 * @augments LEEWGL.Component
 */
LEEWGL.Component.Billboard = function(options) {
  LEEWGL.Component.call(this, options);

  var ext_options = {};

  /** @inner {string} */
  this.type = 'Component.Billboard';

  this.addOptions(ext_options);
  this.setOptions(options);

  /** @inner {LEEWGL.Billboard} */
  this.billboard = new LEEWGL.Billboard(options);
};

LEEWGL.Component.Billboard.prototype = Object.create(LEEWGL.Component.prototype);

/**
 * Sets buffer of this.billboard and adds this to obj.billboard
 * @param  {webGLContext} gl
 * @param  {string} src
 * @param  {LEEWGL.GameObject} obj
 */
LEEWGL.Component.Billboard.prototype.init = function(gl, src, obj) {
  this.billboard.setBuffer(gl);
  this.billboard.setImage(gl, src);
  this.billboard.transform = obj.transform;
  obj.billboard = this;
};
/**
 * Sets transform of this.billboard to obj.transform
 * @param  {LEEWGL.GameObject} obj
 */
LEEWGL.Component.Billboard.prototype.update = function(obj) {
  this.billboard.transform = obj.transform;
};
/**
 * Calls draw method of LEEWGL.Billboard
 * @param  {webGLContext} gl
 * @param  {LEEWGL.Shader} shader
 * @param  {LEEWGL.Camera} camera
 */
LEEWGL.Component.Billboard.prototype.draw = function(gl, shader, camera) {
  this.billboard.draw(gl, shader, camera);
};
/**
 * Creates deep copy of this
 * @param  {LEEWGL.Component.Billboard} bill
 * @return {LEEWGL.Component.Billboard} bill
 */
LEEWGL.Component.Billboard.prototype.clone = function(bill) {
  if (typeof bill === 'undefined')
    bill = new LEEWGL.Component.Billboard(this.options);

  LEEWGL.Component.prototype.clone.call(this, bill);
  coll.billboard = LEEWGL.Billboard.prototype.clone.call(this, this.billboard);
  return bill;
};
