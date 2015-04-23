LEEWGL.Light = function() {
    LEEWGL.Object3D.call(this);

    this.type = 'Light';
    this.render = false;

    this.color = [1.0, 1.0, 1.0];
    this.specular = 1.0;

    this.editables = [{
        'name': 'Color',
        'table-titles': ['r', 'g', 'b'],
        'value': this.color
    }, {
        'name': 'Specular',
        'value': this.specular
    }];
}

LEEWGL.Light.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Light.prototype.clone = function(light) {
    if (light === 'undefined')
        light = new LEEWGL.Light();

    LEEWGL.Object3D.prototype.clone.call(this, light);

    light.editables = this.editables.slice();
    light.specular = this.specular;
    light.color.copy(light.color, this.color);

    return light;
};


LEEWGL.Light.DirectionalLight = function() {
    LEEWGL.Light.call(this);

    this.type = 'DirectionalLight';

    this.direction = [1.0, 0.0, 0.0];
    this.editables.push({
        'name': 'Direction',
        'table-titles': ['x', 'y', 'z'],
        'value': this.direction
    });
};

LEEWGL.Light.DirectionalLight.prototype = Object.create(LEEWGL.Light.prototype);

LEEWGL.Light.DirectionalLight.prototype.clone = function(directionalLight) {
    if (directionalLight === 'undefined')
        directionalLight = new LEEWGL.Light.DirectionalLight();

    LEEWGL.Light.prototype.clone.call(this, directionalLight);

    directionalLight.direction.copy(directionalLight.direction, this.direction);

    return directionalLight;
};

LEEWGL.Light.SpotLight = function() {
    LEEWGL.Light.call(this);

    this.type = 'SpotLight';

    this.spotDirection = [1.0, 0.0, 0.0];
    this.radius = 20.0;
    this.innerAngle = Math.PI * 0.1;
    this.outerAngle = Math.PI * 0.15;

    this.editables.push({
        'name': 'Spot direction',
        'table-titles': ['x', 'y', 'z'],
        'value': this.spotDirection
    }, {
        'name': 'Radius',
        'value': this.radius
    }, {
        'name': 'Inner angle',
        'value': this.innerAngle
    }, {
        'name': 'Outer angle',
        'value': this.outerAngle
    });
};

LEEWGL.Light.SpotLight.prototype = Object.create(LEEWGL.Light.prototype);

LEEWGL.Light.SpotLight.prototype.getView = function(target) {
    var view = mat4.create();
    mat4.lookAt(view, this.transform.position, target, this.up);
    return view;
};

LEEWGL.Light.SpotLight.prototype.getProjection = function() {
    var projection = mat4.create();
    mat4.perspective(projection, LEEWGL.Math.degToRad(this.outerAngle), 1.0, 1.0, 256);
    return projection;
};

LEEWGL.Light.SpotLight.prototype.clone = function(spotLight) {
    if (spotLight === 'undefined')
        spotLight = new LEEWGL.Light.SpotLight();

    LEEWGL.Light.prototype.clone.call(this, spotLight);

    spotLight.spotDirection.copy(spotLight.spotDirection, this.spotDirection);
    spotLight.radius = this.radius;
    spotLight.innerAngle = this.innerAngle;
    spotLight.outerAngle = this.outerAngle;

    return spotLight;
};
