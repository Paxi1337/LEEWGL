/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 */
LEEWGL.Billboard = function(options) {
  LEEWGL.REQUIRES.push('Billboard');
  LEEWGL.Geometry3D.call(this, options);

  this.picking = false;
  this.texture = new LEEWGL.Texture();

  var position = [-0.5, -0.5, 0.0,
    0.5, -0.5, 0.0, -0.5, 0.5, 0.0,
    0.5, 0.5, 0.0,
  ];

  this.setVerticesByType('position', position);
};

LEEWGL.Billboard.prototype = Object.create(LEEWGL.Geometry3D.prototype);

LEEWGL.Billboard.prototype.init = function(gl, image) {
  this.texture.create(gl);
  this.texture.setTextureImage(gl, image.src, 0);
  this.buffers.position.setData(gl, this.vertices.position, new LEEWGL.BufferInformation.VertexTypePos3());
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
 * @param  {string} type - fixed or normal
 */
LEEWGL.Billboard.prototype.draw = function(gl, shader, camera, type) {
  shader.use(gl);
  shader.attributes['aVertexPosition'](this.buffers.position);
  shader.uniforms['uModel'](this.transform.matrix());
  if (type === 'normal') {
    shader.uniforms['uCameraRight'](camera.right());
    shader.uniforms['uCameraUp'](camera.upVec());
    shader.uniforms['uBillboardSize']([1.0, 1.0]);
  }
  shader.uniforms['uBillboardPosition']([0.0, 0.0, 0.0]);
  shader.uniforms['uSampler'](0);
  this.texture.bind(gl);
  this.texture.setActive(gl, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  this.texture.unbind(gl, 0);
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
  return billboard;
};
