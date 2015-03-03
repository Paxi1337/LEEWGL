LEEWGL.Component = function () {
    this.type = 'GeneralComponent';
};

LEEWGL.Component.prototype = {
    clone : function (component) {
        if(component === 'undefined')
            component = new LEEWGL.Component();

        component.type = this.type;
        return component;
    }
};

LEEWGL.Component.TransformComponent = 'Transform';
LEEWGL.Component.LightComponent = 'Light';
LEEWGL.Component.CustomScriptComponent = 'CustomScript';

LEEWGL.Component.Transform = function () {
    LEEWGL.Component.call(this);

    this.type = 'Transform';

    var position = [0.0, 0.0, 0.0];

    var translation = mat4.create();
    var rotation = mat4.create();
    var scaling = mat4.create();

    this.transVec = [0, 0, 0];
    this.rotVec = [0, 0, 0];
    this.scaleVec = [0, 0, 0];

    // private properties - configurable tag defaults to false
    Object.defineProperties(this, {
        position : {
            enumerable : true,
            value : position
        },
        translation : {
            enumerable : true,
            value : translation
        },
        rotation : {
            enumerable : true,
            value : rotation
        },
        scaling : {
            enumerable : true,
            value : scaling
        }
    });
};

LEEWGL.Component.Transform.prototype.offsetPosition = function (vector) {
    vec3.add(this.position, this.position, vector);
    this.translate(this.position);
};
LEEWGL.Component.Transform.prototype.setPosition = function () {
    if(arguments === 'undefined') {
        console.error('LEEWGL.Transform.setPosition(): no arguments given!');
        return false;
    }


    if(typeof arguments[0] === 'object') {
        vec3.copy(this.position, arguments[0]);
    } else {
        vec3.set(this.position, arguments[0], arguments[1], arguments[2]);
    }

    this.translate(this.position);
};
LEEWGL.Component.Transform.prototype.translate = function (vector) {
    vec3.add(this.transVec, this.transVec, vector);
    mat4.translate(this.translation, this.translation, vector);
};

LEEWGL.Component.Transform.prototype.scale = function (vector) {
    vec3.add(this.scaleVec, this.scaleVec, vector);
    mat4.scale(this.scaling, mat4.create(), vector);
};

LEEWGL.Component.Transform.prototype.matrix = function () {
    return mat4.multiply(mat4.create(), this.translation, this.scaling);
};

LEEWGL.Component.Transform.prototype.clone = function (transform) {
    if(transform === 'undefined')
        transform = new LEEWGL.Component.Transform();

    LEEWGL.Component.prototype.clone.call(transform);

    transform.position.copy(transform.position, this.position);
    transform.translation.copy(transform.translation, this.translation);
    transform.rotation.copy(transform.rotation, this.rotation);
    transform.scale.copy(transform.scale, this.scale);

    return transform;
};

LEEWGL.Component.Light = function() {
    LEEWGL.Component.call(this);
    
    this.type = 'Light';
    this.direction = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0];
};

LEEWGL.Component.Light.prototype.clone = function(light) {
  if(light === 'undefined') 
      light = new LEEWGL.Component.Light();
  
    LEEWGL.Component.prototype.clone.call(light);
    
    light.direction.copy(light.direction, this.direction);
    light.color.copy(light.color, this.color);
    
    return light;
};

LEEWGL.Component.CustomScript = function () {
    LEEWGL.Component.call(this);

    this.type = 'CustomScript';

    this.code = 'Type your custom code in here!';
};

LEEWGL.Component.CustomScript.prototype.clone = function (customScript) {
    if(customScript === 'undefined')
        customScript = new LEEWGL.Component.CustomScript();
    
    LEEWGL.Component.prototype.clone.call(customScript);

    customScript.code = this.code;

    return customScript;
};

