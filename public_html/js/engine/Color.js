LEEWGL.Color = function() {
  this.colors = {};
};

LEEWGL.Color.prototype = {
  constructor: LEEWGL.Color,

  getLabelColor: function() {
    var color = [Math.random(), Math.random(), Math.random(), 1.0];
    var key = color[0] + ':' + color[1] + ':' + color[2];

    if (key in this.colors) {
      return getUniqueColor();
    } else {
      this.colors[key] = true;
      return color;
    }
  },

  getDiffuseColor: function(i) {
    var c = (i % 30 / 60) + 0.3;
    return [c, c, c, 1];
  }
};

window.addEventListener('load', function() {
  var color = new LEEWGL.Color();
  window.ColorHelper = color;
});
