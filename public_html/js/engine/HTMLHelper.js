/**
 * @constructor
 */
LEEWGL.HTMLHelper = function() {
  /**
   * @param {string} id
   * @param {array} header
   * @param {array} content
   * @param {object} title
   * @param {function} keydown
   * @param {function} keyup
   * @return {LEEWGL.DOM.Element} container
   */
  this.createTable = function(id, header, content, title, keydown, keyup) {
    keydown = (typeof keydown !== 'undefined' && keydown !== null) ? keydown : (function() {});
    keyup = (typeof keyup !== 'undefined') ? keyup : (function() {});

    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-detail-container'
    });
    var table = new LEEWGL.DOM.Element('table', {
      'id': id,
      'class': 'component-table'
    });
    var thead = new LEEWGL.DOM.Element('thead');
    var tbody = new LEEWGL.DOM.Element('tbody');
    var tr;
    var td;
    var i = 0;

    var that = this;

    if (typeof title !== 'undefined') {
      var headlineContainer = new LEEWGL.DOM.Element('div');
      var headline = new LEEWGL.DOM.Element(title.type, {
        'class': title.class,
        'html': title.title
      });
      headlineContainer.grab(headline);
      container.grab(headlineContainer);
    }

    tr = new LEEWGL.DOM.Element('tr');

    // / headers
    for (i = 0; i < header.length; ++i) {
      td = new LEEWGL.DOM.Element('th', {
        'html': header[i]
      });
      tr.grab(td);
      thead.grab(tr);
    }

    table.grab(thead);

    var fillTable = function(index, content) {
      var td = new LEEWGL.DOM.Element('td', {
        'num': index,
        'class': 'editable'
      });

      var c = content[index];

      if (typeof c === 'number')
        td.set('html', c.toPrecision(SETTINGS.get('display-precision')));
      else
        td.set('html', c);

      if (id !== null)
        td.setAttribute('identifier', id);

      td.addEvent('keydown', function(event) {
        keydown(event, td, content);
      });

      td.addEvent('keyup', function(event) {
        keyup(event, td, content);
      });

      return td;
    };

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
    container.grab(table);
    return container;
  };

  /**
   * @param {string} id
   * @param {element} container
   * @param {string} title
   * @param {number|string} content
   * @param {function} keydown
   * @param {function} keyup
   * @return {LEEWGL.DOM.Element} container
   */
  this.createContainerDetailInput = function(id, title, content, keydown, keyup) {
    keydown = (typeof keydown !== 'undefined' && keydown !== null) ? keydown : (function() {});
    keyup = (typeof keyup !== 'undefined') ? keyup : (function() {});

    var container = new LEEWGL.DOM.Element('div', {
      'id': id,
      'class': 'component-detail-container'
    });
    var name = new LEEWGL.DOM.Element('h4', {
      'class': 'component-detail-headline',
      'text': title
    });
    var input = new LEEWGL.DOM.Element('input', {
      'type': 'text',
      'class': 'settings-input',
      'value': content
    });

    if (id !== null)
      input.setAttribute('identifier', id);

    input.addEvent('keydown', function(event) {
      keydown(event, input, content);
    });

    input.addEvent('keyup', function(event) {
      keyup(event, input, content);
    });

    container.grab(name);
    container.grab(input);
    return container;
  };

  /**
   * @param {string} id
   * @param {element} container
   * @param {string} title
   * @param {array} content
   * @param {function} change
   * @param {string} defaultValue
   * @return {LEEWGL.DOM.Element} container
   */
  this.createDropdown = function(id, title, content, change, defaultValue) {
    change = (typeof change !== 'undefined' && change !== null) ? change : (function() {});
    defaultValue = (typeof defaultValue !== 'undefined') ? defaultValue : '';

    var container = new LEEWGL.DOM.Element('div', {
      'id': id,
      'class': 'component-detail-container'
    });
    var name = new LEEWGL.DOM.Element('h4', {
      'class': 'component-detail-headline',
      'text': title
    });

    var select = new LEEWGL.DOM.Element('select', {
      'class': 'settings-dropdown'
    });

    if (id !== null)
      select.setAttribute('identifier', id);

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

    container.grab(name);
    container.grab(select);
    return container;
  };

  /**
   * @param {string} id
   * @param {element} container
   * @param {string} title
   * @param {array} content
   * @param {function} change
   * @param {bool | Array} checked
   * @return {LEEWGL.DOM.Element} container
   */
  this.createCheckbox = function(id, title, content, change, checked) {
    change = (typeof change !== 'undefined' && change !== null) ? change : (function() {});
    checked = (typeof checked !== 'undefined') ? checked : true;

    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-detail-container'
    });
    var name = new LEEWGL.DOM.Element('h4', {
      'class': 'component-detail-headline',
      'text': title
    });

    var checkboxesContainer = new LEEWGL.DOM.Element('div', {
      'class': 'checkbox-container'
    });

    var create = function(i, c, checked) {
      var checkboxContainer = new LEEWGL.DOM.Element('div', {
        'class': 'settings-checkbox fleft'
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

    container.grab(name);

    var element = null;
    if (content instanceof Array) {
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
window.addEventListener('load', function() {
  var htmlHelper = new LEEWGL.HTMLHelper();
  /** @global */
  window.HTMLHELPER = htmlHelper;
});
