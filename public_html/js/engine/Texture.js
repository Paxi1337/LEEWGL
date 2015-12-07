/**
 * @constructor
 * @param  {number} options.wrap-s
 * @param  {number} options.wrap-t
 * @param  {number} options.mapping
 * @param  {number} options.mag-filter
 * @param  {number} options.min-filter
 * @param  {number} options.anisotropy
 * @param  {number} options.format
 * @param  {number} options.type
 * @param  {number} options.alignment - valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
 * @param  {bool} options.gen-mipmaps
 * @param  {bool} options.flip-y
 * @param  {vec2} options.offset
 * @param  {vec2} options.repeat
 */
LEEWGL.Texture = function(options) {
  LEEWGL.REQUIRES.push('Texture');

  this.options = {
    'wrap-s': LEEWGL.TEXTURE.WRAPPING_CLAMP_TO_EDGE,
    'wrap-t': LEEWGL.TEXTURE.WRAPPING_CLAMP_TO_EDGE,
    'mapping': LEEWGL.TEXTURE.MAPPING_DEFAULT,
    'mag-filter': LEEWGL.TEXTURE.FILTER_NEAREST,
    'min-filter': LEEWGL.TEXTURE.FILTER_LINEAR_MIPMAP_LINEAR,
    'anisotropy': 1,
    'format': LEEWGL.FORMAT.RGBA,
    'type': LEEWGL.TYPE.UNSIGNED_BYTE,
    'alignment': 4,
    'gen-mipmaps': true,
    'flip-y': true,
    'offset': vec2.set(vec2.create(), 0, 0),
    'repeat': vec2.set(vec2.create(), 1, 1)
  };

  extend(LEEWGL.Texture.prototype, LEEWGL.Options.prototype);
  this.setOptions(options);

  this.id = LEEWGL.TextureCount++;
  /** @inner */
  this.wrapS = this.options['wrap-s'];
  /** @inner */
  this.wrapT = this.options['wrap-t'];
  /** @inner */
  this.mapping = this.options['mapping'];
  /** @inner */
  this.magFilter = this.options['mag-filter'];
  /** @inner */
  this.minFilter = this.options['min-filter'];
  /** @inner */
  this.anisotropy = this.options['anisotropy'];
  /** @inner */
  this.format = this.options['format'];
  /** @inner */
  this.type = this.options['type'];
  /** @inner */
  this.webglTexture = null;
  /** @inner */
  this.alignment = this.options['alignment'];
  /** @inner */
  this.genMipmaps = this.options['gen-mipmaps'];
  /** @inner */
  this.flipY = this.options['flip-y'];
  /** @inner */
  this.offset = this.options['offset'];
  /** @inner */
  this.repeat = this.options['repeat'];
  /** @inner */
  this.mipmaps = [];
};

