/**
 * @constructor
 */
LEEWGL.Shadowmap = function() {
  LEEWGL.REQUIRES.push('Shadowmap');
  this.frameBuffer = new LEEWGL.FrameBuffer();
  this.colorTexture = new LEEWGL.Texture();
  this.depthTexture = new LEEWGL.Texture();

  this.shader = new LEEWGL.Shader();
  this.shaderLibrary = new LEEWGL.ShaderLibrary();

  this.size = {
    'x': 512,
    'y': 512
  };

  this.init = function(gl, width, height) {
    this.size.x = (typeof width !== 'undefined') ? width : this.size.x;
    this.size.y = (typeof height !== 'undefined') ? height : this.size.y;

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    var depthExtension = __extensionLoader.getExtension(gl, 'WEBGL_depth_texture');

    this.colorTexture.create(gl);
    this.colorTexture.bind(gl);
    this.colorTexture.setFrameBuffer(gl, this.size.x, this.size.y);

    this.depthTexture.create(gl);
    this.depthTexture.bind(gl);
    this.depthTexture.setDepthBuffer(gl, this.size.x, this.size.y);

    this.frameBuffer.create(gl, width, height);
    this.frameBuffer.bind(gl);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture.webglTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture.webglTexture, 0);

    this.frameBuffer.unbind(gl);
    this.colorTexture.unbind(gl);
    this.depthTexture.unbind(gl);
  };

  this.bind = function(gl) {
    this.frameBuffer.bind(gl);
  };

  this.unbind = function(gl) {
    this.frameBuffer.unbind(gl);
  };

  this.draw = function(gl, shader, light) {
    this.depthTexture.setActive(gl);
    this.depthTexture.bind(gl);
    shader.use(gl);

    shader.uniforms['uLightProj'](light.getProjection());
    shader.uniforms['uLightView'](light.getView([0, 0, 0]));
    shader.uniforms['uShadowMap'](this.depthTexture.id);
  };
};
