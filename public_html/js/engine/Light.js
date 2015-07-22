/**
 * !!FIXME: Maybe problems with clone method because of this.editables shallow copy?
 */
LEEWGL.Light = function(options) {
  LEEWGL.Object3D.call(this);

  this.options = {
    'color': [1.0, 1.0, 1.0],
    'specular': 1.0,
  };

  this.type = 'Light';
  this.lightType = 'Base';
  this.render = false;

  var extend = new LEEWGL.Class();
  extend.extend(LEEWGL.Light.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  this.color = this.options.color;
  this.specular = this.options.specular;

  this.editables = {
    'color': {
      'name': 'Color',
      'table-titles': ['r', 'g', 'b'],
      'value': this.color
    },
    'specular': {
      'name': 'Specular',
      'value': this.specular
    },
    'type': {
      'name': 'Type',
      'value': this.lightType
    }
  };
};

LEEWGL.Light.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Light.prototype.clone = function(light) {
  if (light === 'undefined')
    light = new LEEWGL.Light();

  LEEWGL.Object3D.prototype.clone.call(this, light);

  vec3.copy(light.color, this.color);
  light.specular = this.specular;
  light.lightType = this.lightType;
  light.editables = this.editables;

  return light;
};

LEEWGL.Light.DirectionalLight = function(options) {
  LEEWGL.Light.call(this);

  this.options.direction = [1.0, 0.0, 0.0];

  this.setOptions(options);

  this.type = 'DirectionalLight';
  this.lightType = 'Directional';

  this.direction = [1.0, 0.0, 0.0];
  this.editables.direction = {
    'name': 'Direction',
    'table-titles': ['x', 'y', 'z'],
    'value': this.direction
  };
  this.editables.type.value = this.lightType;
};

LEEWGL.Light.DirectionalLight.prototype = Object.create(LEEWGL.Light.prototype);

LEEWGL.Light.DirectionalLight.prototype.clone = function(directionalLight) {
  if (directionalLight === 'undefined')
    directionalLight = new LEEWGL.Light.DirectionalLight();

  LEEWGL.Light.prototype.clone.call(this, directionalLight);
  vec3.copy(directionalLight.direction, this.direction);
  directionalLight.editables = this.editables;
  return directionalLight;
};

LEEWGL.Light.SpotLight = function(options) {
  LEEWGL.Light.call(this);

  this.options['spot-direction'] = [1.0, 0.0, 0.0];
  this.options.radius = 20;
  this.options['inner-angle'] = Math.PI * 0.1;
  this.options['outer-angle'] = Math.PI * 0.15;

  this.type = 'SpotLight';
  this.lightType = 'Spot';

  this.setOptions(options);

  this.spotDirection = this.options['spot-direction'];
  this.radius = this.options.radius;
  this.innerAngle = this.options['inner-angle'];
  this.outerAngle = this.options['outer-angle'];

  this.editables.spotDirection = {
    'name': 'SpotDirection',
    'table-titles': ['x', 'y', 'z'],
    'value': this.spotDirection
  };
  this.editables.radius = {
    'name': 'Radius',
    'value': this.radius
  };
  this.editables.innerAngle = {
    'name': 'InnerAngle',
    'value': this.innerAngle
  };
  this.editables.outerAngle = {
    'name': 'OuterAngle',
    'value': this.outerAngle
  };
  this.editables.type.value = this.lightType;
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

  vec3.copy(spotLight.spotDirection, this.spotDirection);
  spotLight.radius = this.radius;
  spotLight.outerAngle = this.outerAngle;
  spotLight.innerAngle = this.innerAngle;
  spotLight.editables = this.editables;
  return spotLight;
};

LEEWGL.Light.PointLight = function(options) {
  LEEWGL.Light.call(this);

  this.options.position = [0.0, 0.0, 0.0];
  this.setOptions();

  this.type = 'PointLight';
  this.lightType = 'Point';

  this.position = this.options.position;
  this.editables.position = {
    'name': 'Position',
    'table-titles' : ['x', 'y', 'z'],
    'value': this.position
  };
  this.editables.type.value = this.lightType;
};

LEEWGL.Light.PointLight.prototype = Object.create(LEEWGL.Light.prototype);

LEEWGL.Light.PointLight.prototype.getView = function(target) {
  var view = mat4.create();
  mat4.lookAt(view, this.transform.position, target, this.up);
  return view;
};

LEEWGL.Light.PointLight.prototype.getProjection = function() {
  var projection = mat4.create();
  mat4.perspective(projection, LEEWGL.Math.degToRad(this.outerAngle), 1.0, 1.0, 256);
  return projection;
};

LEEWGL.Light.PointLight.prototype.clone = function(pointLight) {
  if (pointLight === 'undefined')
    pointLight = new LEEWGL.Light.PointLight();

  LEEWGL.Light.prototype.clone.call(this, pointLight);
  vec3.copy(pointLight.position, this.position);
  pointLight.editables = this.editables;
  return pointLight;
};
