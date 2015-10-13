/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 * @param {string} options.type
 * @param {LEEWGL.Camera} options.camera
 * @param {number} options.size.x
 * @param {number} options.size.y
 */
LEEWGL.Billboard = function(options) {
  LEEWGL.REQUIRES.push('Billboard');
  LEEWGL.Geometry3D.call(this, options);

  var ext_options = {
    'type': 'normal',
    'camera': null,
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
  this.camera = this.options['camera'];
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
    'uSampler': this.texture.texture.id
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
 * Sets geometry own shader attributes and uniforms and renders the billboard
 * @param  {webGLContext} gl
 * @param  {LEEWGL.Shader} shader
 * @param  {LEEWGL.Camera} camera
 */
LEEWGL.Billboard.prototype.draw = function(gl, shader, camera) {
  shader.use(gl);
  shader.attributes['aVertexPosition'](this.buffers.position);
  shader.uniforms['uVP'](camera.viewProjMatrix);
  shader.uniforms['uModel'](this.transform.matrix());

  if (this.billboardType === 'normal') {
    shader.uniforms['uCameraRight'](camera.right());
    shader.uniforms['uCameraUp'](camera.upVec());
    shader.uniforms['uBillboardSize']([2.0, 2.0]);
  }
  shader.uniforms['uColorMapColor'](new Float32Array(this.buffers.position.colorMapColor));
  shader.uniforms['uBillboardPosition']([0.0, 0.0, 0.0]);
  this.texture.texture.setActive(gl);
  this.texture.texture.bind(gl);
  shader.uniforms['uSampler'](this.texture.texture.id);
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
  billboard.texture = LEEWGL.Component.Texture.prototype.clone.call(billboard.texture, this.texture);
  billboard.billboardType = this.billboardType;
  billboard.camera = LEEWGL.Camera.prototype.clone.call(billboard.camera, this.camera);
  billboard.size = this.size;
  return billboard;
};
