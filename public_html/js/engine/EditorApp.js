/**
 * @constructor
 * @augments LEEWGL.App
 * @param  {Object} options
 */
LEEWGL.EditorApp = function(options) {
  LEEWGL.REQUIRES.push('EditorApp');
  LEEWGL.App.call(this, options);

  /** @inner {LEEWGL.PerspectiveCamera} */
  this.camera = new LEEWGL.PerspectiveCamera({
    'alias': 'EditorCamera',
    'tagname': 'EditorCamera',
    'fov': 90,
    'aspect': 512 / 512,
    'near': 1,
    'far': 1000,
    // 'inOutline': false
  });
  /** @inner {LEEWGL.PerspectiveCamera} */
  this.gameCamera = new LEEWGL.PerspectiveCamera({
    'alias': 'GameCamera',
    'tagname': 'GameCamera',
    'fov': 90,
    'aspect': 512 / 512,
    'near': 1,
    'far': 1000
  });

  /** @inner {LEEWGL.Geometry3D.Sphere} */
  this.cameraGizmo = new LEEWGL.Geometry3D.Sphere({
    'alias': 'CameraGizmo',
    'tagname': 'CameraGizmo'
  });
  /** @inner {LEEWGL.Geometry3D.Triangle} */
  this.triangle = new LEEWGL.Geometry3D.Triangle({
    'alias': 'Triangle',
    'tagname': 'Triangle'
  });
  /** @inner {LEEWGL.Geometry3D.Cube} */
  this.cube = new LEEWGL.Geometry3D.Cube({
    'alias': 'Cube',
    'tagname': 'Cube'
  });
  /** @inner {LEEWGL.Geometry3D.Grid} */
  this.grid = new LEEWGL.Geometry3D.Grid({
    'alias': 'Grid',
    'tagname': 'Grid',
    'wireframe': true
  });
  /** @inner {LEEWGL.Light} */
  this.light = new LEEWGL.Light.SpotLight({
    'alias': 'Light',
    'tagname': 'Light'
  });

  this.billboard = new LEEWGL.Billboard({
    'alias': 'Billboard',
    'tagname': 'Billboard'
  });

  /** @inner {LEEWGL.Picker} */
  this.picker = new LEEWGL.Picker();
  /** @inner {object} */
  this.movement = {
    'x': 0,
    'y': 0
  };

  /** @inner {array} */
  this.activeKeys = [];

  /** @inner {bool} */
  this.picking = (typeof options !== 'undefined' && typeof options.picking !== 'undefined') ? options.picking : true;

  /** @inner {object} */
  this.translationSpeed = {
    'x': ((typeof options !== 'undefined' && typeof options.translationSpeedX !== 'undefined') ? options.translationSpeedX : 0.1),
    'y': ((typeof options !== 'undefined' && typeof options.translationSpeedY !== 'undefined') ? options.translationSpeedY : 0.1)
  };
  /** @inner {object} */
  this.rotationSpeed = {
    'x': ((typeof options !== 'undefined' && typeof options.rotationSpeedX !== 'undefined') ? options.rotationSpeedX : 0.1),
    'y': ((typeof options !== 'undefined' && typeof options.rotationSpeedY !== 'undefined') ? options.rotationSpeedY : 0.1)
  };

  /** @inner {LEEWGL.Scene} */
  this.scene = new LEEWGL.Scene({
    'alias': 'Scene'
  });
  /** @inner {LEEWGL.Scene} */
  this.scenePlay = new LEEWGL.Scene({
    'alias': 'ScenePlay'
  });
  /** @inner {LEEWGL.GameObject} */
  this.activeElement = null;

  /** @inner {bool} */
  this.playing = false;

  /** @inner {LEEWGL.Shadowmap} */
  this.shadowmap = new LEEWGL.Shadowmap();
  /** @inner {bool} */
  this.useShadows = true;
};

