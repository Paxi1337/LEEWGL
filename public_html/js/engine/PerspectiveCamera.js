/**
 * @constructor
 * @augments LEEWGL.Camera
 * @param  {number} options.fov
 * @param  {number} options.aspect
 * @param  {number} options.near
 * @param  {number} options.far
 * @param  {bool} options.invert-y
 * @param  {number} options.horizontal-angle
 * @param  {number} options.vertical-angle
 */
LEEWGL.PerspectiveCamera = function(options) {
  LEEWGL.REQUIRES.push('PerspectiveCamera');
  LEEWGL.Camera.call(this, options);

  var ext_options = {
    'fov': 50,
    'aspect': 1,
    'near': 0.1,
    'far': 1000,
    'invert-y': true,
    'horizontal-angle': 0.0,
    'vertical-angle': 0.0
  };

  /** @inner {string} */
  this.type = 'PerspectiveCamera';

  extend(LEEWGL.PerspectiveCamera.prototype, LEEWGL.Options.prototype);
  this.addOptions(ext_options);
  this.setOptions(options);

  /** @inner {number} */
  this.fov = this.options.fov;
  /** @inner {number} */
  this.aspect = this.options.aspect;
  /** @inner {number} */
  this.near = this.options.near;
  /** @inner {number} */
  this.far = this.options.far;
  /** @inner {bool} */
  this.invertY = this.options['invert-y'];
  /** @inner {number} */
  this.horizontalAngle = this.options['horizontal-angle'];
  /** @inner {number} */
  this.verticalAngle = this.options['vertical-angle'];

  this.setEditables();
};

LEEWGL.PerspectiveCamera.prototype = Object.create(LEEWGL.Camera.prototype);

/**
 * Initializes this.editables
 */
LEEWGL.PerspectiveCamera.prototype.setEditables = function() {
  this.editables = {
    'fov': {
      'name': 'Field of View',
      'type' : 'number',
      'value': this.fov
    },
    'aspect': {
      'name': 'Aspect Ratio',
      'type' : 'number',
      'value': this.aspect
    },
    'near': {
      'name': 'Near',
      'type' : 'number',
      'value': this.near
    },
    'far': {
      'name': 'Far',
      'type' : 'number',
      'value': this.far
    },
    'invertY': {
      'name': 'Invert Y Axis',
      'type' : 'bool',
      'value': this.invertY
    },
    'horizontalAngle': {
      'name': 'Horizontal Angle',
      'type' : 'number',
      'value': this.horizontalAngle
    },
    'verticalAngle': {
      'name': 'Vertical Angle',
      'type' : 'number',
      'value': this.verticalAngle
    }
  };
  setEditables(this.editables);
};

/**
 * Calculates the rotation matrix
 * @return {mat4}
 */
LEEWGL.PerspectiveCamera.prototype.orientation = function() {
  var orientation = mat4.create();
  mat4.rotate(orientation, orientation, LEEWGL.Math.degToRad(this.verticalAngle), [1.0, 0.0, 0.0]);
  mat4.rotate(orientation, orientation, LEEWGL.Math.degToRad(this.horizontalAngle), [0.0, 1.0, 0.0]);
  return orientation;
};

/**
 * Adds up and right to this.horizontalAngle and this.verticalAngle and calls this.normalizeAngles
 * @param  {number} up
 * @param  {number} right
 */
LEEWGL.PerspectiveCamera.prototype.offsetOrientation = function(up, right) {
  this.horizontalAngle += right;
  this.verticalAngle += up;
  this.normalizeAngles();
};

/**
 * Set orientation to look at given vector
 * @param  {vec3} lookAt
 */
LEEWGL.PerspectiveCamera.prototype.setLookAt = function(lookAt) {
  var direction = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), lookAt, this.transform.position));
  this.verticalAngle = LEEWGL.Math.degToRad(Math.asin(-direction[1]));
  this.horizontalAngle = LEEWGL.Math.degToRad(Math.atan(-direction[0]));
  this.normalizeAngles();
};

/**
 * @return {mat4}
 */
LEEWGL.PerspectiveCamera.prototype.view = function() {
  return mat4.multiply(this.viewMatrix, this.orientation(), mat4.translate(mat4.create(), mat4.create(), vec3.negate(vec3.create(), this.transform.position)));
};

/**
 * @return {mat4}
 */
LEEWGL.PerspectiveCamera.prototype.projection = function() {
  mat4.perspective(this.projMatrix, LEEWGL.Math.degToRad(this.fov), this.aspect, this.near, this.far);
  // mat4.ortho(this.projMatrix, 0, 100, 0, 100, this.near, this.far);
  return this.projMatrix;
};

/**
 * Limit this.horizontalAngle and this.verticalAngle
 */
LEEWGL.PerspectiveCamera.prototype.normalizeAngles = function() {
  this.horizontalAngle = this.horizontalAngle % 360.0;

  if (this.horizontalAngle < 0.0)
    this.horizontalAngle += 360.0;

  if (this.verticalAngle > LEEWGL.Camera.MaxVerticalAngle)
    this.verticalAngle = LEEWGL.Camera.MaxVerticalAngle;
  else if (this.verticalAngle < -LEEWGL.Camera.MaxVerticalAngle)
    this.verticalAngle = -LEEWGL.Camera.MaxVerticalAngle;
};

/**
 * Calls this.projection and this.view and calculates the view-projection matrix
 */
LEEWGL.PerspectiveCamera.prototype.update = function() {
  this.projection();
  this.view();
  mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
};

/**
 * Return forward vector in world space
 * @return {vec3}
 */
LEEWGL.PerspectiveCamera.prototype.forward = function() {
  var forward = vec4.transformMat4(vec4.create(), [0, 0, -1, 1], mat4.invert(mat4.create(), this.orientation()));
  return [forward[0], forward[1], forward[2]];
};

/**
 * Return right vector in world space
 * @return {vec3}
 */
LEEWGL.PerspectiveCamera.prototype.right = function() {
  var right = vec4.transformMat4(vec4.create(), [1, 0, 0, 1], mat4.invert(mat4.create(), this.orientation()));
  return [right[0], right[1], right[2]];
};

/**
 * Return down vector in world space
 * @return {vec3}
 */
LEEWGL.PerspectiveCamera.prototype.down = function() {
  var down = vec4.transformMat4(vec4.create(), [0, -1, 0, 1], mat4.invert(mat4.create(), this.orientation()));
  return [down[0], down[1], down[2]];
};

/**
 * Return up vector in world space
 * @return {vec3}
 */
LEEWGL.PerspectiveCamera.prototype.upVec = function() {
  var up = vec4.transformMat4(vec4.create(), [0, 1, 0, 1], mat4.invert(mat4.create(), this.orientation()));
  return [up[0], up[1], up[2]];
};

/**
 * Creates a deep copy of this object
 * @param  {LEEWGL.Camera} camera
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.GameObject}
 */
LEEWGL.PerspectiveCamera.prototype.clone = function(camera, cloneID, recursive, addToAlias) {
  if (camera === undefined)
    camera = new LEEWGL.PerspectiveCamera(this.options);
  LEEWGL.Camera.prototype.clone.call(this, camera, cloneID, recursive, addToAlias);

  camera.fov = this.fov;
  camera.aspect = this.aspect;
  camera.near = this.near;
  camera.far = this.far;
  camera.invertY = this.invertY;
  camera.horizontalAngle = this.horizontalAngle;
  camera.verticalAngle = this.verticalAngle;

  return camera;
};
