/**
 * @constructor
 */
LEEWGL.Color = function() {
  this.colors = {};
};

LEEWGL.Color.prototype = {
  constructor: LEEWGL.Color,

  /**
   * Returns an unique color
   * @return {vec4} color
   */
  getUniqueColor: function() {
    var color = [Math.random(), Math.random(), Math.random(), 1.0];
    var key = color[0] + ':' + color[1] + ':' + color[2];

    if (key in this.colors) {
      return getUniqueColor();
    } else {
      this.colors[key] = true;
      return color;
    }
  }
};

/**
 * window load event to set global
 */
window.addEventListener('load', function() {
  var color = new LEEWGL.Color();
  /** @global */
  window.ColorHelper = color;
});
