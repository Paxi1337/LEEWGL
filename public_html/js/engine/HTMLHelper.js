/**
 * @constructor
 */
LEEWGL.HTMLHelper = function() {
  /**
   * @param {string} options.id
   * @param {string} options.container-class
   * @param {string} options.table-class
   * @param {string} options.table-width
   * @param {number} options.table-width-padding
   * @param {string} options.headline-class
   * @param {string} options.headline-type
   * @param {string} options.title-class
   * @param {string} options.content-class
   * @param {array} header
   * @param {array} content
   * @param {string} headline
   * @param {function} keydown
   * @param {function} keyup
   * @return {LEEWGL.DOM.Element} container
   */
  this.createTableAsDiv = function(options, header, content, headline, keydown, keyup) {
    headline = (typeof headline !== 'undefined' && headline !== null) ? headline : '';
    keydown = (typeof keydown !== 'undefined' && keydown !== null) ? keydown : (function() {});
    keyup = (typeof keyup !== 'undefined') ? keyup : (function() {});

    var headerLength = (typeof header.length !== 'undefined') ? header.length : Object.keys(header).length;
    var contentLength = (typeof content.length !== 'undefined') ? content.length : Object.keys(content).length;

    if (headerLength !== contentLength) {
      console.error('LEEWGL.HTMLHelper.createTableAsDiv: content and header must have the same length!');
      return false;
    }

    var that = this;
    var container = new LEEWGL.DOM.Element('div', {
      'class': (typeof options['container-class'] !== 'undefined') ? options['container-class'] : ''
    });
    var table = new LEEWGL.DOM.Element('div', {
      'class': (typeof options['table-class'] !== 'undefined') ? options['table-class'] : ''
    });

    var fillTable = function(index, content) {
      var td = new LEEWGL.DOM.Element('div', {
        'num': index,
        'class': (typeof options['content-class'] !== 'undefined') ? options['content-class'] : ''
      });

      var c = content[index];

      if (typeof c === 'number') {
        /// remove trailing zeros
        var n = parseFloat(c.toString());
        var displayPrecision = SETTINGS.get('displayPrecision');

        if (numDigits(n) > displayPrecision)
          n = n.toPrecision(displayPrecision);
        td.set('html', n);
      } else {
        td.set('html', c);
      }

      if (typeof options.id !== 'undefined')
        td.setAttribute('identifier', options.id);

      td.addEvent('keydown', function(event) {
        keydown(event, td, table, content);
      });

      td.addEvent('keyup', function(event) {
        keyup(event, td, table, content);
      });

      return td;
    };

    var headlineContainer = new LEEWGL.DOM.Element('div');
    var h = new LEEWGL.DOM.Element((typeof options['headline-type'] !== 'undefined') ? options['headline-type'] : 'h1', {
      'class': (typeof options['headline-class'] !== 'undefined') ? options['headline-class'] : '',
      'html': headline
    });
    headlineContainer.grab(h);
    container.grab(headlineContainer);

    var lineBreak = new LEEWGL.DOM.Element('div', {
      'class': 'clearer'
    });

    var i = 0;
    if (typeof content.length === 'undefined') {
      for (var prop in content) {
        var tr = new LEEWGL.DOM.Element('div', {
          'class': (typeof options['title-class'] !== 'undefined') ? options['title-class'] : '',
          'html': header[i]
        });
        var td = fillTable(prop, content);
        table.grab(tr);
        table.grab(td);

        if ((header.length % (i + 1)) === 0)
          table.grab(lineBreak);
        i++;
      }
    } else {
      for (i = 0; i < content.length; ++i) {
        var tr = new LEEWGL.DOM.Element('div', {
          'class': (typeof options['title-class'] !== 'undefined') ? options['title-class'] : '',
          'html': header[i]
        });
        var td = fillTable(i, content);
        table.grab(tr);
        table.grab(td);
        if ((header.length % (i + 1)) === 0)
          table.grab(lineBreak);
      }
    }

    if (typeof options['table-width'] !== 'undefined') {
      if (options['table-width'] === 'fit') {
        options['table-width-padding'] = (typeof options['table-width-padding'] !== 'undefined') ? options['table-width-padding'] : 0;
        var size = table.size(false);
        table.setStyle('width', size.width + options['table-width-padding'] + 'px');
      } else {
        table.setStyle('width', options['table-width']);
      }
    }

    container.grab(table);
    return container;
  };
  /**
   * @param {string} options.id
   * @param {string} options.container-class
   * @param {string} options.table-class
   * @param {string} options.table-width
   * @param {number} options.table-width-padding
   * @param {string} options.headline-class
   * @param {string} options.headline-type
   * @param {string} options.title-class
   * @param {string} options.content-class
   * @param {array} header
   * @param {array} content
   * @param {string} headline
   * @param {function} keydown
   * @param {function} keyup
   * @return {LEEWGL.DOM.Element} container
   */
  this.createTable = function(options, header, content, headline, keydown, keyup) {
    headline = (typeof headline !== 'undefined' && headline !== null) ? headline : '';
    keydown = (typeof keydown !== 'undefined' && keydown !== null) ? keydown : (function() {});
    keyup = (typeof keyup !== 'undefined') ? keyup : (function() {});

    var headerLength = (typeof header.length !== 'undefined') ? header.length : Object.keys(header).length;
    var contentLength = (typeof content.length !== 'undefined') ? content.length : Object.keys(content).length;

    if (headerLength !== contentLength) {
      console.error('LEEWGL.HTMLHelper.createTable: content and header must have the same length!');
      return false;
    }

    var that = this;
    var container = new LEEWGL.DOM.Element('div', {
      'class': (typeof options['container-class'] !== 'undefined') ? options['container-class'] : ''
    });
    var table = new LEEWGL.DOM.Element('table', {
      'class': (typeof options['table-class'] !== 'undefined') ? options['table-class'] : ''
    });
    var thead = new LEEWGL.DOM.Element('thead');
    var tbody = new LEEWGL.DOM.Element('tbody');
    var tr, td;
    var i = 0;

    var fillTable = function(index, content) {
      var td = new LEEWGL.DOM.Element('td', {
        'num': index,
        'class': (typeof options['content-class'] !== 'undefined') ? options['content-class'] : ''
      });

      var c = content[index];

      if (typeof c === 'number') {
        /// remove trailing zeros
        var n = parseFloat(c.toString());
        var displayPrecision = SETTINGS.get('displayPrecision');
        if (numDigits(n) > displayPrecision)
          n = n.toPrecision(displayPrecision);
        td.set('html', n);
      } else {
        td.set('html', c);
      }

      if (typeof options.id !== 'undefined')
        td.setAttribute('identifier', options.id);

      td.addEvent('keydown', function(event) {
        keydown(event, td, table, content);
      });

      td.addEvent('keyup', function(event) {
        keyup(event, td, table, content);
      });

      return td;
    };

    var headlineContainer = new LEEWGL.DOM.Element('div');
    var h = new LEEWGL.DOM.Element((typeof options['headline-type'] !== 'undefined') ? options['headline-type'] : 'h1', {
      'class': (typeof options['headline-class'] !== 'undefined') ? options['headline-class'] : '',
      'html': headline
    });
    headlineContainer.grab(h);
    container.grab(headlineContainer);

    tr = new LEEWGL.DOM.Element('tr');

    for (i = 0; i < header.length; ++i) {
      td = new LEEWGL.DOM.Element('th', {
        'html': header[i]
      });
      tr.grab(td);
      thead.grab(tr);
    }

    table.grab(thead);

    tr = new LEEWGL.DOM.Element('tr');
    if (typeof content.length === 'undefined') {
      for (var prop in content) {
        var td = fillTable(prop, content);
        tr.grab(td);
        tbody.grab(tr);
      }
    } else {
      for (i = 0; i < content.length; ++i) {
        var td = fillTable(i, content);
        tr.grab(td);
        tbody.grab(tr);
      }
    }

    table.grab(tbody);

    if (typeof options['table-width'] !== 'undefined') {
      if (options['table-width'] === 'fit') {
        options['table-width-padding'] = (typeof options['table-width-padding'] !== 'undefined') ? options['table-width-padding'] : 0;
        var size = table.size(false);
        table.setStyle('width', size.width + options['table-width-padding'] + 'px');
      } else {
        table.setStyle('width', options['table-width']);
      }
    }

    container.grab(table);
    return container;
  };
  /**
   * @param {string} options.id
   * @param {string} options.container-class
   * @param {string} options.headline-class
   * @param {string} options.headline-type
   * @param {string} options.title-class
   * @param {string} options.input-class
   * @param {string} headline
   * @param {string} content
   * @param {function} keydown
   * @param {function} keyup
   * @return {LEEWGL.DOM.Element} container
   */
  this.createContainerDetailInput = function(options, headline, content, keydown, keyup) {
    keydown = (typeof keydown !== 'undefined' && keydown !== null) ? keydown : (function() {});
    keyup = (typeof keyup !== 'undefined') ? keyup : (function() {});

    var container = new LEEWGL.DOM.Element('div', {
      'class': (typeof options['container-class'] !== 'undefined') ? options['container-class'] : ''
    });
    var headlineContainer = new LEEWGL.DOM.Element('div');
    var h = new LEEWGL.DOM.Element((typeof options['headline-type'] !== 'undefined') ? options['headline-type'] : 'h1', {
      'class': (typeof options['headline-class'] !== 'undefined') ? options['headline-class'] : '',
      'html': headline
    });
    headlineContainer.grab(h);
    container.grab(headlineContainer);

    var input = new LEEWGL.DOM.Element('input', {
      'type': 'text',
      'class': (typeof options['input-class'] !== 'undefined') ? options['input-class'] : '',
      'value': content
    });

    if (typeof options.id !== 'undefined')
      input.setAttribute('identifier', options.id);

    input.addEvent('keydown', function(event) {
      keydown(event, input, content);
    });

    input.addEvent('keyup', function(event) {
      keyup(event, input, content);
    });

    container.grab(input);
    return container;
  };
  /**
   * @param {string} options.id
   * @param {string} options.container-class
   * @param {string} options.headline-class
   * @param {string} options.headline-type
   * @param {string} options.title-class
   * @param {string} options.input-class
   * @param {string} headline
   * @param {Array} content
   * @param {function} change
   * @param {string} defaultValue
   * @return {LEEWGL.DOM.Element} container
   */
  this.createDropdown = function(options, headline, content, change, defaultValue) {
    change = (typeof change !== 'undefined' && change !== null) ? change : (function() {});
    defaultValue = (typeof defaultValue !== 'undefined') ? defaultValue : '';

    var container = new LEEWGL.DOM.Element('div', {
      'class': (typeof options['container-class'] !== 'undefined') ? options['container-class'] : ''
    });
    var headlineContainer = new LEEWGL.DOM.Element('div');
    var h = new LEEWGL.DOM.Element((typeof options['headline-type'] !== 'undefined') ? options['headline-type'] : 'h1', {
      'class': (typeof options['headline-class'] !== 'undefined') ? options['headline-class'] : '',
      'html': headline
    });
    headlineContainer.grab(h);
    container.grab(headlineContainer);

    var select = new LEEWGL.DOM.Element('select', {
      'class': (typeof options['input-class'] !== 'undefined') ? options['input-class'] : ''
    });

    if (typeof options.id !== 'undefined')
      select.setAttribute('identifier', options.id);

    select.addEvent('change', function(event) {
      change(event, select, content);
    });

    var option = new LEEWGL.DOM.Element('option', {
      'value': '',
      'text': defaultValue,
      'disabled': true,
      'selected': true
    });

    select.grab(option);

    for (i = 0; i < content.length; ++i) {
      option = new LEEWGL.DOM.Element('option', {
        'value': content[i],
        'text': content[i]
      });
      select.grab(option);
    }

    container.grab(select);
    return container;
  };

  /**
   * @param {string} options.container-class
   * @param {string} options.headline-class
   * @param {string} options.headline-type
   * @param {string} options.title-class
   * @param {string} options.input-class
   * @param {Array | number} id
   * @param {string} headline
   * @param {Array} content
   * @param {function} change
   * @param {bool} checked
   * @return {LEEWGL.DOM.Element} container
   */
  this.createCheckbox = function(options, id, headline, content, change, checked) {
    change = (typeof change !== 'undefined' && change !== null) ? change : (function() {});
    checked = (typeof checked !== 'undefined') ? checked : true;

    var container = new LEEWGL.DOM.Element('div', {
      'class': (typeof options['container-class'] !== 'undefined') ? options['container-class'] : ''
    });
    var headlineContainer = new LEEWGL.DOM.Element('div');
    var h = new LEEWGL.DOM.Element((typeof options['headline-type'] !== 'undefined') ? options['headline-type'] : 'h1', {
      'class': (typeof options['headline-class'] !== 'undefined') ? options['headline-class'] : '',
      'html': headline
    });
    headlineContainer.grab(h);
    container.grab(headlineContainer);

    var checkboxesContainer = new LEEWGL.DOM.Element('div', {
      'class': 'checkbox-container'
    });

    var create = function(i, c, checked) {
      var checkboxContainer = new LEEWGL.DOM.Element('div', {
        'class': (typeof options['input-class'] !== 'undefined') ? options['input-class'] : '',
      });
      var checkbox = new LEEWGL.DOM.Element('input', {
        'type': 'checkbox',
        'value': 'none',
        'checked': checked
      });
      if (i !== null) {
        checkbox.setAttribute('identifier', i);
        checkbox.setAttribute('id', i);
      }

      checkbox.addEvent('change', function(event) {
        change(event, checkbox, c);
      });

      var label = new LEEWGL.DOM.Element('label', {
        'for': checkbox.get('id'),
        'text': c,
      });

      checkboxContainer.grab(checkbox);
      checkboxContainer.grab(label);
      return checkboxContainer;
    };

    var element = null;
    if (typeof content.length !== 'undefined') {
      for (var i = 0; i < content.length; ++i) {
        element = create(id[i], content[i], checked[i]);
        checkboxesContainer.grab(element);
      }
    } else {
      element = create(id, content, checked);
      checkboxesContainer.grab(element);
    }
    container.grab(checkboxesContainer);
    return container;
  };
};

/**
 * window load event to set global
 */
var init = function() {
  var htmlHelper = new LEEWGL.HTMLHelper();
  /** @global */
  window.HTMLHELPER = htmlHelper;
};
addEventToWindow('onload', init);
