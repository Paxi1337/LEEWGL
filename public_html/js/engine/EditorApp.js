LEEWGL.REQUIRES.push('EditorApp');

LEEWGL.EditorApp = function(options) {
  LEEWGL.App.call(this, options);

  this.camera = new LEEWGL.PerspectiveCamera({
    'alias': 'EditorCamera',
    'fov': 90,
    'aspect': 512 / 512,
    'near': 1,
    'far': 1000,
    'inOutline': false
  });
  this.gameCamera = new LEEWGL.PerspectiveCamera({
    'alias': 'GameCamera',
    'fov': 90,
    'aspect': 512 / 512,
    'near': 1,
    'far': 1000
  });

  this.cameraGizmo = new LEEWGL.Geometry.Sphere();

  this.triangle = new LEEWGL.Geometry.Triangle({
    'alias': 'Triangle'
  });
  this.cube = new LEEWGL.Geometry.Cube({
    'alias': 'Cube'
  });
  this.grid = new LEEWGL.Geometry.Grid({
    'alias': 'Grid'
  });

  this.picker = new LEEWGL.Picker();

  this.light = new LEEWGL.Light.SpotLight({
    'alias': 'Light'
  });

  this.movement = {
    'x': 0,
    'y': 0
  };

  this.activeKeys = [];

  this.picking = (typeof options !== 'undefined' && typeof options.picking !== 'undefined') ? options.picking : true;

  this.translationSpeed = {
    'x': ((typeof options !== 'undefined' && typeof options.translationSpeedX !== 'undefined') ? options.translationSpeedX : 0.1),
    'y': ((typeof options !== 'undefined' && typeof options.translationSpeedY !== 'undefined') ? options.translationSpeedY : 0.1)
  };
  this.rotationSpeed = {
    'x': ((typeof options !== 'undefined' && typeof options.rotationSpeedX !== 'undefined') ? options.rotationSpeedX : 0.1),
    'y': ((typeof options !== 'undefined' && typeof options.rotationSpeedY !== 'undefined') ? options.rotationSpeedY : 0.1)
  };

  this.scene = new LEEWGL.Scene();
  this.activeElement = null;

  this.shadowmap = new LEEWGL.Shadowmap();
  this.useShadows = false;

  this.testModel = new LEEWGL.Geometry.Triangle();

  this.ajax = new LEEWGL.AsynchRequest();
};

LEEWGL.EditorApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.EditorApp.prototype.onCreate = function() {
  var that = this;

  this.core.setViewport(0, 0, 512, 512);
  this.core.setSize(512, 512);

  this.camera.transform.setPosition([0.0, 0.0, 10.0]);
  this.camera.setLookAt([0.0, 0.0, -1.0]);

  this.gameCamera.transform.setPosition([10.0, 0.0, 10.0]);
  this.gameCamera.setLookAt([0.0, 0.0, -1.0]);
  this.cameraGizmo.transform.setPosition([10.0, 0.0, 10.0]);

  this.shaderLibrary.addParameterChunks([LEEWGL.ShaderLibrary.DEFAULT, LEEWGL.ShaderLibrary.PICKING, LEEWGL.ShaderLibrary.COLOR, LEEWGL.ShaderLibrary.AMBIENT]);

  if (this.light instanceof LEEWGL.Light.SpotLight)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.SPOT);
  else if (this.light instanceof LEEWGL.Light.DirectionalLight)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.DIRECTIONAL);
  else if (this.light instanceof LEEWGL.Light.PointLight)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.POINT);

  if (this.useShadows === true)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.SHADOW_MAPPING);

  var colorShader = new LEEWGL.Shader();

  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, this.shaderLibrary.out(LEEWGL.Shader.VERTEX));
  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, this.shaderLibrary.out(LEEWGL.Shader.FRAGMENT));
  colorShader.linkShader(this.gl);
  colorShader.use(this.gl);

  colorShader.createUniformSetters(this.gl);
  colorShader.createAttributeSetters(this.gl);

  this.shaderLibrary.reset();

  this.shaderLibrary.addParameterChunks([LEEWGL.ShaderLibrary.DEFAULT, LEEWGL.ShaderLibrary.PICKING, LEEWGL.ShaderLibrary.TEXTURE]);

  if (this.light instanceof LEEWGL.Light.SpotLight)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.SPOT);
  else if (this.light instanceof LEEWGL.Light.DirectionalLight)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.DIRECTIONAL);
  else if (this.light instanceof LEEWGL.Light.PointLight)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.POINT);

  if (this.useShadows === true)
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.SHADOW_MAPPING);

  var textureShader = new LEEWGL.Shader();

  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, this.shaderLibrary.out(LEEWGL.Shader.VERTEX));
  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, this.shaderLibrary.out(LEEWGL.Shader.FRAGMENT));
  textureShader.linkShader(this.gl);
  textureShader.use(this.gl);

  console.log(textureShader.code.fragment);
  console.log(textureShader.code.vertex);

  textureShader.createUniformSetters(this.gl);
  textureShader.createAttributeSetters(this.gl);

  this.scene.addShader('color', colorShader);
  this.scene.addShader('texture', textureShader);

  this.cameraGizmo.setBuffer(this.gl);
  this.cameraGizmo.addColor(this.gl);

  this.triangle.setBuffer(this.gl);
  this.triangle.addColor(this.gl);
  this.triangle.transform.setPosition([0, 0, 0]);

  this.cube.setBuffer(this.gl);
  this.cube.addColor(this.gl);
  this.cube.transform.setPosition([5, 0, 0]);

  this.cube.addComponent(new LEEWGL.Component.CustomScript());

  this.grid.generateGrid(10, 10, {
    'x': 10.0,
    'z': 10.0
  });
  this.grid.setBuffer(this.gl);
  this.grid.setColorBuffer(this.gl);
  this.grid.transform.translate([0.0, -5.0, 0.0]);

  // test load collada file
  var Importer = new LEEWGL.Importer();

  var model = Importer.import('models/cup.obj', this.gl);

  this.scene.add(this.camera, this.gameCamera, this.triangle, this.cube, this.cameraGizmo, this.light);

  UI.addObjToOutline(this.scene.children);
  UI.addObjToOutline([this.light]);

  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.depthFunc(this.gl.LEQUAL);

  UI.setGL(this.gl);
  UI.setScene(this.scene);

  if (this.picking === true)
    this.picker.initPicking(this.gl, this.canvas.width, this.canvas.height);

  if (this.useShadows === true)
    this.shadowmap.init(this.gl, 1024, 1024);

  this.scene.setActiveShader('color');

  var test = this.scene.export();

  // console.log(encodeURI(test));

  // console.log(this.scene.shaders.color.code.fragment);
  // console.log(colorShader.code.fragment == this.scene.shaders.color.code.fragment);

  var json = JSON.parse(test);

  // console.log(this.scene.shaders);
  // console.log(json.shaders.color.code.fragment);
};

