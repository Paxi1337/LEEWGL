LEEWGL.REQUIRES.push('TestApp');

LEEWGL.TestApp = function(options) {
  LEEWGL.App.call(this, options);

  this.ajax = new LEEWGL.AsynchRequest();
  this.scene = new LEEWGL.Scene();
  this.camera = null;
};

LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function() {
  var stringified = this.ajax.send('POST', LEEWGL.ROOT + 'php/get_file_content.php', false, null).response.responseText;
  this.scene = this.scene.import(stringified);

  this.core.setViewport(0, 0, 512, 512);
  this.core.setSize(512, 512);

  this.camera = this.scene.children[0];
  this.camera.transform.setPosition([0.0, 0.0, 10.0]);
  this.camera.setLookAt([0.0, 0.0, -1.0]);

  var colorShader = new LEEWGL.Shader();
  var textureShader = new LEEWGL.Shader();

  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, this.scene.shaders.color.code.vertex);
  colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, this.scene.shaders.color.code.fragment.trim());
  colorShader.linkShader(this.gl);
  colorShader.use(this.gl);

  colorShader.createUniformSetters(this.gl);
  colorShader.createAttributeSetters(this.gl);

  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, this.scene.shaders.texture.code.vertex);
  textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, this.scene.shaders.texture.code.fragment);
  textureShader.linkShader(this.gl);
  textureShader.use(this.gl);

  textureShader.createUniformSetters(this.gl);
  textureShader.createAttributeSetters(this.gl);


  this.scene.shaders.color = colorShader;
  this.scene.shaders.texture = textureShader;
  for (var i = 0; i < this.scene.children.length; ++i) {
    if (typeof this.scene.children[i].setBuffer === 'function') {
      this.scene.children[i].setBuffer(this.gl);
      this.scene.children[i].addColor(this.gl);
    }
  }
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

  var viewProjection = this.camera.viewProjMatrix;
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

    // activeShader.uniforms['uOffscreen'](0);

    this.draw(element, activeShader, viewProjection);
  }
};

LEEWGL.TestApp.prototype.draw = function(element, shader, viewProjection) {
  if (element.render === true) {
    shader.use(this.gl);
    shader.uniforms['uVP'](viewProjection);

    element.draw(this.gl, shader, this.gl.TRIANGLES);
  }
};
