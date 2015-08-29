/**
 * @constructor
 * @param  {image} options.img
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
    'img': LEEWGL.IMG_DEFAULT,
    'wrap-s': LEEWGL.WRAPPING_CLAMP_TO_EDGE,
    'wrap-t': LEEWGL.WRAPPING_CLAMP_TO_EDGE,
    'mapping': LEEWGL.MAPPING_DEFAULT,
    'mag-filter': LEEWGL.FILTER_NEAREST,
    'min-filter': LEEWGL.FILTER_NEAREST,
    'anisotropy': 1,
    'format': LEEWGL.FORMAT_RGBA,
    'type': LEEWGL.TYPE_UNSIGNED_BYTE,
    'alignment' : 4,
    'gen-mipmaps' : true,
    'flip-y' : true,
    'offset' : vec2.set(vec2.create(), 0, 0),
    'repeat' : vec2.set(vec2.create(), 1, 1)
  };

  extend(LEEWGL.Texture.prototype, LEEWGL.Options.prototype);
  this.setOptions(options);

  this.id = LEEWGL.TextureCount++;
  /** @inner */
  this.img = this.options['img'];
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

/** @global */
LEEWGL.IMG_DEFAULT = undefined;
/** @global */
LEEWGL.MAPPING_DEFAULT = undefined;

LEEWGL.Texture.prototype = {
  constructor: LEEWGL.Texture,
  create: function(gl) {
    this.webglTexture = gl.createTexture();
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
    unit = (typeof unit === 'undefined') ? 1 : unit;
    gl.activeTexture(gl.TEXTURE0 + unit);
  },

  unbind: function(gl, unit) {
    unit = (typeof unit === 'undefined') ? 1 : unit;
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0 + unit, null);
  },

  setParameteri: function(gl, name, param) {
    gl.texParameteri(gl.TEXTURE_2D, name, param);
  },

  setTextureImage: function(gl, src, unit) {
    unit = (typeof unit === 'undefined') ? 1 : unit;
    this.img = new Image();
    this.img.src = src;
    var that = this;

    this.img.onload = function() {
      that.bind(gl);
      that.setActive(gl, unit);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, that.img);
      that.setTextureParameters(gl, gl.TEXTURE_2D, true);
      that.unbind(gl, unit);
    };
  },

  setTextureParameters: function(gl, type, isPowerOfTwo) {
    gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, this.paramToGL(gl, this.minFilter));
    if (isPowerOfTwo) {
      gl.texParameteri(type, gl.TEXTURE_WRAP_S, this.paramToGL(gl, this.wrapS));
      gl.texParameteri(type, gl.TEXTURE_WRAP_T, this.paramToGL(gl, this.wrapT));

      gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, this.paramToGL(gl, this.magFilter));
      gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, this.paramToGL(gl, this.minFilter));
    } else {
      gl.texParameteri(type, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(type, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, this.paramToGL(gl, this.magFilter));
      gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, this.paramToGL(gl, this.minFilter));
    }

    if (this.genMipmaps === true)
      gl.generateMipmap(type);
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

  paramToGL: function(gl, param) {
    if (param === LEEWGL.WrappingRepeat)
      return gl.REPEAT;
    if (param === LEEWGL.WrappingClampToEdge)
      return gl.CLAMP_TO_EDGE;
    if (param === LEEWGL.WrappingMirroredRepeat)
      return gl.MIRRORED_REPEAT;

    if (param === LEEWGL.FilterNearest)
      return gl.NEAREST;
    if (param === LEEWGL.FilterNearestMipMapNearest)
      return gl.NEAREST_MIPMAP_NEAREST;
    if (param === LEEWGL.FilterNearestMipMapLinear)
      return gl.NEAREST_MIPMAP_LINEAR;

    if (param === LEEWGL.FilterLinear)
      return gl.LINEAR;
    if (param === LEEWGL.FilterLinearMipMapNearest)
      return gl.LINEAR_MIPMAP_NEAREST;
    if (param === LEEWGL.FilterLinearMipmapLinear)
      return gl.LINEAR_MIPMAP_LINEAR;

    if (param === LEEWGL.TypeUnsignedByte)
      return gl.UNSIGNED_BYTE;
    if (param === LEEWGL.TypeByte)
      return gl.BYTE;
    if (param === LEEWGL.TypeShort)
      return gl.SHORT;
    if (param === LEEWGL.TypeUnsignedShort)
      return gl.UNSIGNED_SHORT;
    if (param === LEEWGL.TypeInt)
      return gl.INT;
    if (param === LEEWGL.TypeUnsignedInt)
      return gl.UNSIGNED_INT;
    if (param === LEEWGL.TypeFloat)
      return gl.FLOAT;

    if (param === LEEWGL.FormatAlpha)
      return gl.ALPHA;
    if (param === LEEWGL.FormatRGB)
      return gl.RGB;
    if (param === LEEWGL.FormatRGBA)
      return gl.RGBA;
    if (param === LEEWGL.FormatLuminance)
      return gl.LUMINANCE;
    if (param === LEEWGL.FormatLuminanceAlpha)
      return gl.LUMINANCE_ALPHA;
  },

  clone: function(texture) {
    if (texture === undefined)
      texture = new LEEWGL.Texture(this.options);

    texture.imagFiltere = this.imagFiltere;
    texture.mipmaps = this.mipmaps.slice(0);

    texture.wrapS = this.wrapS;
    texture.wrapT = this.wrapT;

    texture.mapping = this.mapping;

    texture.magFilter = this.magFilter;
    texture.minFilter = this.minFilter;

    texture.anisotropy = this.anisotropy;

    texture.format = this.format;
    texture.type = this.type;

    texture.offset.copy(this.offset);
    texture.repeat.copy(this.repeat);

    texture.genMipmaps = this.genMipmaps;
    texture.flipY = this.flipY;
    texture.alignment = this.alignment;

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
