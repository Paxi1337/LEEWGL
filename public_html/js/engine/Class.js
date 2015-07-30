LEEWGL.REQUIRES.push('Class');

LEEWGL.Class = function() {
  this.extend = function(dest, src) {
    for (var s in src) {
      if (src.hasOwnProperty(s)) {
        dest[s] = src[s];
      }
    }
    return dest;
  };
};
