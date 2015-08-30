/**
 * @constructor
 * @augments LEEWGL.Object3D
 */
LEEWGL.Billboard = function(options) {
  LEEWGL.REQUIRES.push('Billboard');
  LEEWGL.Object3D.call(this, options);

  Object.defineProperties(this, {
    'vertices': {
      value: {
        'position': [],
      },
      enumerable: true,
      writable: true
    },
    'buffers': {
      value: {
        'vertex': new LEEWGL.Buffer()
      },
      enumerable: false,
      writable: true
    }
  });

  this.picking = false;
  this.texture = new LEEWGL.Texture();

  this.vertices.position = [
     -0.5, -0.5, 0.0,
		  0.5, -0.5, 0.0,
		 -0.5,  0.5, 0.0,
		  0.5,  0.5, 0.0,
  ];
};

LEEWGL.Billboard.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Billboard.prototype.init = function(gl, image) {
  this.texture.create(gl);
  this.texture.setTextureImage(gl, image.src, 0);
  this.buffers.vertex.setData(gl, this.vertices.position, new LEEWGL.BufferInformation.VertexTypePos3());
};

/**
 * Sets geometry own shader attributes and uniforms and renders the billboard
 * @param  {webGLContext} gl
 * @param  {LEEWGL.Shader} shader
 * @param  {LEEWGL.Camera} camera
 */
LEEWGL.Billboard.prototype.draw = function(gl, shader, camera) {
  shader.use(gl);
  shader.attributes['aVertexPosition'](this.buffers.vertex);
  shader.uniforms['uCameraRight'](camera.right());
  shader.uniforms['uCameraUp'](camera.upVec());
  shader.uniforms['uBillboardPosition']([-10.0, 0.0, 0.0]);
  shader.uniforms['uBillboardSize']([1.0, 1.0]);
  shader.uniforms['uSampler'](0);
  this.texture.bind(gl);
  this.texture.setActive(gl, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  this.texture.unbind(gl, 0);
};
