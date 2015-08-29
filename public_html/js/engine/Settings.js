/**
 * Class to handle the editable general options of the engine environment
 * This settings are not handled by UI class because they are affecting render behavior
 * @constructor
 * @param {number} options.display-precision
 * @param {number} options.translation-speed.x
 * @param {number} options.translation-speed.y
 * @param {number} options.translation-speed.z
 * @param {number} options.rotation-speed.x
 * @param {number} options.rotation-speed.y
 * @param {number} options.background-color.r
 * @param {number} options.background-color.g
 * @param {number} options.background-color.b
 * @param {number} options.background-color.a
 * @param {bool} options.depth-buffer
 * @param {number} options.viewport.x
 * @param {number} options.viewport.y
 * @param {number} options.viewport.width
 * @param {number} options.viewport.height
 * @param {number} options.fps
 */
LEEWGL.Settings = function(options) {
  this.options = {
    'display-precision': 4,
    'translation-speed': {
      'x': 0.1,
      'y': 0.1,
      'z': 0.1
    },
    'rotation-speed': {
      'x': 0.1,
      'y': 0.1
    },
    'background-color': {
      'r': 0.0,
      'g': 0.6,
      'b': 0.7,
      'a': 1.0
    },
    'depth-buffer': true,
    'viewport': {
      'x': 0,
      'y': 0,
      'width': 512,
      'height': 512
    },
    'fps': 60
  };

  extend(LEEWGL.Settings.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  /** @inner {object} */
  this.types = {
    'display-precision': 'input',
    'translation-speed': 'table',
    'rotation-speed': 'table',
    'background-color': 'table',
    'depth-buffer': 'checkbox',
    'viewport': 'table',
    'fps': 'input'
  };

  /**
   * Get a setting per name
   * @param  {string} name
   * @return {mixed}
   */
  this.get = function(name) {
    return this.options[name];
  };

  /**
   * Set a setting per name
   * @param  {string} name
   * @param  {mixed} value
   */
  this.set = function(name, value) {
    this.options[name] = value;
  };

 /**
  * Generates a dom container with contains all settings in input fields / table rows
  * @return {LEEWGL.DOM.Element}
  */
  this.toHTML = function() {
    var that = this;
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container'
    });

    var keydownTable = (function(event, td, vector) {
      var el = new LEEWGL.DOM.Element(td);
      var id = el.getParent().getParent().getParent().e.id;
      var num = el.get('num');
      var value = parseFloat(el.get('text'));
      vector = vector.value;

      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        vector[num] = value;
        that.set(id, vector);
        event.stopPropagation();
        event.preventDefault();
      }
    });

    var keydownInput = (function(event, input, content) {
      var el = new LEEWGL.DOM.Element(input);
      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        var id = el.getParent().e.id;
        that.set(id, el.e.value);
        event.stopPropagation();
        event.preventDefault();
      }
    });

    var componentsControlContainer = new LEEWGL.DOM.Element('div', {
      'class': 'controls-container'
    });
    var submit = new LEEWGL.DOM.Element('input', {
      'type': 'submit',
      'class': 'submit',
      'value': 'Update'
    });

    submit.addEvent('click', function(event) {
      this.updateFromHTML();
      event.preventDefault();
    }.bind(this));

    for (var prop in this.options) {
      if (this.types[prop] === 'input') {
        container.grab(HTMLHELPER.createContainerDetailInput(prop, prop, this.options[prop], keydownInput));
      } else if (this.types[prop] === 'table') {
        container.grab(HTMLHELPER.createTable(prop, Object.keys(this.options[prop]), {
          'value': this.options[prop]
        }, {
          'title': prop,
          'type': 'h4',
          'class': 'component-detail-headline'
        }, keydownTable));
      }
    }

    componentsControlContainer.grab(submit);
    container.grab(componentsControlContainer);
    return container;
  };

  /**
   * Update the options with the values from the input elements / table rows
   */
  this.updateFromHTML = function() {
    var element = null;
    for (var prop in this.options) {
      if (this.types[prop] === 'input') {
        element = new LEEWGL.DOM.Element(document.querySelector('input[identifier="' + prop + '"]'));
        this.set(prop, element.e.value);
      } else if (this.types[prop] === 'table') {
        var elements = document.querySelectorAll('td[identifier="' + prop + '"]');
        var arr = {};
        for (var i = 0; i < elements.length; ++i) {
          element = new LEEWGL.DOM.Element(elements[i]);
          arr[element.get('num')] = parseFloat(element.get('text'));
        }
        this.set(prop, arr);
      }
    }
    UI.displaySettings();
  };
};

/**
 * window load event to set global
 */
window.addEventListener('load', function() {
  var settings = new LEEWGL.Settings();
  /** @global */
  window.SETTINGS = settings;
});
