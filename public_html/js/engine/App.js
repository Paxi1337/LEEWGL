LEEWGL.REQUIRES.push('App');

LEEWGL.App = function(options) {
  this.type = 'App';

  this.core = options.core;
  this.gl = this.core.getContext();
  this.canvas = this.core.getCanvas();

  this.shaderLibrary = new LEEWGL.ShaderLibrary();

  this.mouseVector = vec3.create();
};

LEEWGL.App.prototype = {
  constructor: LEEWGL.App,

  onCreate: function() {},

  onUpdate: function() {},

  onRender: function() {},

  onKeyUp: function(event) {},

  onKeyDown: function(event) {},

  onMouseDown: function(event) {},
  onMouseUp: function(event) {},
  onMouseMove: function(event) {},
  onPlay: function() {},
  onStop: function() {},
  clear: function() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(SETTINGS.get('background-color').r, SETTINGS.get('background-color').g, SETTINGS.get('background-color').b, SETTINGS.get('background-color').a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.colorMask(true, true, true, true);
  }
};