LEEWGL.EditorApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.EditorApp.prototype.onCreate = function() {
  var that = this;

  this.core.setViewport(0, 0, 512, 512);
  this.core.setSize(512, 512);

  this.camera.transform.setPosition([0.0, 0.0, 10.0]);
  this.camera.setLookAt([0.0, 0.0, 1.0]);

  this.gameCamera.transform.setPosition([10.0, 0.0, 10.0]);
  this.gameCamera.setLookAt([0.0, 0.0, -1.0]);
  this.gameCamera.add(this.cameraGizmo);
  this.cameraGizmo.transform.setPosition([10.0, 0.0, 10.0]);

  this.light.transform.setPosition([0.0, 10.0, 10.0]);

  var shader = this.initShaders(LEEWGL.ShaderLibrary.SPOT);

  this.scene.setShader('color', shader.color);
  this.scene.setShader('texture', shader.texture);
  this.scene.setShader('billboard', shader.billboard);
  this.scenePlay.setShader('color', shader.color);
  this.scenePlay.setShader('texture', shader.texture);
  this.scenePlay.setShader('billboard', shader.billboard);

  this.cameraGizmo.setBuffer(this.gl);
  this.cameraGizmo.addColor(this.gl, ColorHelper.getUniqueColor());

  this.triangle.setBuffer(this.gl);
  this.triangle.addColor(this.gl, ColorHelper.getUniqueColor());
  this.triangle.transform.setPosition([0, 0, 0]);

  this.cube.setBuffer(this.gl);
  this.cube.addColor(this.gl, ColorHelper.getUniqueColor());
  this.cube.transform.setPosition([5, 0, 0]);

  this.cube.addComponent(new LEEWGL.Component.CustomScript());

  this.grid.setBuffer(this.gl);
  this.grid.addColor(this.gl, ColorHelper.getUniqueColor());
  this.grid.transform.translate([0.0, -5.0, 0.0]);

  this.billboard.setImage(this.gl, LEEWGL.ROOT + 'texture/lightbulb.png');
  this.billboard.setBuffer(this.gl);
  this.light.add(this.billboard);
  this.billboard.transform.translate([0.0, 10.0, 10.0]);
  // this.gameCamera.add(this.billboard);
  // this.billboard.transform.setPosition([0, 0, 0]);

  // test load collada file
  // var Importer = new LEEWGL.Importer();
  // var model = Importer.import('models/cup.obj', this.gl);

  this.scene.add(this.camera, this.gameCamera, this.triangle, this.cube, this.cameraGizmo, this.light);

  this.gl.depthFunc(this.gl.LEQUAL);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  this.gl.enable(this.gl.BLEND);
  this.gl.enable(this.gl.CULL_FACE);

  if (this.picking === true)
    this.picker.init(this.gl, this.canvas.width, this.canvas.height);

  if (this.useShadows === true)
    this.shadowmap.init(this.gl, 2048, 2048);

  this.scene.setActiveShader('color');
  this.scenePlay.setActiveShader('color');

  UI.setApp(this);
  UI.setScene(this.scene);
  UI.addObjToOutline(this.scene.children);
  UI.setTransformationMode('translation');

  this.cube.addComponent('Collider').init(this.cube);
  this.triangle.addComponent('Collider').init(this.triangle);

  console.log(this.triangle.collider.overlaps(this.cube.collider));
  console.log(this.cube.collider.overlaps(this.triangle.collider));

  // console.log(encodeURI(test));

  // console.log(this.scene.shaders.color.code.fragment);
  // console.log(colorShader.code.fragment == this.scene.shaders.color.code.fragment);

  // var json = JSON.parse(test);

  // console.log(this.scene.shaders);
  // console.log(json.shaders.color.code.fragment);
};

LEEWGL.EditorApp.prototype.initShaders = function(lightType) {
  SHADER_LIBRARY.reset();

  SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.BILLBOARD);

  var billboardShader = new LEEWGL.Shader();
  billboardShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  billboardShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));
  billboardShader.linkShader(this.gl);
  billboardShader.use(this.gl);

  billboardShader.createUniformSetters(this.gl);
  billboardShader.createAttributeSetters(this.gl);

  SHADER_LIBRARY.reset();

  var colorShader = new LEEWGL.Shader();
  var textureShader = new LEEWGL.Shader();
  var shadowShader = new LEEWGL.Shader();
  var shadowTextureShader = new LEEWGL.Shader();

  if (this.useShadows === true) {
    if (lightType === LEEWGL.ShaderLibrary.POINT || lightType === LEEWGL.ShaderLibrary.SPOT)
      SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.SHADOW_MAPPING_POSITIONAL_LIGHT);
  }

  SHADER_LIBRARY.addParameterChunks([LEEWGL.ShaderLibrary.DEFAULT, LEEWGL.ShaderLibrary.PICKING, LEEWGL.ShaderLibrary.COLOR, LEEWGL.ShaderLibrary.AMBIENT, lightType]);
  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));
  SHADER_LIBRARY.removeParameterChunk(LEEWGL.ShaderLibrary.COLOR);
  SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.TEXTURE);

  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));
  SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.TEXTURE);

  colorShader.linkShader(this.gl);
  colorShader.use(this.gl);

  colorShader.createUniformSetters(this.gl);
  colorShader.createAttributeSetters(this.gl);

  textureShader.linkShader(this.gl);
  textureShader.use(this.gl);

  textureShader.createUniformSetters(this.gl);
  textureShader.createAttributeSetters(this.gl);

  return {
    'color': colorShader,
    'texture': textureShader,
    'billboard': billboardShader
  };
};

