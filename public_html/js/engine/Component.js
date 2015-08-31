/**
 * Components can be added to LEEWGL.GameObject
 * @constructor
 */
LEEWGL.Component = function() {
  LEEWGL.REQUIRES.push('Component');
  this.type = 'Component';
};

LEEWGL.Component.prototype = {
  clone: function(component) {
    if (typeof component === 'undefined')
      component = new LEEWGL.Component();

    component.type = this.type;
    return component;
  }
};

/** @global */
LEEWGL.Component.Components = ['Transform', 'CustomScript', 'Texture'];
LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Component.prototype);

/**
 * @constructor
 * @augments LEEWGL.Component
 */
LEEWGL.Component.Transform = function() {
  LEEWGL.Component.call(this);

  this.type = 'Component.Transform';
  this.mat = mat4.create();

  var position = [0.0, 0.0, 0.0];
  var translation = mat4.create();
  var rotation = mat4.create();
  var scaling = mat4.create();

  this.transVec = [0, 0, 0];
  this.rotVec = [0, 0, 0];
  this.scaleVec = [1.0, 1.0, 1.0];

  // private properties - configurable tag defaults to false
  Object.defineProperties(this, {
    position: {
      value: position,
      enumerable: true
    },
    translation: {
      value: translation,
      enumerable: true
    },
    rotation: {
      value: rotation,
      enumerable: true
    },
    scaling: {
      value: scaling,
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

  if (typeof arguments[0] === 'object') {
    vec3.copy(this.position, arguments[0]);
  } else {
    vec3.set(this.position, arguments[0], arguments[1], arguments[2]);
  }
  vec3.copy(this.transVec, this.position);
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
  var negated = vec3.negate(vec3.create(), this.transVec);
  mat4.multiply(mat, mat, this.translation);
  mat4.multiply(mat, mat, this.rotation);
  mat4.multiply(mat, mat, this.scaling);
  mat4.multiply(mat, mat, mat4.translate(mat4.create(), this.translation, negated));

  this.mat = mat;
  return mat;
};

LEEWGL.Component.Transform.prototype.clone = function(transform) {
  if (typeof transform === 'undefined')
    transform = new LEEWGL.Component.Transform();

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

LEEWGL.Component.CustomScript.prototype.addScript = function(id, script) {
  this.applied[id] = script;
};

LEEWGL.Component.CustomScript.prototype.removeScript = function(id) {
  delete this.applied[id];
};

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
 * @constructor
 * @augments LEEWGL.Component
 */
LEEWGL.Component.Texture = function() {
  LEEWGL.Component.call(this);

  /** @inner {string} */
  this.type = 'Component.Texture';
  /** @inner {LEEWGL.Texture} */
  this.texture = new LEEWGL.Texture();
  /** @inner {string} */
  this.src = '';
};

LEEWGL.Component.Texture.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.Texture.prototype.init = function(gl, src) {
  var that = this;
  this.src = src;

  this.texture.create(gl);
  this.texture.setTextureImage(gl, this.src, 1);
};

LEEWGL.Component.Texture.prototype.clone = function(texture) {
  if (typeof texture === 'undefined')
    texture = new LEEWGL.Component.Texture();

  LEEWGL.Component.prototype.clone.call(this, texture);
  texture.texture = LEEWGL.Texture.prototype.clone.call(this.texture);

  texture.src = this.src;

  return texture;
};
