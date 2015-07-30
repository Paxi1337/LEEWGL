LEEWGL.REQUIRES.push('Class');

LEEWGL.Class = function() {};

LEEWGL.Class.prototype = {
  extend: function(dest, src) {
    for (var s in src) {
      if (src.hasOwnProperty(s)) {
        dest[s] = src[s];
      }
    }
    return dest;
  },
  fromString: function(str) {
    var arr = str.split(".");
    var fn = window;
    for (var i = 0; i < arr.length; ++i) {
      fn = fn[arr[i]];
    }

    return fn;
  }
}
