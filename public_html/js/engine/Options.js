LEEWGL.REQUIRES.push('Options');

/**
 * [Options description]
 * Object to extend existing classes to have an options object
 */
LEEWGL.Options = function() {};

LEEWGL.Options.prototype = {
  /* [setOptions description]
   * @param {Array} options
   */
  setOptions: function(options) {
    if (typeof options !== 'undefined') {
      for (var attribute in this.options) {
        if (options.hasOwnProperty(attribute))
          this.options[attribute] = options[attribute];
      }
    }
  },
  addOptions: function(options) {
    if (typeof options !== 'undefined') {
      for (var attribute in options) {
        if (options.hasOwnProperty(attribute))
          this.options[attribute] = options[attribute];
      }
    }
  }
};
