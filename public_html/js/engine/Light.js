LEEWGL.REQUIRES.push('Light');

/**
 * !!FIXME: Maybe problems with clone method because of this.editables shallow copy?
 */
LEEWGL.Light = function(options) {
  LEEWGL.Object3D.call(this, options);

  this.options = {
    'ambient' : [0.2, 0.2, 0.2],
    'color': [1.0, 1.0, 1.0],
    'specular': 1.0,
  };

  this.type = 'Light';
  this.lightType = 'Base';
  this.render = false;

  var extend = new LEEWGL.Class();
  extend.extend(LEEWGL.Light.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  this.ambient = this.options.ambient;
  this.color = this.options.color;
  this.specular = this.options.specular;

  this.editables = {
    'ambient': {
      'name': 'Ambient',
      'table-titles': ['r', 'g', 'b'],
      'value': this.ambient
    },
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

LEEWGL.Light.prototype.draw = function(gl, shader) {
  shader.use(gl);
  shader.uniforms['uAmbient'](this.ambient);
  shader.uniforms['uSpecular'](this.specular);
  shader.uniforms['uLightColor'](this.color);
};

LEEWGL.Light.prototype.clone = function(light) {
  if (typeof light === 'undefined')
    light = new LEEWGL.Light();

  LEEWGL.Object3D.prototype.clone.call(this, light);

  vec3.copy(light.color, this.color);
  light.specular = this.specular;
  light.lightType = this.lightType;
  light.editables = this.editables;

  return light;
};

LEEWGL.Light.DirectionalLight = function(options) {
  LEEWGL.Light.call(this, options);

  this.options.direction = [1.0, 0.0, 0.0];
  this.setOptions(options);

  this.type = 'Light.DirectionalLight';
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

LEEWGL.Light.DirectionalLight.prototype.draw = function(gl, shader) {
  LEEWGL.Light.prototype.draw.call(this, gl, shader);
  shader.uniforms['uLightDirection'](this.direction);
};

LEEWGL.Light.DirectionalLight.prototype.clone = function(directionalLight) {
  if (typeof directionalLight === 'undefined')
    directionalLight = new LEEWGL.Light.DirectionalLight();

  LEEWGL.Light.prototype.clone.call(this, directionalLight);
  vec3.copy(directionalLight.direction, this.direction);
  directionalLight.editables = this.editables;
  return directionalLight;
};

LEEWGL.Light.SpotLight = function(options) {
  LEEWGL.Light.call(this, options);

  this.options['spot-direction'] = [1.0, 0.0, 0.0];
  this.options.radius = 20;
  this.options['inner-angle'] = Math.PI * 0.1;
  this.options['outer-angle'] = Math.PI * 0.15;

  this.type = 'Light.SpotLight';
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

LEEWGL.Light.SpotLight.prototype.draw = function(gl, shader) {
  LEEWGL.Light.prototype.draw.call(this, gl, shader);
  shader.uniforms['uLightPosition'](this.transform.position);
  shader.uniforms['uSpotDirection'](this.spotDirection);
  shader.uniforms['uSpotInnerAngle'](this.innerAngle);
  shader.uniforms['uSpotOuterAngle'](this.outerAngle);
  shader.uniforms['uLightRadius'](this.radius);
};

LEEWGL.Light.SpotLight.prototype.clone = function(spotLight) {
  if (typeof spotLight === 'undefined')
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
  LEEWGL.Light.call(this, options);

  this.options.position = [0.0, 0.0, 0.0];
  this.setOptions(options);

  this.type = 'Light.PointLight';
  this.lightType = 'Point';

  this.position = this.options.position;
  this.editables.position = {
    'name': 'Position',
    'table-titles': ['x', 'y', 'z'],
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

LEEWGL.Light.PointLight.prototype.draw = function(gl, shader) {
  LEEWGL.Light.prototype.draw.call(this, gl, shader);
  shader.uniforms['uLightPosition'](this.position);
  shader.uniforms['uLightRadius'](this.radius);
};

LEEWGL.Light.PointLight.prototype.clone = function(pointLight) {
  if (typeof pointLight === 'undefined')
    pointLight = new LEEWGL.Light.PointLight();

  LEEWGL.Light.prototype.clone.call(this, pointLight);
  vec3.copy(pointLight.position, this.position);
  pointLight.editables = this.editables;
  return pointLight;
};
