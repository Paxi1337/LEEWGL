LEEWGL.Texture = function(img, wrapS, wrapT, mapping, magFilter, minFilter, format, type, anisotropy) {
    Object.defineProperty(this, 'id', {
        value: LEEWGL.TextureCount++
    });

    this.img = img !== undefined ? img : LEEWGL.Texture.IMG_DEFAULT;

    this.webglTexture = null;

    this.mipmaps = [];

    this.wrapS = wrapS !== undefined ? wrapS : LEEWGL.WrappingClampToEdge;
    this.wrapT = wrapT !== undefined ? wrapT : LEEWGL.WrappingClampToEdge;

    this.mapping = mapping !== undefined ? mapping : LEEWGL.Texture.MAPPING_DEFAULT;

    this.magFilter = magFilter !== undefined ? magFilter : LEEWGL.FilterLinear;
    this.minFilter = minFilter !== undefined ? minFilter : LEEWGL.FilterNearestMipMapLinear;

    this.anisotropy = anisotropy !== undefined ? anisotropy : 1;

    this.format = format !== undefined ? format : LEEWGL.FormatRGBA;
    this.type = type !== undefined ? type : LEEWGL.TypeUnsignedByte;

    this.offset = vec2.set(vec2.create(), 0, 0);
    this.repeat = vec2.set(vec2.create(), 1, 1);

    this.genMipmaps = true;
    this.flipY = true;
    this.alignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
};

LEEWGL.Texture.IMG_DEFAULT = undefined;
LEEWGL.Texture.MAPPING_DEFAULT = undefined;

LEEWGL.Texture.prototype = {
    constructor: LEEWGL.Texture,
    create: function(gl) {
        this.webglTexture = gl.createTexture();
    },

    bind: function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, this.webglTexture);
    },

    setActive : function(gl, unit) {
        unit = (typeof unit === 'undefined') ? 1 : unit;
        gl.activeTexture(gl.TEXTURE0 + unit);
    },

    unbind: function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE0, null);
    },

    setParameteri: function(gl, name, param) {
        gl.texParameteri(gl.TEXTURE_2D, name, param);
    },

    generateMipmap: function(gl) {
        gl.generateMipmap(gl.TEXTURE_2D);
    },

    setTextureParameters: function(gl, type, isPowerOfTwo) {
        gl.texImage2D(type, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
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

    setFrameBuffer : function(gl, width, height) {
        this.setParameteri(gl, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        this.setParameteri(gl, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        this.setParameteri(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        this.setParameteri(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    },

    setDepthBuffer : function(gl, width, height) {
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
            texture = new LEEWGL.Texture();

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
LEEWGL.TextureCount = 0;
