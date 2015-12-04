/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 * @param {string} options.type
 * @param {number} options.size.x
 * @param {number} options.size.y
 */
LEEWGL.Billboard = function(options) {
  LEEWGL.REQUIRES.push('Billboard');
  LEEWGL.Geometry3D.call(this, options);

  var ext_options = {
    'type': 'normal',
    'size': {
      'x': 2,
      'y': 2
    }
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  this.type = 'Billboard';
  this.billboardType = this.options['type'];

  this.addComponent(new LEEWGL.Component.Texture());
  /** @inner {LEEWGL.Component.Texture} */
  this.texture = this.components['Texture'];
  /** @inner {LEEWGL.Camera} */
  this.camera = null;
  /** @inner {object} */
  this.size = this.options['size'];

  var position = [-0.5, -0.5, 0.0,
    0.5, -0.5, 0.0, -0.5, 0.5, 0.0,
    0.5, 0.5, 0.0,
  ];
  this.setVerticesByType('position', position);
};

LEEWGL.Billboard.prototype = Object.create(LEEWGL.Geometry3D.prototype);
/**
 * @param  {webGLContext} gl
 * @param  {string} textureSrc
 */
LEEWGL.Billboard.prototype.init = function(gl, camera, textureSrc) {
  this.texture.init(gl, textureSrc);
  this.camera = camera;
};
/**
 * @param  {webGLContext} gl
 */
LEEWGL.Billboard.prototype.setBuffer = function(gl) {
  LEEWGL.Geometry3D.prototype.setBuffer.call(this, gl, 'position');
};
/**
 * Returns billboard render data as json array
 * @return {object}
 */
LEEWGL.Billboard.prototype.renderData = function() {
  var attributes = {
    'aVertexPosition': this.buffers.position,
  };
  var uniforms = {
    'uModel': this.transform.matrix(),
    'uSampler': this.texture.texture.id,
    'uBillboardPosition': [0.0, 0.0, 0.0]
  };

  if (this.billboardType === 'normal') {
    uniforms['uCameraRight'] = this.camera.right();
    uniforms['uCameraUp'] = this.camera.upVec();
    uniforms['uBillboardSize'] = [this.size.x, this.size.y];
  }

  if (this.picking === true)
    uniforms['uColorMapColor'] = new Float32Array(this.buffers.position.colorMapColor);

  return {
    'attributes': attributes,
    'uniforms': uniforms
  };
};
/**
 * Renders the billboard
 * @param  {webGLContext} gl
 */
LEEWGL.Billboard.prototype.draw = function(gl) {
  this.texture.texture.setActive(gl);
  this.texture.texture.bind(gl);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  this.texture.texture.unbind(gl);
};
/**
 * Derived method from LEEWGL.Geometry3D
 * Calls LEEWGL.GameObject.clone and performs deep copy of this object
 * @param  {LEEWGL.Billboard} geometry
 * @param  {bool} cloneID
 * @param  {bool} addToAlias
 * @return {LEEWGL.Billboard} billboard
 */
LEEWGL.Billboard.prototype.clone = function(billboard, cloneID, recursive, addToAlias) {
  if (typeof billboard === 'undefined')
    billboard = new LEEWGL.Billboard(this.options);
  LEEWGL.Geometry3D.prototype.clone.call(this, billboard, cloneID, recursive, addToAlias);

  billboard.texture = LEEWGL.Component.Texture.prototype.clone.call(this.texture, billboard.texture);
  billboard.billboardType = this.billboardType;
  billboard.camera = LEEWGL.PerspectiveCamera.prototype.clone.call(this.camera, billboard.camera);
  billboard.size = this.size;
  return billboard;
};
