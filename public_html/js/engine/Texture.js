LEEWGL.Texture = function (img, wrapS, wrapT, mapping, magFilter, minFilter, format, type, anisotropy) {
    Object.defineProperty(this, 'id', {value: LEEWGL.TextureCount++});

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
    
    create : function(gl) {
        this.webglTexture = gl.createTexture();
    },
    
    bind : function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, this.webglTexture);
    },
    
    unbind : function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, null);
    },
    
    setParameteri : function(gl, name, param) {
        gl.texParameteri(gl.TEXTURE_2D, name, param);
    },
    
    generateMipmap : function(gl) {
        gl.generateMipmap(gl.TEXTURE_2D);
    },
    
    clone: function (texture) {
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
    update: function () {
        this.dispatchEvent({type: 'update'});
    },
    dispose: function () {
        this.dispatchEvent({type: 'dispose'});
    }
};


LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Texture.prototype);
LEEWGL.TextureCount = 0;