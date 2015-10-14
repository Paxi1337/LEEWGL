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

  /** @inner {number} */
  this.displayPrecision = this.options['display-precision'];
  /** @inner {vec3} */
  this.translationSpeed = this.options['translation-speed'];
  /** @inner {vec2} */
  this.rotationSpeed = this.options['rotation-speed'];
  /** @inner {vec4} */
  this.backgroundColor = this.options['background-color'];
  /** @inner {bool} */
  this.depthBuffer = this.options['depth-buffer'];
  /** @inner {object} */
  this.viewport = this.options['viewport'];
  /** @inner {number} */
  this.fps = this.options['fps'];
  /** @inner {object} */
  this.editables = {};

  /**
   * Initializes this.editables
   */
  this.setEditables = function() {
    var editables = {
      'displayPrecision': {
        'name': 'Display Precision',
        'type': 'number',
        'value': this.displayPrecision
      },
      'translationSpeed': {
        'name': 'Translation Speed',
        'table-titles': ['x', 'y', 'z'],
        'type': 'vector',
        'value': this.translationSpeed
      },
      'rotationSpeed': {
        'name': 'Rotation Speed',
        'table-titles': ['x', 'y'],
        'type': 'vector',
        'value': this.rotationSpeed
      },
      'backgroundColor': {
        'name': 'Background Color',
        'table-titles': ['r', 'g', 'b', 'a'],
        'type': 'vector',
        'value': this.backgroundColor
      },
      'depthBuffer': {
        'name': 'Depth Buffer',
        'type': 'array',
        'values' : [true, false],
        'value': this.depthBuffer
      },
      'viewport': {
        'name': 'Viewport',
        'table-titles': ['x', 'y', 'w', 'h'],
        'type': 'vector',
        'value': this.viewport
      },
      'fps': {
        'name': 'FPS',
        'type': 'number',
        'value': this.fps
      }
    };
    addToJSON(this.editables, editables);
    addPropertyToAllJSON(this.editables, 'alias');
    addSetMethodToJSON(this.editables);
  };

  this.setEditables();

  /**
   * Get a setting per name
   * @param  {string} name
   * @return {mixed}
   */
  this.get = function(name) {
    return this.editables[name].value;
  };

  /**
   * Set a setting per name
   * @param  {string} name
   * @param  {mixed} value
   */
  this.set = function(name, value) {
      this.editables.set(this, name, value);
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

    var keydownTable = (function(event, td, table, vector) {
      var id = td.get('identifier');
      var num = td.get('num');
      var value = parseFloat(td.get('text'));

      var size = table.size(false);
      table.setStyle('width', size.width + 'px');

      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        vector[num] = value;
        that.set(id, vector);
        event.stopPropagation();
        event.preventDefault();
      }
    });

    var keydownInput = (function(event, input, content) {
      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        var id = input.get('identifier');
        that.set(id, input.e.value);
        event.stopPropagation();
        event.preventDefault();
      }
    });

    var change = (function(event, element, content) {
      var id = element.get('identifier');
      that.set(id, element.e.value);
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

    for (var e in this.editables) {
      var editable = this.editables[e];
      if (editable.type === 'string' || editable.type === 'number') {
        container.grab(HTMLHELPER.createContainerDetailInput({
          'id': e,
          'container-class': 'component-detail-container',
          'headline-class': 'component-detail-headline',
          'headline-type': 'h4'
        }, editable.name, editable.value, keydownInput));
      } else if (editable.type === 'vector') {
        container.grab(HTMLHELPER.createTableAsDiv({
          'id': e,
          'container-class': 'component-detail-container',
          'table-class': 'm0auto dark-primary-color p5 max-width-280 fsize16',
          'table-width': 'fit',
          'headline-class': 'component-detail-headline',
          'headline-type': 'h4',
          'title-class': 'table-title',
          'content-class': 'editable table-content'
        }, editable['table-titles'], editable.value, editable.name, keydownTable));
      } else if (editable.type === 'array') {
        var content = JSON.parse(JSON.stringify(editable['values']));
        content.splice(editable.values.indexOf(editable.value), 1);
        container.grab(HTMLHELPER.createDropdown({
          'id': e,
          'container-class': 'component-detail-container',
          'headline-class': 'component-detail-headline',
          'headline-type': 'h4',
          'input-class': 'settings-dropdown'
        }, editable.name, content, change, editable.value));
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
    for (var e in this.editables) {
      var editable = this.editables[e];
      if (editable.type === 'string' || editable.type === 'number') {
        element = new LEEWGL.DOM.Element(document.querySelector('input[identifier="' + e + '"]'));
        this.set(e, element.e.value);
      } else if (editable.type === 'vector') {
        var elements = document.querySelectorAll('div[identifier="' + e + '"]');
        var arr = {};
        for (var i = 0; i < elements.length; ++i) {
          element = new LEEWGL.DOM.Element(elements[i]);
          arr[element.get('num')] = parseFloat(element.get('text'));
        }
        this.set(e, arr);
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
