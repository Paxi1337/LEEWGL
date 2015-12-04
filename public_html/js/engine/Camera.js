/**
 * @constructor
 * @augments LEEWGL.GameObject
 * @param  {object} options
 */
LEEWGL.Camera = function(options) {
  LEEWGL.REQUIRES.push('Camera');
  LEEWGL.GameObject.call(this, options);

  var ext_options = {
    'near': 0.1,
    'far': 1000,
    'invert-y': true,
    'horizontal-angle': 0.0,
    'vertical-angle': 0.0
  };

  this.addOptions(ext_options);
  this.setOptions(options);

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

LEEWGL.Camera.prototype = Object.create(LEEWGL.GameObject.prototype);
/**
 * Initializes this.editables
 */
LEEWGL.Camera.prototype.setEditables = function() {
  LEEWGL.GameObject.prototype.setEditables.call(this);
  var editables = {
    'near': {
      'name': 'Near',
      'type': 'number',
      'value': this.near
    },
    'far': {
      'name': 'Far',
      'type': 'number',
      'value': this.far
    },
    'invertY': {
      'name': 'Invert Y Axis',
      'type': 'bool',
      'value': this.invertY
    },
    'horizontalAngle': {
      'name': 'Horizontal Angle',
      'type': 'number',
      'value': this.horizontalAngle
    },
    'verticalAngle': {
      'name': 'Vertical Angle',
      'type': 'number',
      'value': this.verticalAngle
    }
  };
  addToJSON(this.editables, editables);
};
/**
 * Returns camera render data as json array
 * @return {object}
 */
LEEWGL.Camera.prototype.renderData = function() {
  var world = mat4.identity(mat4.create());
  var uniforms = {
    'uWorld': world,
    'uWorldIT': mat4.transpose(mat4.create(), mat4.invert(mat4.create(), world)),
    'uView': this.viewMatrix,
    'uProjection': this.projMatrix,
    'uEyePosition' : this.transform.position
  };

  return {
    'uniforms': uniforms
  };
};
/**
 * Creates a deep copy of this object
 * @param  {LEEWGL.Camera} camera
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.GameObject}
 */
LEEWGL.Camera.prototype.clone = function(camera, cloneID, recursive, addToAlias) {
  if (typeof camera === 'undefined' || camera === null)
    camera = new LEEWGL.Camera(this.options);

  LEEWGL.GameObject.prototype.clone.call(this, camera, cloneID, recursive, addToAlias);

  mat4.copy(camera.viewMatrix, this.viewMatrix);
  mat4.copy(camera.projMatrix, this.projMatrix);
  mat4.copy(camera.viewProjMatrix, this.viewProjMatrix);

  camera.near = this.near;
  camera.far = this.far;
  camera.invertY = this.invertY;
  camera.horizontalAngle = this.horizontalAngle;
  camera.verticalAngle = this.verticalAngle;

  return camera;
};

/** @global */
LEEWGL.Camera.MaxVerticalAngle = 85.0;
