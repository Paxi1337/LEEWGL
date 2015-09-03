/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 */
LEEWGL.Billboard = function(options) {
  LEEWGL.REQUIRES.push('Billboard');
  LEEWGL.Geometry3D.call(this, options);

  var ext_options = {
    'type': 'normal'
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  this.type = 'Billboard';
  this.picking = false;
  this.billboardType = this.options['type'];

  this.addComponent(new LEEWGL.Component.Texture());
  this.texture = this.components['Texture'];

  var position = [
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, 0.5, 0.0,
  ];
  this.setVerticesByType('position', position);
};

LEEWGL.Billboard.prototype = Object.create(LEEWGL.Geometry3D.prototype);

LEEWGL.Billboard.prototype.setImage = function(gl, src) {
  this.texture.init(gl, src);
};

/**
 * @param  {webGLContext} gl
 */
LEEWGL.Billboard.prototype.setBuffer = function(gl) {
  LEEWGL.Geometry3D.prototype.setBuffer.call(this, gl, 'position');
};

/**
 * Sets geometry own shader attributes and uniforms and renders the billboard
 * @param  {webGLContext} gl
 * @param  {LEEWGL.Shader} shader
 * @param  {LEEWGL.Camera} camera
 */
LEEWGL.Billboard.prototype.draw = function(gl, shader, camera) {
  shader.use(gl);
  shader.attributes['aVertexPosition'](this.buffers.position);
  shader.uniforms['uModel'](this.transform.matrix());
  if (this.billboardType === 'normal') {
    shader.uniforms['uCameraRight'](camera.right());
    shader.uniforms['uCameraUp'](camera.upVec());
    shader.uniforms['uBillboardSize']([2.0, 2.0]);
  }
  shader.uniforms['uBillboardPosition']([0.0, 0.0, 0.0]);
  shader.uniforms['uSampler'](this.texture.textureID);
  this.texture.texture.bind(gl);
  this.texture.texture.setActive(gl, this.texture.textureID);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  this.texture.texture.unbind(gl, this.texture.textureID);
};

/**
 * Derived method from LEEWGL.Geometry3D
 * Calls LEEWGL.GameObject.clone and performs deep copy of this object
 * @param  {LEEWGL.Billboard} geometry
 * @param  {bool} cloneID
 * @param  {bool} addToAlias
 * @return {LEEWGL.Billboard}
 */
LEEWGL.Billboard.prototype.clone = function(billboard, cloneID, recursive, addToAlias) {
  if (typeof billboard === 'undefined')
    billboard = new LEEWGL.Billboard(this.options);
  LEEWGL.Geometry3D.prototype.clone.call(this, billboard, cloneID, recursive, addToAlias);
  billboard.texture = LEEWGL.Component.Texture.prototype.clone.call(this.texture);
  return billboard;
};