LEEWGL.EditorApp.prototype.updatePickingList = function() {
  if (this.picking === true) {
    for (var i = 0; i < this.scene.children.length; ++i) {
      var element = this.scene.children[i];
      if (typeof element.buffers !== 'undefined')
        this.picker.addToList(element);
    }
    this.picker.initPicking(this.gl, this.canvas.width, this.canvas.height);
  }

  UI.setTransformationMode('translation');
};

LEEWGL.EditorApp.prototype.onMouseDown = function(event) {
  var mouseCords = UI.getRelativeMouseCoordinates(event, this.canvas);

  event.target.focus();

  var obj = null;

  if (this.picking === true) {
    this.picker.bind(this.gl);
    obj = this.picker.pick(this.gl, mouseCords.x, mouseCords.y);
    if (obj !== null) {
      this.activeElement = obj;
      this.movement.x = 0;
      this.movement.y = 0;

      UI.setInspectorContent(obj.id);

      this.picker.unbind(this.gl);
    } else {
      UI.setInspectorContent(-1);
    }
  }
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.EditorApp.prototype.onMouseMove = function(event) {
  var movement = {
    'x': 0,
    'y': 0
  };

  var button = null;

  /// Chrome
  if (typeof event.movementX !== 'undefined') {
    movement.x = event.movementX;
    movement.y += event.movementY;

    button = event.button;
  }
  /// FF
  else {
    movement.x += event.mozMovementX;
    movement.y += event.mozMovementY;

    button = event.buttons;
  }

  var rad = LEEWGL.Math.degToRad(10);

  if (event.which === 3 || button === LEEWGL.MOUSE.RIGHT) {
    movement.x = (SETTINGS.get('rotation-speed').x * movement.x);
    movement.y = (SETTINGS.get('rotation-speed').y * movement.y);
    this.camera.offsetOrientation(movement.y, movement.x);
  } else if ((event.which === 1 || button === LEEWGL.MOUSE.LEFT) && this.activeElement !== null) {
    var forward = this.camera.forward();

    var mode = UI.transformationMode;

    this.movement.x = movement.x * this.translationSpeed.y;
    this.movement.y = movement.y * this.translationSpeed.y;

    var movement = [this.movement.x, -this.movement.y, 0.0];
    // vec3.transformMat4(trans, trans, this.activeElement.transform.rotation);

    if (mode === 'translation') {
      if (event.altKey)
        this.activeElement.transform.translate(movement, 'local');
      else
        this.activeElement.transform.translate(movement);
    } else if (mode === 'rotation') {
      if (event.ctrlKey)
        this.activeElement.transform.rotateX(rad, true);
      else if (event.altKey)
        this.activeElement.transform.rotateZ(rad, true);
      else
        this.activeElement.transform.rotateY(rad, true);
    } else if (mode === 'scale') {
      if (event.ctrlKey)
        this.activeElement.transform.scale([movement[0], 0, 0]);
      else if (event.altKey)
        this.activeElement.transform.scale([0, 0, movement[0]]);
      else
        this.activeElement.transform.scale([0, movement[0], 0]);
    }

    UI.setInspectorContent(this.activeElement.id);
  }
};

LEEWGL.EditorApp.prototype.onMouseUp = function(event) {
  this.activeElement = null;
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.EditorApp.prototype.onKeyUp = function(event) {
  this.activeKeys[event.keyCode] = false;
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.EditorApp.prototype.onKeyDown = function(event) {
  this.activeKeys[event.keyCode] = true;
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.EditorApp.prototype.onUpdate = function() {
  this.camera.update();
  this.gameCamera.update();
  this.handleKeyInput();

  this.core.setViewport(SETTINGS.get('viewport').x, SETTINGS.get('viewport').y, SETTINGS.get('viewport').width, SETTINGS.get('viewport').height);
  this.core.setSize(SETTINGS.get('viewport').width, SETTINGS.get('viewport').height);

  if (this.scene.needsUpdate === true) {
    this.updatePickingList();
    this.scene.needsUpdate = false;
  }
};

LEEWGL.EditorApp.prototype.handleKeyInput = function() {
  if (typeof UI !== 'undefined' && UI.playing === true)
    return;

  if (this.activeKeys[LEEWGL.KEYS.PAGE_UP]) {
    this.camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), this.camera.down(), SETTINGS.get('translation-speed').y)));
  } else if (this.activeKeys[LEEWGL.KEYS.PAGE_DOWN]) {
    this.camera.transform.offsetPosition(vec3.scale(vec3.create(), this.camera.down(), SETTINGS.get('translation-speed').y));
  }

  if (this.activeKeys[LEEWGL.KEYS.LEFT_CURSOR]) {
    this.camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), this.camera.right(), SETTINGS.get('translation-speed').x)));
  } else if (this.activeKeys[LEEWGL.KEYS.RIGHT_CURSOR]) {
    this.camera.transform.offsetPosition(vec3.scale(vec3.create(), this.camera.right(), SETTINGS.get('translation-speed').x));
  }

  if (this.activeKeys[LEEWGL.KEYS.UP_CURSOR]) {
    this.camera.transform.offsetPosition(vec3.scale(vec3.create(), this.camera.forward(), SETTINGS.get('translation-speed').z));
  } else if (this.activeKeys[LEEWGL.KEYS.DOWN_CURSOR]) {
    this.camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), this.camera.forward(), SETTINGS.get('translation-speed').z)));
  }
};

