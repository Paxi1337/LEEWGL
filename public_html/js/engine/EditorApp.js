/**
 * Application which handles the scene in the editor environment
 * Provides events and UI specific functions to act as an editor
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
  this.light = new LEEWGL.Light.PointLight({
    'alias': 'Light',
    'tagname': 'Light',
    'ambient': [1.0, 1.0, 1.0],
    'specular': 10
  });

  this.billboard = new LEEWGL.Billboard({
    'alias': 'Billboard',
    'tagname': 'Billboard'
  });

  this.text = new LEEWGL.Text({
    'canvas': document.querySelector('#text-canvas')
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
  /** @inner {vec2} */
  this.resolution = vec2.fromValues(512, 512);

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
  this.shadowmap = new LEEWGL.Shadowmap({
    'size': {
      'x': 2048,
      'y': 2048
    }
  });
  /** @inner {bool} */
  this.useShadows = true;
};

LEEWGL.EditorApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.EditorApp.prototype.onCreate = function() {
  var that = this;

  this.core.setViewport(0, 0, 512, 512);
  this.core.setSize(512, 512);

  this.camera.transform.setPosition([0.0, 0.0, 10.0]);

  this.gameCamera.transform.setPosition([10.0, 0.0, 10.0]);
  this.gameCamera.setLookAt([0.0, 0.0, -1.0]);
  this.gameCamera.add(this.cameraGizmo);
  this.cameraGizmo.transform.setPosition([10.0, 0.0, 10.0]);

  this.light.transform.setPosition([0.0, 5.0, 1.0]);

  var shader = this.initShaders(this.light.shaderType);

  this.scene.setShader('color', shader.color);
  this.scene.setShader('texture', shader.texture);
  this.scene.setShader('billboard', shader.billboard);
  this.scene.setShader('bumpMap', shader.bumpMap);
  this.scenePlay.setShader('color', shader.color);
  this.scenePlay.setShader('texture', shader.texture);
  this.scenePlay.setShader('billboard', shader.billboard);
  this.scenePlay.setShader('bumpMap', shader.bumpMap);

  this.cameraGizmo.setBuffer(this.gl);
  this.cameraGizmo.addColor(this.gl, ColorHelper.getUniqueColor());

  this.triangle.setBuffer(this.gl);
  this.triangle.addColor(this.gl, ColorHelper.getUniqueColor());
  this.triangle.transform.setPosition([0, 0, 0]);

  this.cube.setBuffer(this.gl);
  this.cube.addColor(this.gl, ColorHelper.getUniqueColor());
  this.cube.transform.setPosition([5, 0, 0]);

  this.cube.addComponent(new LEEWGL.Component.CustomScript());

  this.cube.addComponent(new LEEWGL.Component.Texture());
  this.cube.components['Texture'].init(this.gl, LEEWGL.ROOT + 'texture/masonry-wall-texture.jpg');

  // this.cube.addComponent(new LEEWGL.Component.BumpMap());
  // this.cube.components['BumpMap'].init(this.gl, LEEWGL.ROOT + 'texture/masonry-wall-normal-map.jpg');

  this.grid.setBuffer(this.gl);
  this.grid.addColor(this.gl, ColorHelper.getUniqueColor());
  this.grid.transform.translate([0.0, -5.0, 0.0]);

  var billboard = new LEEWGL.Component.Billboard();
  billboard.init(this.gl, this.camera, LEEWGL.ROOT + 'texture/lightbulb.png');

  this.light.addComponent(billboard);

  this.billboard.init(this.gl, this.camera, LEEWGL.ROOT + 'texture/lightbulb.png');
  this.billboard.setBuffer(this.gl);
  // this.light.add(this.billboard);
  this.cube.add(this.cameraGizmo);

  this.billboard.transform.translate([0.0, 10.0, 10.0]);
  // this.gameCamera.add(this.billboard);
  // this.billboard.transform.setPosition([0, 0, 0]);

  // test load collada file
  // var Importer = new LEEWGL.Importer();
  // var model = Importer.import('models/cup.obj', this.gl);

  this.scene.add(this.camera, this.gameCamera, this.triangle, this.cube, this.light);

  this.gl.depthFunc(this.gl.LEQUAL);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  this.gl.enable(this.gl.BLEND);
  this.gl.enable(this.gl.CULL_FACE);

  if (this.picking === true)
    this.picker.init(this.gl, this.canvas.width, this.canvas.height);

  if (this.useShadows === true)
    this.shadowmap.init(this.gl);

  this.scene.setActiveShader('color');
  this.scenePlay.setActiveShader('color');

  UI.setApp(this);
  UI.setScene(this.scene);
  UI.addObjToOutline(this.scene.children);
  UI.setTransformationMode('translation');

  this.text.draw('Hello World!', 300);
  this.text.createTexture(this.gl);

  this.cube.components['Texture'].texture = this.text.texture;

  // console.log(encodeURI(test));

  // console.log(this.scene.shaders.color.code.fragment);
  // console.log(colorShader.code.fragment == this.scene.shaders.color.code.fragment);

  // var json = JSON.parse(test);

  // console.log(this.scene.shaders);
  // console.log(json.shaders.color.code.fragment);
};

