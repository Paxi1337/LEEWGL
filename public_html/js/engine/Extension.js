/**
 * Class to abstract gl.getExtension
 * @constructor
 */
LEEWGL.Extension = function() {
  LEEWGL.REQUIRES.push('Extension');
  /** @inner {array} */
  this.vendorPrefixes = ["", "WEBKIT_", "MOZ_"];

  /**
   * @param  {webGLContext} gl
   * @param  {string} name
   * @return {webGLExtension}  
   */
  this.getExtension = function(gl, name) {
    var prefix, ext;
    for (prefix in this.vendorPrefixes) {
      ext = gl.getExtension(this.vendorPrefixes[prefix] + name);
      if (ext)
        return ext;
    }
    return null;
  };
};

/** @global */
var __extensionLoader = new LEEWGL.Extension();