LEEWGL.EditorApp.prototype.onRender = function() {
  this.clear();

  var viewProjection = this.camera.viewProjMatrix;

  if (typeof UI !== 'undefined' && UI.playing === true)
    viewProjection = this.gameCamera.viewProjMatrix;

  var activeShader = null;

  for (var i = 0; i < this.scene.children.length; ++i) {
    var element = this.scene.children[i];
    if (element.usesTexture === true) {
      activeShader = this.scene.shaders['texture'];
      this.scene.setActiveShader('texture');
    } else {
      activeShader = this.scene.shaders['color'];
      this.scene.setActiveShader('color');
    }

    activeShader.use(this.gl);

    if (this.picking === true) {
      this.picker.bind(this.gl);

      activeShader.uniforms['uOffscreen'](1);

      this.draw(element, activeShader, viewProjection);
      this.picker.unbind(this.gl);
    }

    activeShader.uniforms['uOffscreen'](0);

    if (this.useShadows === true) {
      this.shadowmap.bind(this.gl, activeShader);
      var shadowVP = mat4.create();
      mat4.multiply(shadowVP, this.light.getProjection(), this.light.getView([0, 0, 0]));
      this.draw(element, activeShader, shadowVP);

      this.shadowmap.unbind(this.gl, activeShader);
      this.clear();
    }
    this.draw(element, activeShader, viewProjection);
  }
};

LEEWGL.EditorApp.prototype.draw = function(element, shader, viewProjection) {
  if (element.render === true) {
    shader.use(this.gl);
    shader.uniforms['uVP'](viewProjection);

    if (this.useShadows === true)
      this.shadowmap.draw(this.gl, shader, this.light);

    element.draw(this.gl, shader, this.gl.TRIANGLES);
  }
};