LEEWGL.EditorApp.prototype.initShaders = function(lightType) {
  SHADER_LIBRARY.reset();

  SHADER_LIBRARY.addParameterChunks([LEEWGL.ShaderLibrary.INIT, LEEWGL.ShaderLibrary.BILLBOARD, LEEWGL.ShaderLibrary.PICKING]);

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
  var bumpMapShader = new LEEWGL.Shader();
  var shadowShader = new LEEWGL.Shader();
  var shadowTextureShader = new LEEWGL.Shader();

  if (this.useShadows === true) {
    // if (lightType === LEEWGL.ShaderLibrary.POINT || lightType === LEEWGL.ShaderLibrary.SPOT)
    SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.SHADOW_MAPPING_POSITIONAL_LIGHT);
  }

  SHADER_LIBRARY.addParameterChunks([LEEWGL.ShaderLibrary.INIT, LEEWGL.ShaderLibrary.DEFAULT, LEEWGL.ShaderLibrary.PICKING, LEEWGL.ShaderLibrary.COLOR, LEEWGL.ShaderLibrary.AMBIENT, lightType]);

  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));
  SHADER_LIBRARY.removeParameterChunk(LEEWGL.ShaderLibrary.COLOR);

  SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.TEXTURE);
  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));

  SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.BUMPMAP);
  bumpMapShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  bumpMapShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));

  colorShader.linkShader(this.gl);
  colorShader.use(this.gl);

  colorShader.createUniformSetters(this.gl);
  colorShader.createAttributeSetters(this.gl);

  textureShader.linkShader(this.gl);
  textureShader.use(this.gl);

  textureShader.createUniformSetters(this.gl);
  textureShader.createAttributeSetters(this.gl);

  bumpMapShader.linkShader(this.gl);
  bumpMapShader.use(this.gl);

  bumpMapShader.createUniformSetters(this.gl);
  bumpMapShader.createAttributeSetters(this.gl);

  return {
    'color': colorShader,
    'texture': textureShader,
    'bumpMap': bumpMapShader,
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
    this.scene.setShader('bumpMap', shader.bumpMap);
    this.scene.setShader('billboard', shader.billboard);
    this.scenePlay.setShader('color', shader.color);
    this.scenePlay.setShader('texture', shader.texture);
    this.scenePlay.setShader('bumpMap', shader.bumpMap);
    this.scenePlay.setShader('billboard', shader.billboard);

    this.scene.setActiveShader('color');
    this.scenePlay.setActiveShader('color');
  }
};

LEEWGL.EditorApp.prototype.updatePickingList = function(scene) {
  if (this.picking === true) {
    this.picker.clear();
    var that = this;
    var addToPicker = function() {
      if (typeof this.buffers !== 'undefined')
        that.picker.addToList(this);
    };

    for (var i = 0; i < scene.children.length; ++i) {
      var element = scene.children[i];
      element.traverse(addToPicker);
    }
    this.picker.init(this.gl, this.canvas.width, this.canvas.height);
  }
};