/**
 *
 */
LEEWGL.EditorApp.prototype.onShaderChange = function(typeChange, typeShaderlib) {
  if (typeChange === 'light') {
    var shader = this.initShaders(typeShaderlib);
    this.scene.setShader('color', shader.color);
    this.scene.setShader('texture', shader.texture);
    this.scene.setShader('billboard', shader.billboard);
    this.scenePlay.setShader('color', shader.color);
    this.scenePlay.setShader('texture', shader.texture);
    this.scenePlay.setShader('billboard', shader.billboard);

    this.scene.setActiveShader('color');
    this.scenePlay.setActiveShader('color');
  }
};

LEEWGL.EditorApp.prototype.updatePickingList = function(scene) {
  if (this.picking === true) {
    this.picker.clear();
    for (var i = 0; i < scene.children.length; ++i) {
      var element = scene.children[i];
      if (typeof element.buffers !== 'undefined')
        this.picker.addToList(element);
    }
    this.picker.init(this.gl, this.canvas.width, this.canvas.height);
  }
};

LEEWGL.EditorApp.prototype.onMouseDown = function(event) {
  var mouseCords = UI.getRelativeMouseCoordinates(event, this.canvas);

  event.target.focus();

  var obj = null;

  if (this.picking === true) {
    obj = this.picker.pick(this.gl, mouseCords.x, mouseCords.y);
    if (obj !== null) {
      this.activeElement = obj;
      this.movement.x = 0;
      this.movement.y = 0;

      UI.setInspectorElement(obj.id);
    } else {
      UI.setInspectorElement(-1);
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

  var camera = (this.playing === true) ? this.scenePlay.getObjectByTagname('GameCamera') : this.scene.getObjectByTagname('EditorCamera');
  var rad = LEEWGL.Math.degToRad(10);

  if (event.which === 3 || button === LEEWGL.MOUSE.RIGHT) {
    movement.x = (SETTINGS.get('rotation-speed').x * movement.x);
    movement.y = (SETTINGS.get('rotation-speed').y * movement.y);
    camera.offsetOrientation(movement.y, movement.x);
  } else if ((event.which === 1 || button === LEEWGL.MOUSE.LEFT) && this.activeElement !== null) {
    var forward = camera.forward();

    var mode = UI.transformationMode;

    this.movement.x = movement.x * this.translationSpeed.y;
    this.movement.y = movement.y * this.translationSpeed.y;

    var movementWorld = [this.movement.x, -this.movement.y, 0.0];
    var movementScale = [this.movement.x, -this.movement.y, this.movement.x];

    if (mode === 'translation') {
      var trans = function(args) {
        this.transform.translate(args[0], args[1]);
      };

      if (event.altKey)
        this.activeElement.traverse(trans, [movementWorld, 'local']);
      else if (event.ctrlKey)
        this.activeElement.traverse(trans, [
          [movementWorld[2], movementWorld[1], movementWorld[0]]
        ]);
      else
        this.activeElement.traverse(trans, [movementWorld]);
    } else if (mode === 'rotation') {
      var rot = function(args) {
        if (args[1] === 'x')
          this.transform.rotateX(args[0], true);
        else if (args[1] === 'y')
          this.transform.rotateY(args[0], true);
        else
          this.transform.rotateZ(args[0], true);
      };
      if (event.ctrlKey)
        this.activeElement.traverse(rot, [rad, 'x']);
      else if (event.altKey)
        this.activeElement.traverse(rot, [rad, 'z']);
      else
        this.activeElement.traverse(rot, [rad, 'y']);
    } else if (mode === 'scale') {
      var scale = function(args) {
        this.transform.scale(args);
      };

      var scaleVec = this.activeElement.transform.scaleVec;
      movementScale = vec3.add(vec3.create(), scaleVec, movementScale);
      if (event.ctrlKey)
        this.activeElement.traverse(scale, [movementScale[0], scaleVec[1], scaleVec[2]]);
      else if (event.altKey)
        this.activeElement.traverse(scale, [scaleVec[0], scaleVec[1], movementScale[2]]);
      else
        this.activeElement.traverse(scale, [scaleVec[0], movementScale[1], scaleVec[2]]);
    }

    if (typeof this.activeElement.collider !== 'undefined')
      this.activeElement.collider.init(this.activeElement);

    UI.setInspectorElement(this.activeElement.id);
  }
};

LEEWGL.EditorApp.prototype.onMouseUp = function(event) {
  this.activeElement = null;
  if (this.picking === true)
    this.picker.init(this.gl, this.canvas.width, this.canvas.height);
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
  var camera = (this.playing === true) ? this.scenePlay.getObjectByTagname('GameCamera') : this.scene.getObjectByTagname('EditorCamera');
  camera.update();
  this.handleKeyInput();

  this.core.setViewport(SETTINGS.get('viewport').x, SETTINGS.get('viewport').y, SETTINGS.get('viewport').width, SETTINGS.get('viewport').height);
  this.core.setSize(SETTINGS.get('viewport').width, SETTINGS.get('viewport').height);

  var scene = this.scene;

  if (this.playing === true) {
    scene = this.scenePlay;
    for (var i = 0; i < scene.children.length; ++i) {
      scene.children[i].traverse(scene.children[i].onUpdate, scene);
    }
  }

  if (scene.needsUpdate === true) {
    this.updatePickingList(scene);
    scene.needsUpdate = false;
  }

  console.log(this.cube.collider.overlaps(this.triangle.collider));
};

LEEWGL.EditorApp.prototype.handleKeyInput = function() {
  var camera = (this.playing === true) ? this.scenePlay.getObjectByTagname('GameCamera') : this.scene.getObjectByTagname('EditorCamera');

  if (this.activeKeys[LEEWGL.KEYS.PAGE_UP]) {
    camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), camera.down(), SETTINGS.get('translation-speed').y)));
  } else if (this.activeKeys[LEEWGL.KEYS.PAGE_DOWN]) {
    camera.transform.offsetPosition(vec3.scale(vec3.create(), camera.down(), SETTINGS.get('translation-speed').y));
  }

  if (this.activeKeys[LEEWGL.KEYS.LEFT_CURSOR]) {
    camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), camera.right(), SETTINGS.get('translation-speed').x)));
  } else if (this.activeKeys[LEEWGL.KEYS.RIGHT_CURSOR]) {
    camera.transform.offsetPosition(vec3.scale(vec3.create(), camera.right(), SETTINGS.get('translation-speed').x));
  }

  if (this.activeKeys[LEEWGL.KEYS.UP_CURSOR]) {
    camera.transform.offsetPosition(vec3.scale(vec3.create(), camera.forward(), SETTINGS.get('translation-speed').z));
  } else if (this.activeKeys[LEEWGL.KEYS.DOWN_CURSOR]) {
    camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), camera.forward(), SETTINGS.get('translation-speed').z)));
  }
};

