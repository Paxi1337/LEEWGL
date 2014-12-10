LEEWGL.Texture = function (img, wrapS, wrapT, mapping, mag, min, format, type, anisotropy) {
    Object.defineProperty(this, 'id', {value: LEEWGL.TextureCount++});

    this.image = image !== undefined ? image : LEEWGL.Texture.IMG_DEFAULT;
    this.mipmaps = [];

    this.wrapS = wrapS !== undefined ? wrapS : LEEWGL.Texture.WrappingClampToEdge;
    this.wrapT = wrapT !== undefined ? wrapT : LEEWGL.Texture.WrappingClampToEdge;

    this.mapping = mapping !== undefined ? mapping : LEEWGL.Texture.MAPPING_DEFAULT;
   
    this.mag = mag !== undefined ? mag : LEEWGL.Texture.FilterLinear;
    this.min = min !== undefined ? min : LEEWGL.Texture.FilterLinearMipmapLinear;

    this.anisotropy = anisotropy !== undefined ? anisotropy : 1;

    this.format = format !== undefined ? format : LEEWGL.FormatRGBA;
    this.type = type !== undefined ? type : LEEWGL.TypeUnsignedByte;

    this.offset = vec2.set(this.offset, 0, 0);
    this.repeat = vec2.set(this.repeat, 1, 1);

    this.genMipmaps = true;
    this.flipY = true;
    this.alignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
};

LEEWGL.Texture.IMG_DEFAULT = undefined;
LEEWGL.Texture.MAPPING_DEFAULT = undefined;

LEEWGL.Texture.prototype = {
    constructor: LEEWGL.Texture,
    clone: function (texture) {
        if (texture === undefined)
            texture = new LEEWGL.Texture();

        texture.image = this.image;
        texture.mipmaps = this.mipmaps.slice(0);

        texture.wrapS = this.wrapS;
        texture.wrapT = this.wrapT;
        
        texture.mapping = this.mapping;

        texture.mag = this.mag;
        texture.min = this.min;

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