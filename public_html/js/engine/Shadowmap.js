/**
 * @constructor
 */
LEEWGL.Shadowmap = function(options) {
  LEEWGL.REQUIRES.push('Shadowmap');
  this.frameBuffer = new LEEWGL.FrameBuffer();
  this.colorTexture = new LEEWGL.Texture();
  this.depthTexture = new LEEWGL.Texture();

  this.options = {
    'size': {
      'x': 512,
      'y': 512
    }
  };

  extend(LEEWGL.Shadowmap.prototype, LEEWGL.Options.prototype);
  this.setOptions(options);

  this.init = function(gl) {
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    var depthExtension = __extensionLoader.getExtension(gl, 'WEBGL_depth_texture');

    this.colorTexture.create(gl);
    this.colorTexture.bind(gl);
    this.colorTexture.setFrameBuffer(gl, this.options.size.x, this.options.size.y);

    this.depthTexture.create(gl);
    this.depthTexture.bind(gl);
    this.depthTexture.setDepthBuffer(gl, this.options.size.x, this.options.size.y);

    this.frameBuffer.create(gl, this.options.size.x, this.options.size.y);
    this.frameBuffer.bind(gl);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture.webglTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture.webglTexture, 0);

    this.frameBuffer.unbind(gl);
    this.colorTexture.unbind(gl);
    this.depthTexture.unbind(gl);
  };

  this.bind = function(gl) {
    this.frameBuffer.bind(gl);

    gl.cullFace(gl.FRONT);
    gl.viewport(0, 0, this.options.size.x, this.options.size.y);
    gl.colorMask(false, false, false, false);
    gl.clear(gl.DEPTH_BUFFER_BIT);
  };

  this.unbind = function(gl, width, height) {
    this.frameBuffer.unbind(gl);

    gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.cullFace(gl.BACK);
  };

  this.renderData = function(camera, light) {
    var proj = mat4.create(),
      view = mat4.create();

    if (light instanceof LEEWGL.Light.DirectionalLight) {
      proj = light.getProjection(camera);
      view = light.getView(camera);
    } else {
      proj = light.getProjection();
      view = light.getView([0.0, 0.0, 0.0]);
    }

    return {
      'uniforms': {
        'uLightProj': proj,
        'uLightView': view,
        'uShadowMap': this.depthTexture.id
      }
    };
  };

  this.draw = function(gl) {
    this.depthTexture.setActive(gl);
    this.depthTexture.bind(gl);
  };
};