LEEWGL.EditorApp.prototype.onRender = function() {
  this.clear();

  var camera = (this.playing === true) ? this.scenePlay.getObjectByTagname('GameCamera') : this.scene.getObjectByTagname('EditorCamera');
  var scene = this.scene;
  var that = this;

  if (this.playing === true)
    scene = this.scenePlay;

  this.light = scene.getObjectByTagname('Light');
  var activeShader = null;

  var renderShadowMap = function(element) {
    if (this.usesTexture === true) {
      activeShader = scene.shaders['texture'];
      scene.setActiveShader('texture');
    } else {
      activeShader = scene.shaders['color'];
      scene.setActiveShader('color');
    }
    var mat = mat4.multiply(mat4.create(), that.light.getProjection(), that.light.getView([0, 0, 0]));
    that.draw(this, activeShader, mat, camera, true);
  };

  var render = function(element) {
    if (that.playing === true)
      this.onRender(that.scene);

    if (this.usesTexture === true) {
      activeShader = scene.shaders['texture'];
      scene.setActiveShader('texture');
    } else if (this instanceof LEEWGL.Billboard) {
      activeShader = scene.shaders['billboard'];
      scene.setActiveShader('billboard');
    } else {
      activeShader = scene.shaders['color'];
      scene.setActiveShader('color');
    }

    if (that.picking === true && this.picking === true) {
      activeShader.use(that.gl);
      that.picker.bind(that.gl);

      activeShader.uniforms['uOffscreen'](1);
      that.draw(this, activeShader, camera.viewProjMatrix, camera);
      that.picker.unbind(that.gl);
      activeShader.uniforms['uOffscreen'](0);
    }

    that.draw(this, activeShader, camera.viewProjMatrix, camera);
  };


  var element = null;
  var i = 0;

  if (this.useShadows === true) {
    this.gl.cullFace(this.gl.FRONT);

    this.shadowmap.bind(this.gl);
    this.gl.viewport(0, 0, this.shadowmap.size.x, this.shadowmap.size.y);
    this.gl.colorMask(false, false, false, false);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

    for (i = 0; i < scene.children.length; ++i) {
      element = scene.children[i];
      element.traverse(renderShadowMap, element);
    }

    this.shadowmap.unbind(this.gl);
    this.gl.colorMask(true, true, true, true);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.cullFace(this.gl.BACK);
  }

  /// traverse all gameobjects and call draw method
  for (i = 0; i < scene.children.length; ++i) {
    element = scene.children[i];
    element.traverse(render, element);
  }
};

