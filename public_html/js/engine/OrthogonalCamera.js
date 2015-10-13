/**
 * @constructor
 * @augments LEEWGL.Camera
 * @param  {number} options.frustum.left
 * @param  {number} options.frustum.right
 * @param  {number} options.frustum.bottom
 * @param  {number} options.frustum.top
 * @param  {number} options.aspect
 * @param  {number} options.near
 * @param  {number} options.far
 * @param  {bool} options.invert-y
 * @param  {number} options.horizontal-angle
 * @param  {number} options.vertical-angle
 */
LEEWGL.OrthogonalCamera = function(options) {
  LEEWGL.REQUIRES.push('PerspectiveCamera');
  LEEWGL.Camera.call(this, options);

  var ext_options = {
    'frustum': {
      'left' : 0,
      'right' : 10,
      'bottom' : 0,
      'top' : 10
    }
  };

  /** @inner {string} */
  this.type = 'OrthogonalCamera';

  this.addOptions(ext_options);
  this.setOptions(options);

  /** @inner {Array} */
  this.frustum = this.options.frustum;

  this.setEditables();
};

LEEWGL.OrthogonalCamera.prototype = Object.create(LEEWGL.Camera.prototype);
/**
 * Initializes this.editables
 */
LEEWGL.OrthogonalCamera.prototype.setEditables = function() {
  LEEWGL.Camera.prototype.setEditables.call(this);
  var editables = {
    'frustum': {
      'name': 'Field of View',
      'type' : 'array',
      'value': this.frustum
    }
  };
  addToJSON(this.editables, editables);
};
/**
 * Calculates the rotation matrix
 * @return {mat4}
 */
LEEWGL.OrthogonalCamera.prototype.orientation = function() {
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
LEEWGL.OrthogonalCamera.prototype.offsetOrientation = function(up, right) {
  this.horizontalAngle += right;
  this.verticalAngle += up;
  this.normalizeAngles();
};
/**
 * @return {mat4}
 */
LEEWGL.OrthogonalCamera.prototype.view = function() {
  return mat4.multiply(this.viewMatrix, this.orientation(), mat4.translate(mat4.create(), mat4.create(), vec3.negate(vec3.create(), this.transform.position)));
};
/**
 * @return {mat4}
 */
LEEWGL.OrthogonalCamera.prototype.projection = function() {
  mat4.ortho(this.projMatrix, this.frustum.left, this.frustum.right, this.frustum.bottom, this.frustum.top, this.near, this.far);
  return this.projMatrix;
};
/**
 * Limit this.horizontalAngle and this.verticalAngle
 */
LEEWGL.OrthogonalCamera.prototype.normalizeAngles = function() {
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
LEEWGL.OrthogonalCamera.prototype.update = function() {
  this.projection();
  this.view();
  mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
};
/**
 * Return forward vector in world space
 * @return {vec3}
 */
LEEWGL.OrthogonalCamera.prototype.forward = function() {
  var forward = vec4.transformMat4(vec4.create(), [0, 0, -1, 1], mat4.invert(mat4.create(), this.orientation()));
  return [forward[0], forward[1], forward[2]];
};

/**
 * Return right vector in world space
 * @return {vec3}
 */
LEEWGL.OrthogonalCamera.prototype.right = function() {
  var right = vec4.transformMat4(vec4.create(), [1, 0, 0, 1], mat4.invert(mat4.create(), this.orientation()));
  return [right[0], right[1], right[2]];
};
/**
 * Return down vector in world space
 * @return {vec3}
 */
LEEWGL.OrthogonalCamera.prototype.down = function() {
  var down = vec4.transformMat4(vec4.create(), [0, -1, 0, 1], mat4.invert(mat4.create(), this.orientation()));
  return [down[0], down[1], down[2]];
};
/**
 * Return up vector in world space
 * @return {vec3}
 */
LEEWGL.OrthogonalCamera.prototype.upVec = function() {
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
LEEWGL.OrthogonalCamera.prototype.clone = function(camera, cloneID, recursive, addToAlias) {
  if (camera === undefined)
    camera = new LEEWGL.PerspectiveCamera(this.options);
  LEEWGL.Camera.prototype.clone.call(this, camera, cloneID, recursive, addToAlias);
  camera.frustum = this.frustum;
  return camera;
};