LEEWGL.EditorApp.prototype.onMouseDown = function(event) {
  var button = getMouseInformation(event).button;
  var mouseCords = UI.getRelativeMouseCoordinates(event, this.canvas);
  event.target.focus();

  var obj = null;

  if (event.which !== 3 && button !== LEEWGL.MOUSE.RIGHT) {
    if (this.picking === true) {
      obj = this.picker.pick(this.gl, mouseCords.x, mouseCords.y);
      if (obj !== null) {
        if (obj.editables.picking.value) {
          this.activeElement = obj;
          this.movement.x = 0;
          this.movement.y = 0;
          UI.setInspectorElement(obj.id);
        }
      } else {
        UI.setInspectorElement(-1);
      }
    }
  }
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.EditorApp.prototype.onMouseMove = function(event) {
  var mouseInformation = getMouseInformation(event);
  var movement = mouseInformation.movement;
  var button = mouseInformation.button;

  var camera = (this.playing === true) ? this.scenePlay.getObjectByTagname('GameCamera') : this.scene.getObjectByTagname('EditorCamera');
  var rad = LEEWGL.Math.degToRad(10);

  if (event.which === 3 || button === LEEWGL.MOUSE.RIGHT) {
    movement.x = (SETTINGS.get('rotationSpeed').x * movement.x);
    movement.y = (SETTINGS.get('rotationSpeed').y * movement.y);
    camera.offsetOrientation(movement.y, movement.x);
  } else if ((event.which === 1 || button === LEEWGL.MOUSE.LEFT) && this.activeElement !== null) {
    var forward = camera.forward();

    var mode = UI.transformationMode;

    this.movement.x = movement.x * this.translationSpeed.y;
    this.movement.y = movement.y * this.translationSpeed.y;

    var movementWorld = [this.movement.x, -this.movement.y, 0.0];
    var movementScale = [this.movement.x, -this.movement.y, this.movement.x];

    if (mode === LEEWGL.EDITOR.TRANSFORMATION.TRANSLATE) {
      var trans = function(args) {
        this.translate(args[0], args[1]);
      };

      if (event.altKey)
        this.activeElement.traverse(trans, [movementWorld, 'local']);
      else if (event.ctrlKey)
        this.activeElement.traverse(trans, [
          [movementWorld[2], movementWorld[1], movementWorld[0]]
        ]);
      else
        this.activeElement.traverse(trans, [movementWorld]);
    } else if (mode === LEEWGL.EDITOR.TRANSFORMATION.ROTATE) {
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
    } else if (mode === LEEWGL.EDITOR.TRANSFORMATION.SCALE) {
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

LEEWGL.EditorApp.prototype.handleKeyInput = function() {
  var camera = (this.playing === true) ? this.scenePlay.getObjectByTagname('GameCamera') : this.scene.getObjectByTagname('EditorCamera');

  if (this.activeKeys[LEEWGL.KEYS.PAGE_UP]) {
    camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), camera.down(), SETTINGS.get('translationSpeed').y)));
  } else if (this.activeKeys[LEEWGL.KEYS.PAGE_DOWN]) {
    camera.transform.offsetPosition(vec3.scale(vec3.create(), camera.down(), SETTINGS.get('translationSpeed').y));
  }

  if (this.activeKeys[LEEWGL.KEYS.LEFT_CURSOR]) {
    camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), camera.right(), SETTINGS.get('translationSpeed').x)));
  } else if (this.activeKeys[LEEWGL.KEYS.RIGHT_CURSOR]) {
    camera.transform.offsetPosition(vec3.scale(vec3.create(), camera.right(), SETTINGS.get('translationSpeed').x));
  }

  if (this.activeKeys[LEEWGL.KEYS.UP_CURSOR]) {
    camera.transform.offsetPosition(vec3.scale(vec3.create(), camera.forward(), SETTINGS.get('translationSpeed').z));
  } else if (this.activeKeys[LEEWGL.KEYS.DOWN_CURSOR]) {
    camera.transform.offsetPosition(vec3.negate(vec3.create(), vec3.scale(vec3.create(), camera.forward(), SETTINGS.get('translationSpeed').z)));
  }
};

