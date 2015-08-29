/**
 * @constructor
 * @augments LEEWGL.Object3D
 * @param  {object} options
 */
LEEWGL.Camera = function(options) {
  LEEWGL.REQUIRES.push('Camera');
  LEEWGL.Object3D.call(this, options);

  /** @inner {string} */
  this.type = 'Camera';
  /** @inner {bool} */
  this.render = false;

  /** @inner {mat4} */
  this.viewMatrix = mat4.create();
  /** @inner {mat4} */
  this.projMatrix = mat4.create();
  /** @inner {mat4} */
  this.viewProjMatrix = mat4.create();
};

LEEWGL.Camera.prototype = Object.create(LEEWGL.Object3D.prototype);

/**
 * Creates a deep copy of this object
 * @param  {LEEWGL.Camera} camera
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.Object3D}
 */
LEEWGL.Camera.prototype.clone = function(camera, cloneID, recursive, addToAlias) {
  if (camera === undefined)
    camera = new LEEWGL.Camera();

  LEEWGL.Object3D.prototype.clone.call(this, camera, cloneID, recursive, addToAlias);

  mat4.copy(camera.viewMatrix, this.viewMatrix);
  mat4.copy(camera.projMatrix, this.projMatrix);
  mat4.copy(camera.viewProjMatrix, this.viewProjMatrix);

  return camera;
};

/** @global */
LEEWGL.Camera.MaxVerticalAngle = 85.0;
