/**
 * [UI description]
 * @param {object} options
 */
LEEWGL.UI = function(options) {
  this.inspector = undefined;
  this.statusBar = undefined;

  this.outline = {};

  this.updateOutline = false;

  this.activeElement = null;
  this.storage = new LEEWGL.LocalStorage();
  this.playing = undefined;

  this.gl = undefined;
  this.scene = undefined;

  this.activeIndex = undefined;
  this.settingsDisplayed = false;

  this.importedScripts = 0;

  this.drag = new LEEWGL.DragDrop();
  this.popup = new LEEWGL.UI.Popup({});
  this.popup.create();

  this.contextMenu = new LEEWGL.UI.Popup({
    'movable': false,
    'close-icon-enabled': false,
    'wrapper-width': 200,
    'title-enabled': false
  });
  this.contextMenu.create();

  this.updatePopup = new LEEWGL.UI.Popup({
    'movable': false,
    'close-icon-enabled': true,
    'close-button-enabled': false,
    'wrapper-width': 250,
    'title-enabled': true
  });
  this.updatePopup.create();
  this.updatePopup.addTitleText('Update values');
  this.updatePopup.addButton('Update', (function() {
    if (this.settingsDisplayed === true) {

    } else {
      var trans = this.activeElement.transform.transVec;
      var rot = this.activeElement.transform.rotVec;
      var scale = this.activeElement.transform.scaleVec;

      this.activeElement.transform.dispatchEvent({
        'type': 'update-all',
        'data': {
          'translation': trans,
          'rotation': rot,
          'scale': scale
        }
      });

      this.setInspectorContent(this.activeIndex);
    }
  }.bind(this)));

  this.importedScripts = [];
  this.objectScripts = [];

  this.clipBoard = null;

  this.saved = {};

  this.importer = new LEEWGL.Importer();

  this.body = new LEEWGL.DOM.Element(document.body);

  this.setGL = function(gl) {
    this.gl = gl;
  };

  this.setScene = function(scene) {
    this.scene = scene;
  };

  this.setInspector = function(container) {
    this.inspector = (typeof container === 'string') ? document.querySelector(container) : container;
    this.inspector = new LEEWGL.DOM.Element(this.inspector);
  };

  this.setStatusBar = function(container) {
    this.statusBar = (typeof container === 'string') ? document.querySelector(container) : container;
    this.statusBar = new LEEWGL.DOM.Element(this.statusBar);
  };

  this.setEditable = function(index) {
    for (var i in this.outline) {
      this.outline[i].editable = false;
    }

    if (index !== -1)
      this.outline[index].editable = true;
  };

  this.setActive = function(index) {
    for (var i in this.outline) {
      this.outline[i].active = false;
    }

    if (index !== -1)
      this.outline[index].active = true;
  };

  this.addObjToOutline = function(obj) {
    var add = (function(obj) {
      this.outline[obj.id] = {};
      this.outline[obj.id].obj = obj;
      this.outline[obj.id].active = false;
      this.outline[obj.id].editable = false;
    }.bind(this));

    if (obj.length) {
      for (var i = 0; i < obj.length; ++i) {
        add(obj[i]);
      }
    } else {
      add(obj);
    }

    this.updateOutline = true;
  };

  this.removeObjFromOutline = function(index) {
    delete this.outline[index];
    this.updateOutline = true;
  };

  this.getRelativeMouseCoordinates = function(event, start) {
    var x, y, top = 0,
      left = 0,
      obj = start;

    while (obj && obj.tagName !== 'BODY') {
      top += obj.offsetTop;
      left += obj.offsetLeft;
      obj = obj.offsetParent;
    }

    left += window.pageXOffset;
    top -= window.pageYOffset;

    x = event.clientX - left;
    y = event.clientY - top;

    return {
      'x': x,
      'y': y
    };
  };

  this.editable = function(obj, index, dom) {
    dom = (typeof dom !== 'undefined') ? dom : false;
    var that = this;
    var dblclickFunction, keydownFunction, clickFunction;

    if (dom === false) {
      dblclickFunction = function() {
        if (that.outline[index].editable === false) {
          that.setEditable(index);
          that.updateOutline = true;
        }
      };


      keydownFunction = function(event, element) {
        if (event.keyCode === LEEWGL.KEYS.ENTER) {
          that.activeElement.name = element.get('text');
          that.setEditable(-1);
          that.updateOutline = true;
          that.setInspectorContent(index);

          event.preventDefault();
          event.stopPropagation();
        }
      };

      clickFunction = function() {
        var activeOutline = that.outline[index];
        if (activeOutline.active === false && activeOutline.editable === false) {
          that.setActive(index);
          that.setEditable(-1);
          that.updateOutline = true;
          that.setInspectorContent(index);
        }
      };
    } else {
      dblclickFunction = function(element) {
        if (element.get('contenteditable') === null) {
          element.set('contenteditable', true);
          element.set('class', 'editable');
        }

        that.displayUpdatePopup();
      };

      keydownFunction = function(event, element) {
        if (event.keyCode === LEEWGL.KEYS.ENTER) {
          if (element.get('contenteditable') !== null)
            element.removeAttributes(['contenteditable', 'class']);
        }
      };

      clickFunction = function() {};
    }

    obj.addEvent('dblclick', function(event) {
      dblclickFunction(new LEEWGL.DOM.Element(this));
    });

    obj.addEvent('keydown', function(event) {
      keydownFunction(event, new LEEWGL.DOM.Element(this));
    });

    obj.addEvent('click', function(event) {
      clickFunction();
    });
  };

  this.outlineToHTML = function(container) {
    if (this.updateOutline === false)
      return;

    container = (typeof container === 'string') ? document.querySelector(container) : container;
    container = new LEEWGL.DOM.Element(container, {
      'html': ''
    });
    var that = this;

    var list = new LEEWGL.DOM.Element('ul');

    for (var i in this.outline) {
      var outline = this.outline[i];

      var obj = outline.obj;
      var item = new LEEWGL.DOM.Element('li');
      var element = new LEEWGL.DOM.Element('a', {
        'href': '#',
        'html': obj.name
      });

      item.grab(element);
      list.grab(item);

      if (outline.active === true)
        item.set('class', 'active');

      if (outline.editable === true) {
        item.set('class', 'editable');
        element.set('contenteditable', true);
      }

      /// events
      this.editable(element, i);

      (function(index) {
        element.addEvent('contextmenu', function(event) {
          var activeOutline = that.outline[index];

          if (activeOutline.active === false && activeOutline.editable === false) {
            that.setActive(index);
            that.setEditable(-1);
            that.updateOutline = true;
            that.setInspectorContent(index);
          }

          that.displayOutlineContextMenu(index, event);
        });
      })(i);
    }

    container.grab(list);
    this.updateOutline = false;
  };

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
    keydown = (typeof keydown !== 'undefined') ? keydown : (function() {});
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
        'num': index
      });

      var c = content.value[index];

      that.editable(td, index, true);

      if (typeof c === 'undefined') {
        var keys = Object.keys(content.value);
        c = content.value[keys[index]];
      }

      if (typeof c === 'number')
        td.set('html', c.toPrecision(LEEWGL.Settings.DisplayPrecision));
      else
        td.set('html', c);

      td.addEvent('keydown', function(event) {
        keydown(event, this, content);
      });

      td.addEvent('keyup', function(event) {
        keyup(event, this, content);
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
  this.createContainerDetailInput = function(id, container, title, content, keydown, keyup) {
    keydown = (typeof keydown !== 'undefined') ? keydown : (function() {});
    keyup = (typeof keyup !== 'undefined') ? keyup : (function() {});

    var containerDetail = new LEEWGL.DOM.Element('div', {
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

    input.addEvent('keydown', function(event) {
      keydown(event, this, content);
    });

    input.addEvent('keyup', function(event) {
      keyup(event, this, content);
    });

    containerDetail.grab(name);
    containerDetail.grab(input);
    container.grab(containerDetail);
  };

  this.dispatchTypes = function(value, type, num) {
    if (type === 'position') {
      this.activeElement.transform.position[num] = value;
    } else if (type === 'translation') {
      this.activeElement.transform.transVec[num] = value;
    } else if (type === 'rotation') {
      this.activeElement.transform.rotVec[num] = value;
    } else if (type === 'scale') {
      this.activeElement.transform.scaleVec[num] = value;
    }
  };

  this.transformToHTML = function(element) {
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container'
    });
    var title = new LEEWGL.DOM.Element('h3', {
      'class': 'component-headline',
      'html': 'Transform'
    });
    container.grab(title);

    var transform = element.components['Transform'];
    var that = this;

    var keydown = (function(event, td, vector) {
      var el = new LEEWGL.DOM.Element(td);
      var num = el.get('num');
      var value = parseFloat(el.get('text'));
      vector = vector.value;

      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        if (typeof vector[num] === 'undefined') {
          var keys = Object.keys(vector);
          vector[keys[index]] = value;
        } else {
          vector[num] = value;
        }

        var trans = element.transform.transVec;
        var rot = element.transform.rotVec;
        var scale = element.transform.scaleVec;

        element.transform.dispatchEvent({
          'type': 'update-all',
          'data': {
            'translation': trans,
            'rotation': rot,
            'scale': scale
          }
        });

        that.setInspectorContent(element.id);

        event.preventDefault();
        event.stopPropagation();
      }
    });

    var keyup = (function(event, td, vector) {
      var el = new LEEWGL.DOM.Element(td);
      var num = el.get('num');
      var value = parseFloat(el.get('text'));
      that.dispatchTypes(value, vector.type, num);
    });

    // / position
    container.grab(this.createTable(null, ['x', 'y', 'z'], {
      'value': transform.position,
      'type': 'position'
    }, {
      'title': 'Position',
      'type': 'h4',
      'class': 'component-detail-headline'
    }, keydown, keyup));
    // / translation
    container.grab(this.createTable(null, ['x', 'y', 'z'], {
      'value': transform.transVec,
      'type': 'translation'
    }, {
      'title': 'Translation',
      'type': 'h4',
      'class': 'component-detail-headline'
    }, keydown, keyup));

    // / rotation
    container.grab(this.createTable(null, ['x', 'y', 'z'], {
      'value': transform.rotVec,
      'type': 'rotation'
    }, {
      'title': 'Rotation',
      'type': 'h4',
      'class': 'component-detail-headline'
    }, keydown, keyup));
    // / scale
    container.grab(this.createTable(null, ['x', 'y', 'z'], {
      'value': transform.scaleVec,
      'type': 'scale'
    }, {
      'title': 'Scale',
      'type': 'h4',
      'class': 'component-detail-headline'
    }, keydown, keyup));

    return container;
  };

  this.customScriptToHTML = function(element) {
    var script = element.components['CustomScript'];
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container',
      'id': 'custom-script-component-container'
    });
    var title = new LEEWGL.DOM.Element('h3', {
      'class': 'component-headline',
      'html': 'Custom Script'
    });
    container.grab(title);

    var textfield = new LEEWGL.DOM.Element('textarea', {
      'rows': 5,
      'cols': 30,
      'placeholder': script.code
    });

    var position = container.position(false);

    var appliedScriptsContainer = new LEEWGL.DOM.Element('div', {
      'class': 'component-detail-container'
    });
    var appliedScriptsHeadline = new LEEWGL.DOM.Element('h4', {
      'class': 'component-detail-headline',
      'text': 'Applied Scripts'
    });

    appliedScriptsContainer.grab(appliedScriptsHeadline);

    var customScriptContainer = new LEEWGL.DOM.Element('div', {
      'class': 'component-detail-container'
    });
    var customScriptHeadline = new LEEWGL.DOM.Element('h4', {
      'class': 'component-detail-headline',
      'text': 'Custom Script'
    });

    customScriptContainer.grab(customScriptHeadline);
    customScriptContainer.grab(textfield);

    var that = this;

    /**
     * Applied Scripts
     */
    if (typeof this.saved['custom-object-script-' + element.id] !== 'undefined') {
      textfield.set('value', this.saved['custom-object-script-' + element.id]);

      if (typeof this.saved['applied-scripts-data-toggled-' + element.id] === 'undefined')
        this.saved['applied-scripts-data-toggled-' + element.id] = 'false';

      var height = '0px';
      var opacity = 0;
      var icon = LEEWGL.ROOT + 'img/icons/plus_half_white.png';
      if (this.saved['applied-scripts-data-toggled-' + element.id] === 'true') {
        height = '150px';
        opacity = 1;
        icon = LEEWGL.ROOT + 'img/icons/minus_half_white.png';
      }

      var iconContainer = new LEEWGL.DOM.Element('div', {
        'class': 'icon-container-small fright',
        'data-toggled': this.saved['applied-scripts-data-toggled-' + element.id]
      });

      var toggleAppliedScript = new LEEWGL.DOM.Element('img', {
        'src': icon,
        'alt': 'Toggle Applied Scripts',
        'title': 'Toggle Applied Scripts'
      });

      var clearer = new LEEWGL.DOM.Element('div', {
        'class': 'clearer'
      });

      var appliedScriptsInnerContainer = new LEEWGL.DOM.Element('div', {
        'styles': {
          'height': height
        }
      });

      var appliedScriptsTextArea = new LEEWGL.DOM.Element('textarea', {
        'rows': 5,
        'cols': 30,
        'text': this.saved['custom-object-script-' + element.id],
        'styles': {
          'opacity': opacity
        }
      });

      iconContainer.grab(toggleAppliedScript);
      appliedScriptsContainer.grab(iconContainer, 'top');
      appliedScriptsContainer.grab(clearer);
      appliedScriptsInnerContainer.grab(appliedScriptsTextArea);
      appliedScriptsContainer.grab(appliedScriptsInnerContainer);
      v
      var animation = new LEEWGL.DOM.Animator();

      iconContainer.addEvent('click', function(event) {
        if (iconContainer.get('data-toggled') === 'false') {
          animation.animate(appliedScriptsInnerContainer, {
            'height': '150px'
          }, 0.5, function() {
            animation.fade('toggle', appliedScriptsTextArea, 0.5);
            toggleAppliedScript.set('src', LEEWGL.ROOT + 'img/icons/minus_half_white.png');
          });
          iconContainer.set('data-toggled', 'true');
          that.saved['applied-scripts-data-toggled-' + element.id] = 'true';
        } else {
          animation.fade('out', appliedScriptsTextArea, 0.5, function() {
            animation.animate(appliedScriptsInnerContainer, {
              'height': '0px'
            }, 0.5);
            toggleAppliedScript.set('src', LEEWGL.ROOT + 'img/icons/plus_half_white.png');
          });
          iconContainer.set('data-toggled', 'false');
          that.saved['applied-scripts-data-toggled-' + element.id] = 'false';
        }
      });
    }

    textfield.addEvent('keyup', function(event) {
      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        that.addScriptToObject(element.id, this.value);
        event.stopPropagation();
      }
    });

    container.grab(appliedScriptsContainer);
    container.grab(customScriptContainer);

    return container;
  };

  this.textureToHTML = function(element) {
    var texture = element.components['Texture'];
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container',
      'id': 'texture-component-container'
    });
    var title = new LEEWGL.DOM.Element('h3', {
      'class': 'component-headline',
      'html': 'Texture'
    });
    container.grab(title);

    var fileName = new LEEWGL.DOM.Element('h4', {
      'class': 'component-sub-headline'
    });
    var fileInput = new LEEWGL.DOM.Element('input', {
      'type': 'file'
    });
    var imageContainer = new LEEWGL.DOM.Element('div', {
      'id': 'texture-preview-container'
    });
    var image = new LEEWGL.DOM.Element('img', {
      'class': 'lightbox'
    });
    imageContainer.grab(image);

    if (typeof this.saved['object-' + element.id + '-texture-path'] !== 'undefined') {
      image.set('src', this.saved['object-' + element.id + '-texture-path']);
      fileInput.set('value', this.saved['object-' + element.id + '-texture-path']);
      fileName.set('text', this.saved['object-' + element.id + '-texture-path']);
    } else {
      fileName.set('text', 'No Texture');
    }

    var that = this;

    fileInput.addEvent('change', function(event) {
      var name = this.value.substr(this.value.lastIndexOf('\\') + 1, this.value.length);
      var path = LEEWGL.ROOT + 'texture/';
      texture.init(that.gl, path + name);
      element.setTexture(texture);

      that.saved['object-' + element.id + '-texture-path'] = path + name;
      fileName.set('text', path + name);

      image.set('src', path + name);
    });

    container.grab(fileName);
    container.grab(fileInput);
    container.grab(imageContainer);

    return container;
  };

  this.componentsToHTML = function(element) {
    var container;
    var title;

    var that = this;

    for (var name in element.components) {
      if (!element.components.hasOwnProperty(name))
        continue;

      var component = element.components[name];

      if (component instanceof LEEWGL.Component.Transform)
        container = this.transformToHTML(element);
      else if (component instanceof LEEWGL.Component.CustomScript)
        container = this.customScriptToHTML(element);
      else if (component instanceof LEEWGL.Component.Texture)
        container = this.textureToHTML(element);

      this.inspector.grab(container);
    }
  };

  this.valuesToHTML = function(activeElement) {
    var container;
    var title;

    var that = this;

    if (typeof activeElement.editables !== 'undefined') {
      container = new LEEWGL.DOM.Element('div', {
        'class': 'component-container'
      });
      title = new LEEWGL.DOM.Element('h3', {
        'class': 'component-headline',
        'html': 'Values'
      });
      container.grab(title);

      for (var e in activeElement.editables) {
        var editable = activeElement.editables[e];
        if (editable.value instanceof Array) {
          console.log(editable);
          container.grab(this.createTable(null, editable['table-titles'], editable, {
            'title': editable.name,
            'type': 'h4',
            'class': 'component-detail-headline'
          }));
        } else {
          this.createContainerDetailInput(null, container, editable.name, editable.value);
        }
      }
      this.inspector.grab(container);
    }
  };

  this.setInspectorContent = function(index) {
    if (typeof this.inspector === 'undefined') {
      console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
      return;
    }

    // if (this.activeElement !== null) {
    //     if (index === this.activeIndex)
    //         return;
    // }

    this.settingsDisplayed = false;

    this.inspector.set('html', '');

    this.activeIndex = index;
    this.setActive(index);

    if (index === -1) {
      this.activeElement = null;
      window.activeElement = this.activeElement;
      this.updateOutline = true;
      return;
    }

    this.activeElement = this.outline[index].obj;
    window.activeElement = this.activeElement;

    var name = new LEEWGL.DOM.Element('h3', {
      'class': 'component-detail-headline',
      'text': 'Name - ' + activeElement.name
    });

    this.inspector.grab(name);
    this.valuesToHTML(activeElement);
    this.componentsToHTML(activeElement);
    this.componentsButton(index);

    this.updateOutline = true;
  };

  this.componentsButton = function(index) {
    var that = this;
    var componentsControlContainer = new LEEWGL.DOM.Element('div', {
      'class': 'controls-container'
    });

    var addComponentControl = new LEEWGL.DOM.Element('input', {
      'class': 'submit',
      'type': 'submit',
      'value': 'Add Component'
    });
    componentsControlContainer.grab(addComponentControl);

    addComponentControl.addEvent('click', function(event) {
      that.displayComponentMenu(index, event);
    });

    this.inspector.grab(componentsControlContainer);
  };

  this.dynamicContainers = function(classname_toggle, classname_container, movable_container) {
    var that = this;
    var toggles = document.querySelectorAll(classname_toggle);
    var containers = document.querySelectorAll(classname_container);

    for (var i = 0; i < toggles.length; ++i) {
      (function(index) {
        var toggle = new LEEWGL.DOM.Element(toggles[index]);
        var container = new LEEWGL.DOM.Element(containers[index]);
        toggle.addEvent('mousedown', function(event) {
          if (event.which === 1 || event.button === LEEWGL.MOUSE.LEFT) {
            container.set('class', 'movable');
            container.addEvent('click', that.drag.drag(container, event));
            // container.dispatchEvent({'type' : 'click'});
          }
        });
        toggle.addEvent('dblclick', function(event) {
          container.removeClass('movable');
          that.drag.restore(container, event);
        });
      })(i);
    }
  };

  this.addScriptToObject = function(id, src) {
    var script;
    if ((script = document.querySelector('#custom-object-script-' + id)) !== null) {
      document.body.removeChild(script);
    }

    this.saved['custom-object-script-' + id] = src;

    var newScript = new LEEWGL.DOM.Element('script', {
      'type': 'text/javascript',
      'id': 'custom-object-script-' + id
    });
    var code = 'UI.outline[' + id + '].obj.addEventListener("custom", function() { if(UI.playing === true) {' + src + '}});';

    newScript.grab(document.createTextNode(code));
    this.body.grab(newScript);
  };

  this.addScriptToDOM = function(id, src) {
    var script;
    if ((script = document.querySelector('#custom-dom-script-' + id)) !== null) {
      document.body.removeChild(script);
    }

    this.saved['custom-dom-script-' + id] = src;

    var newScript = new LEEWGL.DOM.Element('script', {
      'type': 'text/javascript',
      'id': 'custom-dom-script-' + id
    });
    var container = new LEEWGL.DOM.Element(document.body);
    var code = 'Window.prototype.addEventListener("custom", function() { if(UI.playing === true) {' + src + '}}.bind(this));';

    newScript.grab(document.createTextNode(code));
    this.body.grab(newScript);
  };

  this.displayOutlineContextMenu = function(index, event) {
    var that = this;

    this.contextMenu.empty();
    this.contextMenu.setPosition({
      'x': event.clientX,
      'y': event.clientY
    });

    var listItems = ['Duplicate', 'Copy', 'Cut', 'Paste', 'Delete'];

    this.contextMenu.addList(listItems, function(item) {
      if (item.toLowerCase() === 'duplicate')
        that.duplicateObject();
      if (item.toLowerCase() === 'copy')
        that.copyObject();
      else if (item.toLowerCase() === 'cut')
        that.cutObject();
      else if (item.toLowerCase() === 'paste')
        that.pasteObject();
      else if (item.toLowerCase() === 'delete')
        that.deleteObject();

      that.contextMenu.hide();
    });

    this.contextMenu.show();

    var documentClickHandler = (function(evt) {
      that.contextMenu.hide();
      document.removeEventListener('click', documentClickHandler);
      evt.preventDefault();
    });

    document.addEventListener('click', documentClickHandler);
    event.preventDefault();
  };

  this.displayComponentMenu = function(index, event) {
    // / get all not already added components
    var availableComponents = this.getAvailableComponents(this.outline[index].obj);

    this.popup.empty();
    this.popup.addTitleText('Add Component');

    var that = this;

    this.popup.addList(availableComponents, function(item) {
      var className = that.stringToFunction('LEEWGL.Component.' + item);
      that.activeElement.addComponent(new className());
      that.setInspectorContent(that.activeElement.id);
      that.popup.hide();
    });

    this.popup.setPosition({
      'x': event.clientX,
      'y': event.clientY
    });
    this.popup.show();
  };

  this.getAvailableComponents = function(activeElement) {
    var activeComponents = Object.keys(activeElement.components);

    var subArray = function(a, b) {
      var visited = [];
      var arr = [];

      for (var i = 0; i < b.length; ++i) {
        visited[b[i]] = true;
      }
      for (i = 0; i < a.length; ++i) {
        if (!visited[a[i]])
          arr.push(a[i]);
      }
      return arr;
    };

    var availableComponents = subArray(LEEWGL.Component.Components, activeComponents);
    return availableComponents;
  };

  this.displayUpdatePopup = function() {
    var pos = this.inspector.position();
    var size = this.updatePopup.getSize();

    this.updatePopup.setPosition({
      'x': (pos.x + size.width) + 75,
      'y': pos.y
    });
    this.updatePopup.show();
  };

  this.play = function(element) {
    this.playing = true;

    if (element instanceof LEEWGL.DOM.Element === false)
      element = new LEEWGL.DOM.Element(element);

    if (element.get('id') === 'play-control') {
      element.set('id', 'pause-control');
    } else {
      element.set('id', 'play-control');
      return;
    }

    var indices = Object.keys(this.outline);
    for (var i = 0; i < indices.length; ++i) {
      this.outline[indices[i]].obj.dispatchEvent({
        'type': 'custom'
      });
    }

    Window.prototype.dispatchEvent({
      'type': 'custom'
    });
  };

  this.pause = function(element) {
    if (this.playing === true) {
      this.paused = true;
    }
  };

  this.stop = function() {
    var playIcon;
    if ((playIcon = new LEEWGL.DOM.Element(document.getElementById('pause-control'))) !== null)
      playIcon.set('id', 'play-control');

    this.playing = false;
  };

  this.displaySettings = function() {
    this.settingsDisplayed = true;

    this.inspector.set('html', '');
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container'
    });

    var keydownTable = (function(event, td, vector) {
      var el = new LEEWGL.DOM.Element(td);
      var num = el.get('num');
      var value = parseFloat(el.get('text'));
      vector = vector.value;

      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        vector[num] = value;
        event.stopPropagation();
        event.preventDefault();
      }
    });

    var keydownInput = (function(event, input, content) {
      var el = new LEEWGL.DOM.Element(input);
      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        content = el.e.value;
        el.set('value', el.e.value);
        event.stopPropagation();
        event.preventDefault();
      }
    });

    for (var k in LEEWGL.Settings) {
      if (typeof LEEWGL.Settings[k] === 'object') {
        container.grab(this.createTable(k + 'Setting', Object.keys(LEEWGL.Settings[k]), {
          'value': LEEWGL.Settings[k],
          'type': k
        }, {
          'title': k,
          'type': 'h4',
          'class': 'component-detail-headline'
        }, keydownTable));
      } else {
        this.createContainerDetailInput(k + 'Setting', container, k, LEEWGL.Settings[k], keydownInput);
      }
    }

    var submit = new LEEWGL.DOM.Element('input', {
      'type': 'submit',
      'class': 'submit',
      'value': 'Update'
    });

    submit.addEvent('click', function(event) {
      this.updateSettings();
      event.preventDefault();
    }.bind(this));

    container.grab(submit);
    this.inspector.grab(container);
  };

  this.updateSettings = function() {
    console.log(LEEWGL.Settings);
  };

  /**
   * Object methods
   *
   */

  this.duplicateObject = function() {
    if (this.activeElement === null) {
      console.warn('LEEWGL.UI: No active element selected!');
      return;
    }

    var copy = this.activeElement.clone();
    this.scene.add(copy);
    this.addObjToOutline(copy);
  };

  this.deleteObject = function() {
    if (this.activeElement === null) {
      console.warn('LEEWGL.UI: No active element selected!');
      return;
    }
    this.scene.remove(this.activeElement);
    this.removeObjFromOutline(this.activeIndex);
    this.activeElement = null;
  };

  this.copyObject = function() {
    if (this.activeElement === null) {
      console.warn('LEEWGL.UI: No active element selected!');
      return;
    }

    this.clipBoard = this.activeElement.clone();
    this.statusBarToHTML();
  };

  this.cutObject = function() {
    if (this.activeElement === null) {
      console.warn('LEEWGL.UI: No active element selected!');
      return;
    }

    this.clipBoard = this.activeElement.clone();
    this.scene.remove(this.activeElement);
    this.removeObjFromOutline(this.activeIndex);
    this.activeElement = null;

    this.statusBarToHTML();
  };

  this.pasteObject = function() {
    if (this.clipBoard === null) {
      console.warn('LEEWGL.UI: No element in clipboard!');
      return;
    }

    this.scene.add(this.clipBoard);
    this.addObjToOutline(this.clipBoard);

    this.clipBoard = null;
    this.statusBarToHTML();
  };

  this.addCustomScriptComponent = function() {
    this.activeElement.addComponent(new LEEWGL.Component.CustomScript());
    this.setInspectorContent(this.activeIndex);
  };

  /**
   * Insert Objects
   */

  this.insertTriangle = function() {
    var triangle = new LEEWGL.Geometry.Triangle();
    triangle.setBuffer(this.gl);
    triangle.addColor(this.gl);
    this.addObjToOutline(triangle);
    this.scene.add(triangle);
  };

  this.insertCube = function() {
    var cube = new LEEWGL.Geometry.Cube();
    cube.setBuffer(this.gl);
    cube.addColor(this.gl);
    this.addObjToOutline(cube);
    this.scene.add(cube);
  };

  this.insertSphere = function() {
    var sphere = new LEEWGL.Geometry.Sphere();
    sphere.setBuffer(this.gl);
    sphere.addColor(this.gl);
    this.addObjToOutline(sphere);
    this.scene.add(sphere);
  };

  this.insertLight = function(options) {
    if (typeof options === 'undefined') {
      console.error('LEEWGL.UI.insertLight: No options param given!');
      return false;
    }
    var light = null;
    if (options.type === 'Directional')
      light = new LEEWGL.Light.DirectionalLight();
    else if (options.type === 'Point')
      light = new LEEWGL.Light.PointLight();
    else if (options.type === 'Spot')
      light = new LEEWGL.Light.SpotLight();

    this.addObjToOutline(light);
    this.scene.add(light);
  };

  this.insertCamera = function(options) {
    if (typeof options === 'undefined') {
      console.error('LEEWGL.UI.insertCamera: No options param given!');
      return false;
    }
    var camera = null;
    if (options.type === 'Perspective')
      camera = new LEEWGL.Camera.PerspectiveCamera();
  };

  /**
   * UI exposed methods
   */

  this.displayImportScript = function() {
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': 500,
      'wrapper-height': 'auto',
      'center': true
    });

    this.popup.addTitleText('Import Script');
    this.popup.addHTMLFile('html/import_script.html');
    this.popup.setDimensions();

    this.popup.show();
  };

  this.importScriptFromSource = function(textarea) {
    this.addScriptToDOM(this.importedScripts, textarea.value);
    this.importedScripts++;
  };

  this.displayImportModel = function() {
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': 500,
      'wrapper-height': 'auto',
      'center': true
    });

    this.popup.addTitleText('Import Model');
    this.popup.addHTMLFile('html/import_model.html');
    this.popup.setDimensions();

    this.popup.show();
  };

  this.importModel = function(input) {
    var prefix = 'C:\\fakepath\\';
    var filename = input.value.substring(prefix.length, input.value.length);
    var path = LEEWGL.ROOT + 'models/' + filename;

    var object = this.importer.import(path, this.gl);

    this.scene.add(object);
    this.addObjToOutline(object);
  };

  this.displayAbout = function() {
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': '500px'
    });

    this.popup.addTitleText('About LEEWGL');
    this.popup.addHTMLFile('html/about.html');
    this.popup.center();
    this.popup.show();
  };

  this.save = function() {
    for (var name in this.saved) {
      this.storage.setValue(name, this.saved[name]);
    }
  };

  this.load = function() {
    for (var name in this.storage.all()) {
      this.saved[name] = this.storage.getValue(name);

      var id = '';

      if (name.indexOf('custom-object-script-') !== -1) {
        id = name.substr(name.lastIndexOf('-') + 1, name.length);
        this.addScriptToObject(id, this.saved[name]);
      } else if (name.indexOf('custom-dom-script-') !== -1) {
        id = name.substr(name.lastIndexOf('-') + 1, name.length);
        this.addScriptToDOM(id, this.saved[name]);
      }
    }

    this.setInspectorContent(this.activeIndex);
  };

  this.displayExport = function() {
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': '500px'
    });
    this.popup.setDimensions();

    this.popup.addTitleText('Export');
    this.popup.addHTMLFile('html/export.html');
    this.popup.center();
    this.popup.show();

    this.export();
  };

  this.export = function() {
    var vertex_shaders = document.getElementsByClassName('vertex-shaders');
    var fragment_shaders = document.getElementsByClassName('fragment-shaders');

    var textarea_vertex_shaders = new LEEWGL.DOM.Element(document.getElementById('export-vertex-shaders'));
    var textarea_fragment_shaders = new LEEWGL.DOM.Element(document.getElementById('export-fragment-shaders'));
    textarea_vertex_shaders.set('html', vertex_shaders[0].innerHTML);
    textarea_fragment_shaders.set('html', fragment_shaders[0].innerHTML);

    var textarea_export = new LEEWGL.DOM.Element(document.getElementById('export'));

    var code_export_init = " \
    var body = new LEEWGL.DOM.Element(document.body); \n \
    var canvas = new LEEWGL.DOM.Element('canvas', { \n \
        'styles' : { \n \
          'width' : '512px', \n \
          'height' : '512px' \n \
        } \n \
    }); \n \
    body.grab(canvas); \n \
    var core = new window.LEEWGL.Core({ \n \
      'editorCanvas': canvas.e \n \
    }); \n \
    var testapp = new window.LEEWGL.TestApp({ \n \
      'core': core \n \
    }); \n \
    core.attachApp(testapp); \n \
    core.init(); \n \
    window.requestAnimationFrame(core.run.bind(LEEWGL)); \n \
    var gl = core.getContext(); \n \
    ".trim();

    /// shaders
    var code_export_shader = " \
    var vertex_shader0 = new LEEWGL.Shader(); \n \
    vertex_shader0.createShaderFromCode(gl, LEEWGL.Shader.VERTEX, ) \n \
    ".trim();

    textarea_export.set('html', code_export_init + '\n\n' + code_export_shader);
  };

  this.preventRefresh = function() {
    window.onkeydown = function(event) {
      if ((event.keyCode || event.which) === LEEWGL.KEYS.F5) {
        event.preventDefault();
      }
    };
  };

  this.stringToFunction = function(str) {
    var arr = str.split(".");
    var fn = window;
    for (var i = 0; i < arr.length; ++i) {
      fn = fn[arr[i]];
    }

    return fn;
  };

  this.statusBarToHTML = function() {
    if (this.statusBar !== null) {
      if (this.clipBoard !== null)
        this.statusBar.set('html', '1 Element selected');
      else
        this.statusBar.set('html', 'Nothing selected');
    }
  };
};