LEEWGL.Texture.prototype = {
  constructor: LEEWGL.Texture,
  create: function(gl) {
    this.webglTexture = gl.createTexture();
    this.bind(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
  },

  createSolid: function(gl, color) {
    this.create(gl);
    this.bind(gl);
    var data = new Uint8Array(color);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return this.webglTexture;
  },

  bind: function(gl) {
    gl.bindTexture(gl.TEXTURE_2D, this.webglTexture);
  },

  setActive: function(gl, unit) {
    unit = (typeof unit !== 'undefined') ? unit : this.id;
    gl.activeTexture(gl.TEXTURE0 + unit);
  },

  unbind: function(gl) {
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0 + this.id, null);
  },

  setParameteri: function(gl, name, param) {
    gl.texParameteri(gl.TEXTURE_2D, name, param);
  },

  setTextureImage: function(gl, src) {
    var that = this;
    var img = new Image();
    img.src = src;

    img.onload = function() {
      that.bind(gl);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      that.setTextureParameters(gl, gl.TEXTURE_2D, img.width, img.height);
      that.unbind(gl);
    };
  },

  setTextureCanvas: function(gl, canvas) {
    this.bind(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    this.unbind(gl);
  },

  isPowerOfTwo: function(value) {
    return (value & (value - 1)) === 0;
  },

  setTextureParameters: function(gl, type, width, height) {
    if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height)) {
      if (this.genMipmaps === true)
        gl.generateMipmap(type);
      gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, this.paramToGL(gl, this.minFilter));
    } else {
      gl.texParameteri(type, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(type, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  },

  setFrameBuffer: function(gl, width, height) {
    this.setParameteri(gl, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    this.setParameteri(gl, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.setParameteri(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    this.setParameteri(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  },

  setDepthBuffer: function(gl, width, height) {
    this.setParameteri(gl, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    this.setParameteri(gl, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.setParameteri(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    this.setParameteri(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
  },

  setRenderBuffer: function(gl) {
    this.setParameteri(gl, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
  },

  paramToGL: function(gl, param) {
    if (param === LEEWGL.TEXTURE.WRAPPING_REPEAT)
      return gl.REPEAT;
    if (param === LEEWGL.TEXTURE.WRAPPING_CLAMP_TO_EDGE)
      return gl.CLAMP_TO_EDGE;
    if (param === LEEWGL.TEXTURE.WRAPPING_MIRRORED_REPEAT)
      return gl.MIRRORED_REPEAT;

    if (param === LEEWGL.TEXTURE.FILTER_NEAREST)
      return gl.NEAREST;
    if (param === LEEWGL.TEXTURE.FILTER_NEAREST_MIPMAP_NEAREST)
      return gl.NEAREST_MIPMAP_NEAREST;
    if (param === LEEWGL.TEXTURE.FILTER_NEAREST_MIPMAP_LINEAR)
      return gl.NEAREST_MIPMAP_LINEAR;

    if (param === LEEWGL.TEXTURE.FILTER_LINEAR)
      return gl.LINEAR;
    if (param === LEEWGL.TEXTURE.FILTER_LINEAR_MIPMAP_NEAREST)
      return gl.LINEAR_MIPMAP_NEAREST;
    if (param === LEEWGL.TEXTURE.FILTER_LINEAR_MIPMAP_LINEAR)
      return gl.LINEAR_MIPMAP_LINEAR;

    if (param === LEEWGL.TYPE.UNSIGNED_BYTE)
      return gl.UNSIGNED_BYTE;
    if (param === LEEWGL.TYPE.BYTE)
      return gl.BYTE;
    if (param === LEEWGL.TYPE.SHORT)
      return gl.SHORT;
    if (param === LEEWGL.TYPE.UNSIGNED_SHORT)
      return gl.UNSIGNED_SHORT;
    if (param === LEEWGL.TYPE.INT)
      return gl.INT;
    if (param === LEEWGL.TYPE.UNSIGNED_INT)
      return gl.UNSIGNED_INT;
    if (param === LEEWGL.TYPE.FLOAT)
      return gl.FLOAT;

    if (param === LEEWGL.FORMAT.ALPHA)
      return gl.ALPHA;
    if (param === LEEWGL.FORMAT.RGB)
      return gl.RGB;
    if (param === LEEWGL.FORMAT.RGBA)
      return gl.RGBA;
    if (param === LEEWGL.FORMAT.LUMINANCE)
      return gl.LUMINANCE;
    if (param === LEEWGL.FORMAT.LUMINANCE_ALPHA)
      return gl.LUMINANCE_ALPHA;
  },

  clone: function(texture) {
    if (texture === undefined)
      texture = new LEEWGL.Texture(this.options);

    texture.id = this.id;

    texture.mipmaps = this.mipmaps.slice(0);

    texture.wrapS = this.wrapS;
    texture.wrapT = this.wrapT;

    texture.mapping = this.mapping;

    texture.magFilter = this.magFilter;
    texture.minFilter = this.minFilter;

    texture.anisotropy = this.anisotropy;

    texture.format = this.format;
    texture.type = this.type;

    texture.offset = vec2.clone(this.offset);
    texture.repeat = vec2.clone(this.repeat);

    texture.genMipmaps = this.genMipmaps;
    texture.flipY = this.flipY;
    texture.alignment = this.alignment;

    texture.webglTexture = this.webglTexture;

    return texture;
  },
  update: function() {
    this.dispatchEvent({
      type: 'update'
    });
  },
  dispose: function() {
    this.dispatchEvent({
      type: 'dispose'
    });
  }
};


LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Texture.prototype);

/** @global */
LEEWGL.TextureCount = 0;