LEEWGL.EditorApp.prototype.draw = function(element, shader, viewProj, camera, shadow) {
  if (element.render === true) {
    shader.use(this.gl);
    shader.uniforms['uVP'](viewProj);

    if (element instanceof LEEWGL.Billboard) {
      if (shadow !== true)
        element.draw(this.gl, shader, camera);
    } else {
      if (this.useShadows === true)
        this.shadowmap.draw(this.gl, shader, this.light);
      if (this.light !== null) {
        this.light.draw(this.gl, shader);
      }
      element.draw(this.gl, shader, this.gl.TRIANGLES);
    }
  }
};

LEEWGL.EditorApp.prototype.onPlay = function() {
  this.playing = true;
  var that = this;

  var onInit = function() {
    var scripts = this.components['CustomScript'].applied;
    for (var scriptID in scripts) {
      this.addEventListener(scriptID, function() {
        var src = this.components['CustomScript'].applied[scriptID];
        var func = Function(src).bind(this);
        func();
      });
      this.dispatchEvent({
        'type': scriptID
      });
    }
    this.onInit(that.scenePlay);
  };

  /// create backup of scene
  this.scenePlay = this.scene.clone(undefined, true, true, '_PLAY');
  for (var i = 0; i < this.scenePlay.children.length; ++i) {
    var element = this.scenePlay.children[i];
    if (typeof element.components['CustomScript'] !== 'undefined')
      element.traverse(onInit);
  }

  this.updatePickingList(this.scenePlay);

  UI.setScene(this.scenePlay);
  UI.clearOutline();
  UI.addObjToOutline(this.scenePlay.children);
  if (UI.activeElement !== null)
    UI.setInspectorElement(UI.activeElement.id);
};

/**
 * @see {LEEWGL.UI.stop}
 * @callback LEEWGL.GameObject.onStop
 */
LEEWGL.EditorApp.prototype.onStop = function() {
  this.playing = false;
  var that = this;

  var onStop = function() {
    this.onStop(that.scene);
  };

  for (var i = 0; i < this.scenePlay.children.length; ++i) {
    var element = this.scenePlay.children[i];
    if (typeof element.components['CustomScript'] !== 'undefined')
      element.traverse(onStop);
  }

  this.updatePickingList(this.scene);

  UI.setScene(this.scene);
  UI.clearOutline();
  UI.addObjToOutline(this.scene.children);
  if (UI.activeElement !== null)
    UI.setInspectorElement(UI.activeElement.id);
};
