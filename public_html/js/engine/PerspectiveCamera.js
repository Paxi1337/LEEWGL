LEEWGL.REQUIRES.push('PerspectiveCamera');

LEEWGL.PerspectiveCamera = function(options) {
  LEEWGL.Camera.call(this, options);

  this.options = {
    'fov': 50,
    'aspect': 1,
    'near': 0.1,
    'far': 1000,
    'invert-y': true,
    'horizontal-angle': 0.0,
    'vertical-angle': 0.0
  };

  this.type = 'PerspectiveCamera';

  extend(LEEWGL.PerspectiveCamera.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  this.fov = this.options.fov;
  this.aspect = this.options.aspect;
  this.near = this.options.near;
  this.far = this.options.far;
  this.invertY = this.options['invert-y'];
  this.horizontalAngle = this.options['horizontal-angle'];
  this.verticalAngle = this.options['vertical-angle'];

  this.editables = {
    'fov': {
      'name': 'Field of View',
      'value': this.fov
    },
    'aspect': {
      'name': 'Aspect Ratio',
      'value': this.aspect
    },
    'near': {
      'name': 'Near',
      'value': this.near
    },
    'far': {
      'name': 'Far',
      'value': this.far
    },
    'invertY': {
      'name': 'Invert Y Axis',
      'value': this.invertY
    },
    'horizontalAngle': {
      'name': 'Horizontal Angle',
      'value': this.horizontalAngle
    },
    'verticalAngle': {
      'name': 'Vertical Angle',
      'value': this.verticalAngle
    }
  };
};

LEEWGL.PerspectiveCamera.prototype = Object.create(LEEWGL.Camera.prototype);

LEEWGL.PerspectiveCamera.prototype.orientation = function() {
  var orientation = mat4.create();
  mat4.rotate(orientation, orientation, LEEWGL.Math.degToRad(this.verticalAngle), [1.0, 0.0, 0.0]);
  mat4.rotate(orientation, orientation, LEEWGL.Math.degToRad(this.horizontalAngle), [0.0, 1.0, 0.0]);
  return orientation;
};

LEEWGL.PerspectiveCamera.prototype.offsetOrientation = function(up, right) {
  this.horizontalAngle += right;
  this.verticalAngle += up;
  this.normalizeAngles();
};

LEEWGL.PerspectiveCamera.prototype.setLookAt = function(lookAt) {
  var direction = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), lookAt, this.transform.position));
  this.verticalAngle = LEEWGL.Math.degToRad(Math.asin(-direction[1]));
  this.horizontalAngle = LEEWGL.Math.degToRad(Math.atan(-direction[0]));
  this.normalizeAngles();
};

LEEWGL.PerspectiveCamera.prototype.view = function() {
  return mat4.multiply(this.viewMatrix, this.orientation(), mat4.translate(mat4.create(), mat4.create(), vec3.negate(vec3.create(), this.transform.position)));
};

LEEWGL.PerspectiveCamera.prototype.projection = function() {
  mat4.perspective(this.projMatrix, LEEWGL.Math.degToRad(this.editables.fov.value), this.editables.aspect.value, this.editables.near.value, this.editables.far.value);
  return this.projMatrix;
};

LEEWGL.PerspectiveCamera.prototype.normalizeAngles = function() {
  this.horizontalAngle = this.horizontalAngle % 360.0;

  if (this.horizontalAngle < 0.0)
    this.horizontalAngle += 360.0;

  if (this.verticalAngle > LEEWGL.Camera.MaxVerticalAngle)
    this.verticalAngle = LEEWGL.Camera.MaxVerticalAngle;
  else if (this.verticalAngle < -LEEWGL.Camera.MaxVerticalAngle)
    this.verticalAngle = -LEEWGL.Camera.MaxVerticalAngle;
};

LEEWGL.PerspectiveCamera.prototype.update = function() {
  this.projection();
  this.view();
  mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
};

LEEWGL.PerspectiveCamera.prototype.forward = function() {
  var forward = vec4.transformMat4(vec4.create(), [0, 0, -1, 1], mat4.invert(mat4.create(), this.orientation()));
  return [forward[0], forward[1], forward[2]];
};

LEEWGL.PerspectiveCamera.prototype.right = function() {
  var right = vec4.transformMat4(vec4.create(), [1, 0, 0, 1], mat4.invert(mat4.create(), this.orientation()));
  return [right[0], right[1], right[2]];
};

LEEWGL.PerspectiveCamera.prototype.down = function() {
  var down = vec4.transformMat4(vec4.create(), [0, -1, 0, 1], mat4.invert(mat4.create(), this.orientation()));
  return [down[0], down[1], down[2]];
};

LEEWGL.PerspectiveCamera.prototype.clone = function() {
  var camera = new LEEWGL.PerspectiveCamera(this.options);
  LEEWGL.Camera.prototype.clone.call(this, camera);

  camera.fov = this.fov;
  camera.aspect = this.aspect;
  camera.near = this.near;
  camera.far = this.far;
  camera.invertY = this.invertY;
  camera.horizontalAngle = this.horizontalAngle;
  camera.verticalAngle = this.verticalAngle;
  camera.editables = this.editables;

  return camera;
};
