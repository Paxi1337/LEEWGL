LEEWGL.Component = function() {
    this.type = 'GeneralComponent';
};

LEEWGL.Component.prototype = {
    clone: function(component) {
        if (typeof component === 'undefined')
            component = new LEEWGL.Component();

        component.type = this.type;
        return component;
    }
};

LEEWGL.Component.Components = ['Transform', 'CustomScript', 'Light', 'Texture'];

LEEWGL.Component.Transform = function() {
    LEEWGL.Component.call(this);

    this.type = 'Transform';

    var position = [0.0, 0.0, 0.0];

    var translation = mat4.create();
    var rotation = mat4.create();
    var scaling = mat4.create();

    this.transVec = [0, 0, 0];
    this.rotVec = [0, 0, 0];
    this.scaleVec = [1.0, 1.0, 1.0];

    // private properties - configurable tag defaults to false
    Object.defineProperties(this, {
        position: {
            enumerable: true,
            value: position
        },
        translation: {
            enumerable: true,
            value: translation
        },
        rotation: {
            enumerable: true,
            value: rotation
        },
        scaling: {
            enumerable: true,
            value: scaling
        }
    });
};

LEEWGL.Component.Transform.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.Transform.prototype.offsetPosition = function(vector) {
    vec3.add(this.position, this.position, vector);
    mat4.translate(this.translation, this.translation, vector);
};
LEEWGL.Component.Transform.prototype.setPosition = function() {
    if (arguments === 'undefined') {
        console.error('LEEWGL.Transform.setPosition(): no arguments given!');
        return false;
    }


    if (typeof arguments[0] === 'object') {
        vec3.copy(this.position, arguments[0]);
    } else {
        vec3.set(this.position, arguments[0], arguments[1], arguments[2]);
    }

    this.translate(this.position);
};
LEEWGL.Component.Transform.prototype.translate = function(vector, test) {
    this.transVec = vector;
    mat4.translate(this.translation, this.translation, vector);
};

LEEWGL.Component.Transform.prototype.rotateX = function(rad) {
    mat4.rotateX(this.rotation, this.rotation, rad);
};

LEEWGL.Component.Transform.prototype.rotateY = function(rad) {
    mat4.rotateY(this.rotation, this.rotation, rad);
};

LEEWGL.Component.Transform.prototype.rotateZ = function(rad) {
    mat4.rotateZ(this.rotation, this.rotation, rad);
};

LEEWGL.Component.Transform.prototype.scale = function(vector) {
    mat4.scale(this.scaling, this.scaling, vector);
    this.scalingVec = [1.0, 1.0, 1.0];
};

LEEWGL.Component.Transform.prototype.matrix = function() {
    var mat = mat4.create();
    mat4.multiply(mat, this.scaling, this.rotation);
    mat4.multiply(mat, mat, this.translation);
    return mat;
};

LEEWGL.Component.Transform.prototype.clone = function(transform) {
    if (typeof transform === 'undefined')
        transform = new LEEWGL.Component.Transform();

    LEEWGL.Component.prototype.clone.call(this, transform);

    vec3.copy(transform.position, this.position);
    mat4.copy(transform.translation, this.translation);
    mat4.copy(transform.rotation, this.rotation);
    mat4.copy(transform.scaling, this.scaling);

    return transform;
};

LEEWGL.Component.Light = function() {
    LEEWGL.Component.call(this);

    this.type = 'Light';
    this.direction = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0];
};

LEEWGL.Component.Light.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.Light.prototype.clone = function(light) {
    if (light === 'undefined')
        light = new LEEWGL.Component.Light();

    LEEWGL.Component.prototype.clone.call(this, light);

    light.direction.copy(light.direction, this.direction);
    light.color.copy(light.color, this.color);

    return light;
};

LEEWGL.Component.CustomScript = function() {
    LEEWGL.Component.call(this);

    this.type = 'CustomScript';
    this.code = 'Type your custom code in here!';
};

LEEWGL.Component.CustomScript.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.CustomScript.prototype.clone = function(customScript) {
    if (customScript === 'undefined')
        customScript = new LEEWGL.Component.CustomScript();

    LEEWGL.Component.prototype.clone.call(this, customScript);

    customScript.code = this.code;

    return customScript;
};

LEEWGL.Component.Texture = function() {
    LEEWGL.Component.call(this);

    this.type = 'Texture';
    this.texture = new LEEWGL.Texture();
    this.src = '';
};

LEEWGL.Component.Texture.prototype = Object.create(LEEWGL.Component.prototype);

LEEWGL.Component.Texture.prototype.init = function(gl, src) {
    var that = this;
    var image = new Image();
    this.src = src;
    image.src = this.src;

    this.texture.create(gl);
    this.texture.img = image;

    this.texture.img.onload = function() {
        that.texture.bind(gl);
        that.texture.setTextureParameters(gl, gl.TEXTURE_2D, true);
        that.texture.unbind(gl);
    };
};

LEEWGL.Component.Texture.prototype.clone = function(texture) {
    if (texture === 'undefined')
        texture = new LEEWGL.Component.Texture();

    LEEWGL.Component.prototype.clone.call(this, texture);
    texture.texture = LEEWGL.Texture.prototype.clone.call(this.texture);

    texture.src = this.src;

    return texture;
};
