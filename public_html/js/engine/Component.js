LEEWGL.REQUIRES.push('Component');

LEEWGL.Component = function() {
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

LEEWGL.Component.Components = ['Transform', 'CustomScript', 'Texture'];
LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Component.prototype);

LEEWGL.Component.Transform = function() {
  LEEWGL.Component.call(this);

  this.type = 'Component.Transform';

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
      enumerable: false
    },
    translation: {
      value: translation,
      enumerable: false
    },
    rotation: {
      value: rotation,
      enumerable: false
    },
    scaling: {
      value: scaling,
      enumerable: false
    }
  });

  this.addEventListener('update-all', function(event) {
    var trans = event['data']['translation'];
    var rot = event['data']['rotation'];
    var scale = event['data']['scale'];

    this.translate(trans);
    this.rotateX();
    this.rotateY();
    this.rotateZ();
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

LEEWGL.Component.Transform.prototype.offsetPosition = function(vector) {
  vec3.add(this.position, this.position, vector);
  this.translate(vector);
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

  this.translate(this.position);
};
LEEWGL.Component.Transform.prototype.translate = function(vector) {
  mat4.translate(this.translation, this.translation, vector);
};

LEEWGL.Component.Transform.prototype.rotateX = function() {
  var rad = false;
  var angle = 0;
  if (arguments.length === 0) {
    angle = (rad === false) ? LEEWGL.Math.degToRad(this.rotVec[0] % 360.0) : this.rotVec[0];
  } else {
    rad = arguments[1];
    angle = (rad === false) ? LEEWGL.Math.degToRad(arguments[0] % 360.0) : arguments[0];
    this.rotVec[0] = (rad === false) ? arguments[0] : LEEWGL.Math.radToDeg(arguments[0]);
  }

  mat4.rotateX(this.rotation, this.rotation, angle);
};

LEEWGL.Component.Transform.prototype.rotateY = function() {
  var rad = false;
  var angle = 0;
  if (arguments.length === 0) {
    angle = (rad === false) ? LEEWGL.Math.degToRad(this.rotVec[1] % 360.0) : this.rotVec[1];
  } else {
    rad = arguments[1];
    angle = (rad === false) ? LEEWGL.Math.degToRad(arguments[0] % 360.0) : arguments[0];
    this.rotVec[1] = (rad === false) ? arguments[0] : LEEWGL.Math.radToDeg(arguments[0]);
  }

  mat4.rotateY(this.rotation, this.rotation, angle);
};

LEEWGL.Component.Transform.prototype.rotateZ = function() {
  var rad = false;
  var angle = 0;
  if (arguments.length === 0) {
    angle = (rad === false) ? LEEWGL.Math.degToRad(this.rotVec[2] % 360.0) : this.rotVec[2];
  } else {
    rad = arguments[1];
    angle = (rad === false) ? LEEWGL.Math.degToRad(arguments[0] % 360.0) : arguments[0];
    this.rotVec[2] = (rad === false) ? arguments[0] : LEEWGL.Math.radToDeg(arguments[0]);
  }

  mat4.rotateZ(this.rotation, this.rotation, angle);
};

LEEWGL.Component.Transform.prototype.scale = function() {
  var vector = this.scaleVec;

  if (arguments.length > 0) {
    vector = arguments[0];
    this.scaleVec = vector;
  }

  mat4.scale(this.scaling, this.scaling, vector);
  this.scaleVec = [1.0, 1.0, 1.0];
};

LEEWGL.Component.Transform.prototype.matrix = function() {
  var mat = mat4.create();
  var negated = vec3.negate(vec3.create(), this.position);
  mat4.multiply(mat, mat, this.translation);
  mat4.multiply(mat, mat, this.rotation);
  mat4.multiply(mat, mat, mat4.translate(mat4.create(), this.translation, negated));
  return mat;
};

LEEWGL.Component.Transform.prototype.clone = function(transform) {
  if (typeof transform === 'undefined')
    transform = new LEEWGL.Component.Transform();

  LEEWGL.Component.prototype.clone.call(this, transform);

  vec3.copy(transform.position, this.position);
  mat4.copy(transform.translation, this.translation);
  mat4.copy(transform.rotation, this.rotation);
  mat4.copy(transform.scaling, this.scaling);

  return transform;
};

LEEWGL.Component.CustomScript = function() {
  LEEWGL.Component.call(this);

  this.type = 'Component.CustomScript';
  this.code = 'Type your custom code in here!';

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

  return customScript;
};

LEEWGL.Component.Texture = function() {
  LEEWGL.Component.call(this);

  this.type = 'Component.Texture';
  this.texture = new LEEWGL.Texture();
  this.src = '';
};

LEEWGL.Component.Texture.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.Texture.prototype.init = function(gl, src) {
  var that = this;
  var image = new Image();
  this.src = src;
  image.src = this.src;

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