LEEWGL.EditorApp.prototype.onUpdate = function() {
  var camera = (this.playing === true) ? this.scenePlay.getObjectByTagname('GameCamera') : this.scene.getObjectByTagname('EditorCamera');
  camera.update();
  this.handleKeyInput();

  this.core.setViewport(SETTINGS.get('viewport').x, SETTINGS.get('viewport').y, SETTINGS.get('viewport').width, SETTINGS.get('viewport').height);
  this.core.setSize(SETTINGS.get('viewport').width, SETTINGS.get('viewport').height);

  var scene = (this.playing === true) ? this.scenePlay : this.scene;

  var updateComponents = function() {
    for (var comp in this.components) {
      var component = this.components[comp];
      if (typeof component.update === 'undefined')
        continue;
      component.update(this);
    }
  };

  for (var i = 0; i < scene.children.length; ++i) {
    element = scene.children[i];
    if (this.playing === true)
      element.traverse(element.onUpdate, scene);
    element.traverse(updateComponents);
  }

  if (scene.needsUpdate === true) {
    this.updatePickingList(scene);
    scene.needsUpdate = false;
  }

  UI.outlineToHTML('#dynamic-outline');
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

  var renderShadowMap = function() {
    var el = this;
    var renderer = el.components['Renderer'];

    if (typeof renderer === 'undefined')
      return;
    if (renderer.options['cast-shadow'] === false)
      return;

    if (el.usesTexture === true) {
      activeShader = scene.shaders['texture'];
      scene.setActiveShader('texture');

      if (el.usesBumpMap === true) {
        activeShader = scene.shaders['bumpMap'];
        scene.setActiveShader('bumpMap');
      }
    } else {
      activeShader = scene.shaders['color'];
      scene.setActiveShader('color');
    }

    var proj = mat4.create(),
      view = mat4.create();

    if (that.light instanceof LEEWGL.Light.DirectionalLight) {
      proj = that.light.getProjection(camera);
      view = that.light.getView(camera);
    } else {
      proj = that.light.getProjection();
      view = that.light.getView([0.0, 0.0, 0.0]);
    }

    renderer.set({
      'uniforms': {
        'uView': view,
        'uProjection': proj,
        'uResolution': that.resolution
      }
    });
    that.draw(el, activeShader, camera, true);
  };

  var render = function() {
    var el = this;
    var renderer = el.components['Renderer'];
    var renderEnabled = el.editables.render.value;

    if (typeof renderer === 'undefined' || !renderEnabled)
      return;

    if (that.playing === true)
      el.onRender(scene);

    if (el instanceof LEEWGL.Billboard) {
      activeShader = scene.shaders['billboard'];
      scene.setActiveShader('billboard');
    } else {
      if (el.usesTexture === true) {
        activeShader = scene.shaders['texture'];
        scene.setActiveShader('texture');

        if (el.usesBumpMap === true) {
          activeShader = scene.shaders['bumpMap'];
          scene.setActiveShader('bumpMap');
        }
      } else {
        activeShader = scene.shaders['color'];
        scene.setActiveShader('color');
      }
    }

    renderer.set(camera.renderData());
    renderer.set({
      'unforms': {
        'uResolution': that.resolution
      }
    });


    if (that.picking === true && renderer.options['picking'] === true) {
      that.picker.bind(that.gl);
      renderer.set({
        'uniforms': {
          'uOffscreen': 1
        }
      });
      that.draw(el, activeShader, camera);
      that.picker.unbind(that.gl);
      renderer.set({
        'uniforms': {
          'uOffscreen': 0
        }
      });
    }

    that.draw(el, activeShader, camera);
  };

  var renderComponents = function() {
    for (var comp in this.components) {
      var component = this.components[comp];
      var renderer = component.renderer;
      if (typeof renderer === 'undefined')
        continue;
      if (component instanceof LEEWGL.Component.Billboard) {
        activeShader = scene.shaders['billboard'];
        scene.setActiveShader('billboard');
      }
      renderer.setShader(activeShader);
      renderer.set(component.renderData());
      renderer.set(camera.renderData());
      renderer.draw(that.gl, activeShader);
      component.draw(that.gl);
    }

    var billboard = this.components['Billboard'];

    if (typeof billboard !== 'undefined') {
      activeShader = scene.shaders['billboard'];
      scene.setActiveShader('billboard');
      billboard.draw(that.gl, activeShader);
    }
  };

  var element = null;
  var i = 0;

  if (this.useShadows === true) {
    this.shadowmap.bind(this.gl);

    for (i = 0; i < scene.children.length; ++i) {
      element = scene.children[i];
      element.traverse(renderShadowMap);
    }
    this.shadowmap.unbind(this.gl, this.canvas.width, this.canvas.height);
  }

  /// traverse all gameobjects and call draw method
  for (i = 0; i < scene.children.length; ++i) {
    element = scene.children[i];
    element.traverse(render);
    element.traverse(renderComponents);
  }
};

LEEWGL.EditorApp.prototype.draw = function(element, shader, camera) {
  var renderer = element.components['Renderer'];
  renderer.setShader(shader);

  if (renderer.options['visible'] === false)
    return;

  var renderData = element.renderData();
  var lightRenderData = this.light.renderData();
  renderer.set(renderData);
  renderer.set(lightRenderData);

  renderer.draw(this.gl, shader);

  if (element instanceof LEEWGL.Billboard) {
    element.draw(this.gl, shader, camera);
  } else {
    if (this.useShadows === true) {
      renderer.set(this.shadowmap.renderData(camera, this.light));
      renderer.draw(this.gl, shader);
      this.shadowmap.draw(this.gl);
    }
    element.draw(this.gl, this.gl.TRIANGLES);
  }
};

LEEWGL.EditorApp.prototype.onPlay = function() {
  this.playing = true;
  var that = this;

  var onInit = function() {
    if (typeof this.components['CustomScript'] === 'undefined')
      return;

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
