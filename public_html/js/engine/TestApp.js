LEEWGL.REQUIRES.push('TestApp');

LEEWGL.TestApp = function(options) {
  LEEWGL.App.call(this, options);

  this.ajax = new LEEWGL.AsynchRequest();
  this.scene = new LEEWGL.Scene();
  this.camera = null;
  this.light = null;
};

LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function() {
  var stringified = this.ajax.send('POST', LEEWGL.ROOT + 'php/get_file_content.php', false, null).response.responseText;
  this.scene = this.scene.import(this.gl, stringified);

  this.core.setViewport(0, 0, 512, 512);
  this.core.setSize(512, 512);

  this.camera = this.scene.getObjectByTagname('GameCamera');
  this.light = this.scene.getObjectByTagname('Light');

  this.camera.transform.setPosition([0.0, 0.0, 10.0]);
  this.camera.setLookAt([0.0, 0.0, -1.0]);

  var shader = this.initShaders(LEEWGL.ShaderLibrary.SPOT);
  this.scene.setShader('color', shader.color);
  this.scene.setShader('texture', shader.texture);
  this.scene.setShader('billboard', shader.billboard);

  var setBuffers = function(gl) {
    if (typeof this.setBuffer === 'function') {
      this.setBuffer(gl);
      this.addColor(gl, ColorHelper.getUniqueColor());
    }
  };
  this.scene.traverse(setBuffers, this.gl);

  console.log(this.scene.children);

  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.depthFunc(this.gl.LEQUAL);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  this.gl.enable(this.gl.BLEND);
  this.gl.enable(this.gl.CULL_FACE);
};

LEEWGL.TestApp.prototype.initShaders = function(lightType) {
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

  SHADER_LIBRARY.addParameterChunks([LEEWGL.ShaderLibrary.DEFAULT, LEEWGL.ShaderLibrary.PICKING, LEEWGL.ShaderLibrary.COLOR, LEEWGL.ShaderLibrary.AMBIENT, lightType]);

  if (this.useShadows === true)
    SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.SHADOW_MAPPING);

  var colorShader = new LEEWGL.Shader();

  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));
  colorShader.linkShader(this.gl);
  colorShader.use(this.gl);

  colorShader.createUniformSetters(this.gl);
  colorShader.createAttributeSetters(this.gl);

  SHADER_LIBRARY.removeParameterChunk(LEEWGL.ShaderLibrary.COLOR);
  SHADER_LIBRARY.addParameterChunk(LEEWGL.ShaderLibrary.TEXTURE);

  var textureShader = new LEEWGL.Shader();

  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, SHADER_LIBRARY.out(LEEWGL.Shader.VERTEX));
  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, SHADER_LIBRARY.out(LEEWGL.Shader.FRAGMENT));
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

LEEWGL.TestApp.prototype.updatePickingList = function() {};

LEEWGL.TestApp.prototype.onMouseDown = function(event) {
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.TestApp.prototype.onMouseMove = function(event) {};

LEEWGL.TestApp.prototype.onMouseUp = function(event) {
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.TestApp.prototype.onKeyUp = function(event) {
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.TestApp.prototype.onKeyDown = function(event) {
  event.preventDefault();
  event.stopPropagation();
};

LEEWGL.TestApp.prototype.onUpdate = function() {
  this.camera.update();
};

LEEWGL.TestApp.prototype.handleKeyInput = function() {};

LEEWGL.TestApp.prototype.onRender = function() {
  this.clear();

  var camera = this.scene.getObjectByTagname('GameCamera');
  var viewProjection = camera.viewProjMatrix;
  var scene = this.scene;
  var that = this;

  var activeShader = null;

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

    activeShader.use(that.gl);

  //   if (that.useShadows === true) {
  //     that.shadowmap.bind(that.gl, activeShader);
  //     var shadowVP = mat4.create();
  //     mat4.multiply(shadowVP, that.light.getProjection(), that.light.getView([0, 0, 0]));
  //     that.draw(this, activeShader, shadowVP);
  //
  //     that.shadowmap.unbind(that.gl, activeShader);
  //     that.clear();
  //   }
    that.draw(this, activeShader, camera);
  };

  /// traverse all gameobjects and call draw method
  for (var i = 0; i < scene.children.length; ++i) {
    var element = scene.children[i];
    element.traverse(render, element);
  }
};

LEEWGL.TestApp.prototype.draw = function(element, shader, camera) {
  if (element.render === true) {
    shader.use(this.gl);
    shader.uniforms['uVP'](camera.viewProjMatrix);

    if (this.useShadows === true)
      this.shadowmap.draw(this.gl, shader, this.light);

    if (element instanceof LEEWGL.Billboard) {
      element.draw(this.gl, shader, camera);
    } else {
      if (this.light !== null)
        this.light.draw(this.gl, shader);
      element.draw(this.gl, shader, this.gl.TRIANGLES);
    }
  }
};
