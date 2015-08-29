/**
 * Object to extend existing classes to have an options object
 * @constructor
 */
LEEWGL.Options = function() {
  LEEWGL.REQUIRES.push('Options');
};

LEEWGL.Options.prototype = {
  /**
   * Set this.options
   * @param {object} options
   */
  setOptions: function(options) {
    if (typeof options !== 'undefined') {
      for (var attribute in this.options) {
        if (options.hasOwnProperty(attribute))
          this.options[attribute] = options[attribute];
      }
    }
  },
  /**
   * Add extended options
   * @param {object} options
   */
  addOptions: function(options) {
    if (typeof options !== 'undefined') {
      for (var attribute in options) {
        if (options.hasOwnProperty(attribute))
          this.options[attribute] = options[attribute];
      }
    }
  }
};
