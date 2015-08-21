LEEWGL.HTMLHelper = function() {
  /**
   * [createTable description]
   * @param {string} id
   * @param {array} header
   * @param {object} content
   * @param {object} title
   * @param {function} keydown
   * @param {function} keyup
   */
  this.createTable = function(id, header, content, title, keydown, keyup) {
    keydown = (typeof keydown !== 'undefined' && keydown !== null) ? keydown : (function() {});
    keyup = (typeof keyup !== 'undefined' && keyup !== null) ? keyup : (function() {});

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

      var c = content.value[index];

      if (typeof c === 'undefined') {
        var keys = Object.keys(content.value);
        c = content.value[keys[index]];
      }

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

    // / content
    i = 0;
    if (typeof content.value.length === 'undefined') {
      for (var k in content.value) {
        td = fillTable(k, content);

        tr.grab(td);
        tbody.grab(tr);
        ++i;
      }
    } else {
      for (i = 0; i < content.value.length; ++i) {
        td = fillTable(i, content);

        tr.grab(td);
        tbody.grab(tr);
      }
    }

    table.grab(tbody);
    container.grab(table);
    return container;
  };

  /**
   * [createContainerDetailInput description]
   * @param {string} id
   * @param {element} container
   * @param {string} title
   * @param {number / string} content
   * @param {function} keydown
   * @param {function} keyup
   */
  this.createContainerDetailInput = function(id, title, content, keydown, keyup) {
    keydown = (typeof keydown !== 'undefined') ? keydown : (function() {});
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

    input.setAttribute('identifier', id);

    input.addEvent('keydown', function(event) {
      keydown(event, this, content);
    });

    input.addEvent('keyup', function(event) {
      keyup(event, this, content);
    });

    container.grab(name);
    container.grab(input);
    return container;
  };
};