/**
 * [Popup description]
 * @param {object} options
 */
LEEWGL.UI.Popup = function(options) {
  /**
   * Variables
   */
  this.options = {
    'overlay-enabled': false,
    'wrapper-class': 'popup',
    'title-class': 'popup-title',
    'content-class': 'popup-content',
    'overlay-class': 'popup-overlay',
    'list-item-class': 'popup-list',
    'close-icon-enabled': true,
    'close-button-enabled': false,
    'wrapper-width': 350,
    'wrapper-height': 'auto',
    'center': true,
    'hidden': true,
    'movable': true,
    'title-enabled': true
  };

  this.pos = {
    'x': 0,
    'y': 0
  };

  this.parent = new LEEWGL.DOM.Element(document.body);

  this.wrapper = undefined;
  this.title = undefined;
  this.content = undefined;
  this.overlay = undefined;

  this.listItems = [];

  this.initialized = false;
  this.isDisplayed = false;

  this.drag = new LEEWGL.DragDrop();
  this.ajax = new LEEWGL.AsynchRequest();

  var extend = new LEEWGL.Class();
  extend.extend(LEEWGL.UI.Popup.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  /**
   * [setDimensions description]
   */
  this.setDimensions = function() {
    this.wrapper.setStyle('width', (typeof this.options['wrapper-width'] === 'number') ? this.options['wrapper-width'] + 'px' : this.options['wrapper-width']);
    this.wrapper.setStyle('height', (typeof this.options['wrapper-height'] === 'number') ? this.options['wrapper-height'] + 'px' : this.options['wrapper-height']);
    this.position();
  };

  /**
   * [setPosition description]
   */
  this.setPosition = function() {
    if (arguments.length === 1) {
      this.pos = arguments[0];
    } else {
      this.pos.x = arguments[0];
      this.pos.y = arguments[1];
    }

    this.options['center'] = false;
    this.position();
  };

  /**
   * [create description]
   */
  this.create = function() {
    if (typeof this.wrapper !== 'undefined')
      return;

    this.wrapper = new LEEWGL.DOM.Element('div', {
      'class': this.options['wrapper-class']
    });

    if (this.options['title-enabled'] === true) {
      this.title = new LEEWGL.DOM.Element('div', {
        'class': this.options['title-class']
      });
      this.wrapper.grab(this.title);
    }

    this.content = new LEEWGL.DOM.Element('div', {
      'class': this.options['content-class']
    });

    this.wrapper.grab(this.content);
    this.parent.grab(this.wrapper);

    if (this.options['overlay-enabled'] === true) {
      this.overlay = new LEEWGL.DOM.Element('div', {
        'class': this.options['overlay-class']
      });
      this.parent.grab(this.overlay);
    }

    this.initialized = true;

    if (this.options['close-icon-enabled'] === true)
      this.addCloseIcon();

    if (this.options['close-button-enabled'] === true)
      this.addCloseButton();

    if (this.options['movable'] === true)
      this.movable();

    if (this.options['hidden'] === true)
      this.hide();

    this.setDimensions();
  };

  /**
   * [center description]
   */
  this.center = function() {
    this.options['center'] = true;
    this.position();
  };

  /**
   * [getSize description]
   */
  this.getSize = function() {
    var x = 0,
      y = 0;

    var size = this.wrapper.size(this.isDisplayed, this.parent);
    return {
      'width': size.width,
      'height': size.height
    };
  };

  /**
   * [position description]
   */
  this.position = function() {
    var size = this.getSize();

    if (this.options['center'] === true) {
      var parentSize = this.parent.size();
      this.pos.x = (parentSize.width / 2) - (size.width / 2);
      this.pos.y = (parentSize.height / 2) - size.height;
    }

    this.wrapper.setStyles({
      'top': this.pos.y + 'px',
      'left': this.pos.x + 'px'
    });
  };

  /**
   * [addText description]
   * @param {String} text
   */
  this.addText = function(text) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }
    var content = new LEEWGL.DOM.Element('p', {
      'text': text
    });
    this.content.grab(content);
  };

  /**
   * [addHTML description]
   * @param {String} html
   */
  this.addHTML = function(html) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }
    this.content.appendHTML(html);
  };

  /**
   * [addList description]
   * @param {Array} content
   * @param {Function} evFunction
   */
  this.addList = function(content, evFunction) {
    var list = new LEEWGL.DOM.Element('ul', {
      'class': 'popup-list'
    });
    this.listItems = [];

    for (var i = 0; i < content.length; ++i) {
      var item = new LEEWGL.DOM.Element('li', {
        'class': this.options['list-item-class'],
        'html': content[i]
      });
      this.listItems.push(item);

      if (typeof evFunction === 'function') {
        (function(index) {
          item.addEvent('click', function(event) {
            evFunction(content[index]);
          });
        })(i);
      }
      list.grab(item);
    }

    this.content.grab(list);
  };

  /**
   * [addCustomElementToTitle description]
   * @param {DOM Element} element
   */
  this.addCustomElementToTitle = function(element) {
    this.title.grab(element);
  };

  /**
   * [addCustomElementToContent description]
   * @param {DOM Element} element
   */
  this.addCustomElementToContent = function(element) {
    this.content.grab(element);
  };

  /**
   * [addTitleText description]
   * @param {String} text
   */
  this.addTitleText = function(text) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }
    var header = new LEEWGL.DOM.Element('h1', {
      'text': text
    });
    this.title.grab(header);
  };

  /**
   * [addHTMLFile description]
   * @param {String} path
   */
  this.addHTMLFile = function(path) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    this.content.set('html', this.ajax.send('GET', LEEWGL.ROOT + path, false, null).response.responseText);
  };

  /**
   * [addCloseIcon description]
   */
  this.addCloseIcon = function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    var iconContainer = new LEEWGL.DOM.Element('div', {
      'class': 'popup-icon-wrapper fright mright10'
    });
    var clearer = new LEEWGL.DOM.Element('div', {
      'class': 'clearer'
    });

    var closeIcon = new LEEWGL.DOM.Element('img', {
      'alt': 'Close Popup',
      'title': 'Close Popup',
      'class': 'popup-close-icon'
    });

    iconContainer.grab(closeIcon);
    iconContainer.grab(clearer);

    closeIcon.addEvent('click', function(event) {
      this.hide();
    }.bind(this));

    this.title.grab(iconContainer);
  };

  /**
   * [addButton description]
   * @param {String}   value
   * @param {Function} callback
   */
  this.addButton = function(value, callback) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    var buttonContainer = new LEEWGL.DOM.Element('div', {
      'class': 'popup-button-wrapper'
    });
    var button = new LEEWGL.DOM.Element('input', {
      'type': 'submit',
      'value': value
    });
    buttonContainer.grab(button);
    button.addEvent('click', callback);
    this.content.grab(buttonContainer);
  };

  /**
   * [addCloseButton description]
   */
  this.addCloseButton = function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    var hideFunction = (function() {
      this.hide();
    }.bind(this));

    this.addButton('Close', hideFunction);
  };

  /**
   * [movable description]
   */
  this.movable = function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    var that = this;

    var iconContainer = new LEEWGL.DOM.Element('div', {
      'class': 'popup-icon-wrapper fleft mleft10'
    });
    var clearer = new LEEWGL.DOM.Element('div', {
      'class': 'clearer'
    });

    var moveIcon = new LEEWGL.DOM.Element('img', {
      'alt': 'Move Popup',
      'title': 'Move Popup',
      'class': 'popup-move-icon'
    });

    iconContainer.grab(moveIcon);
    iconContainer.grab(clearer);

    moveIcon.addEvent('mousedown', function(event) {
      if (event.which === 1 || event.button === LEEWGL.MOUSE.LEFT) {
        that.wrapper.addEvent('click', that.drag.drag(that.wrapper, event));
      }
    });
    moveIcon.addEvent('dblclick', function(event) {
      that.drag.restore(that.wrapper, event);
    });

    this.title.grab(iconContainer);
  };

  /**
   * [show description]
   *
   * Displays popup
   */
  this.show = function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    this.wrapper.setStyle('display', 'block');
    this.isDisplayed = true;
    this.showOverlay();
  };

  /**
   * [hide description]
   * Hides popup
   */
  this.hide = function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    this.isDisplayed = false;
    this.wrapper.setStyle('display', 'none');
    this.hideOverlay();
  };

  /**
   * [showOverlay description]
   * Displays overlay div
   */
  this.showOverlay = function() {
    if (this.options['overlay-enabled'] === true)
      this.overlay.setStyle('display', 'fixed');
  };

  /**
   * [hideOverlay description]
   * Hide overlay div
   */
  this.hideOverlay = function() {
    if (this.options['overlay-enabled'] === true)
      this.overlay.setStyle('display', 'none');
  };

  /**
   * [empty description]
   * Resets the popup
   */
  this.empty = function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.Popup: call create() first!');
      return;
    }

    if (this.options['title-enabled'] === true)
      this.title.set('html', '');

    if (this.options['close-icon-enabled'] === true)
      this.addCloseIcon();

    if (this.options['close-button-enabled'] === true)
      this.addCloseButton();

    if (this.options['movable'] === true)
      this.movable();

    this.content.set('html', '');
  };
};

/**
 * [description]
 * Create global variable at dom ready
 */
window.addEventListener('load', function() {
  var UI = new LEEWGL.UI();
  window.UI = UI;
});

/**
 * Constants
 */
LEEWGL.UI.STATIC = 'static';
LEEWGL.UI.ABSOLUTE = 'absolute';
LEEWGL.UI.FIXED = 'fixed';
