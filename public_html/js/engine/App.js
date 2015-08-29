/**
 * @constructor
 * @param  {LEEWGL.Core} options.core
 */
LEEWGL.App = function(options) {
  LEEWGL.REQUIRES.push('App');
  this.options = {
    'core': null
  };

  extend(LEEWGL.App.prototype, LEEWGL.Options.prototype);
  this.setOptions(options);

  /** @inner {string} */
  this.type = 'App';

  /** @inner {LEEWGL.Core} */
  this.core = this.options['core'];
  /** @inner {webGLContext} */
  this.gl = this.core.getContext();
  /** @inner {DOMElement} */
  this.canvas = this.core.getCanvas();

  /** @inner {LEEWGL.ShaderLibrary} */
  this.shaderLibrary = new LEEWGL.ShaderLibrary();

  /** @inner {vec3} */
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
