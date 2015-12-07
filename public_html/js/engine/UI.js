LEEWGL.REQUIRES.push('UI');

/**
 * Class to handle the editor environment
 * @constructor
 * @param {object} options
 */
LEEWGL.UI = function(options) {
  /** @inner {LEEWGL.DOM.Element} */
  this.inspector = undefined;
  /** @inner {LEEWGL.DOM.Element} */
  this.statusBar = undefined;

  /** @inner {object} */
  this.outline = {};
  /** @inner {LEEWGL.GameObject} */
  this.activeOutline = null;

  /** @inner {bool} */
  this.updateOutline = false;

  /** @inner {LEEWGL.GameObject} */
  this.activeElement = null;
  /** @inner {LEEWGL.LocalStorage} */
  this.storage = new LEEWGL.LocalStorage();
  /** @inner {bool} */
  this.playing = false;
  /** @inner {bool} */
  this.paused = false;

  /** @inner {glContext} */
  this.gl = undefined;
  /** @inner {LEEWGL.Scene} */
  this.scene = undefined;

  /** @inner {number} */
  this.activeIndex = undefined;
  /** @inner {bool} */
  this.settingsDisplayed = false;

  /** @inner {number} */
  this.importedScripts = 0;
  /** @inner {number} */
  this.appliedScripts = 0;

  /** @inner {LEEWGL.DragDrop} */
  this.drag = new LEEWGL.DragDrop();

  /** @inner {string} */
  this.transformationMode = LEEWGL.EDITOR.TRANSFORMATION.TRANSLATE;

  /** @inner {LEEWGL.UI.Popup} */
  this.popup = new LEEWGL.UI.Popup({});
  this.popup.create();

  /** @inner {LEEWGL.UI.Popup} */
  this.contextMenu = new LEEWGL.UI.Popup({
    'movable': false,
    'close-icon-enabled': false,
    'wrapper-width': 200,
    'title-enabled': false
  });
  this.contextMenu.create();

  /** @inner {LEEWGL.UI.Popup} */
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
      SETTINGS.updateFromHTML();
    } else {
      var pos = this.activeElement.transform.position;
      var trans = this.activeElement.transform.transVec;
      var rot = this.activeElement.transform.rotVec;
      var scale = this.activeElement.transform.scaleVec;

      this.activeElement.transform.dispatchEvent({
        'type': 'update-all',
        'data': {
          'position': pos,
          'translation': trans,
          'rotation': rot,
          'scale': scale
        }
      });

      this.setInspectorElement(this.activeIndex);
    }
  }.bind(this)));

  /** @inner {LEEWGL.UI.BasicPopup} */
  this.tooltipPopup = new LEEWGL.UI.BasicPopup({
    'wrapper-width': 'fit',
    'wrapper-height': 'auto',
    'wrapper-class': 'popup-tooltip',
    'content-class': 'popup-content fcenter',
    'title-enabled': false,
  });
  this.tooltipPopup.create();

  /** @inner {LEEWGL.UI.Sidebar} */
  this.sidebar = new LEEWGL.UI.Sidebar({
    'position': {
      'x': -350,
      'y': 0
    }
  });
  this.sidebar.create();
  this.sidebar.setPosition();

  /** @inner {Array} */
  this.importedScripts = [];
  /** @inner {Array} */
  this.objectScripts = [];

  /** @inner {LEEWGL.GameObject} */
  this.clipBoard = null;

  /** @inner {LEEWGL.AsynchRequest} */
  this.ajax = new LEEWGL.AsynchRequest();

  /** @inner {object} */
  this.saved = {};

  /** @inner {LEEWGL.Importer} */
  this.importer = new LEEWGL.Importer();

  /** @inner {LEEWGL.DOM.Element} */
  this.body = new LEEWGL.DOM.Element(document.body);

  /** @inner {LEEWGL.Lightbox} */
  this.lightbox = new window.LEEWGL.Lightbox({
    'anchor': 'a.lb-image',
    'link': true,
    'auto-group': false
  });

  extend(LEEWGL.UI.prototype, LEEWGL.Options.prototype);

  this.setApp = function(app) {
    this.app = app;
    this.gl = this.app.gl;
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
    index = (typeof index !== 'undefined') ? index : -1;
    var that = this;
    var outline = null;
    var resetEditable = function(outlineObject) {
      outlineObject.editable = false;

      if (outlineObject.obj.id === index)
        outline = outlineObject;

      for (var i in outlineObject.children) {
        resetEditable(outlineObject.children[i]);
      }
    };

    for (var i in this.outline) {
      resetEditable(this.outline[i]);
    }

    if (outline !== null)
      outline.editable = true;
  };

  this.setActive = function(index) {
    index = (typeof index !== 'undefined') ? index : -1;
    var that = this;
    var resetActive = function(outlineObject) {
      outlineObject.active = false;

      if (outlineObject.obj.id === index)
        that.activeOutline = outlineObject;

      for (var i in outlineObject.children) {
        resetActive(outlineObject.children[i]);
      }
    };

    for (var i in this.outline) {
      resetActive(this.outline[i]);
    }

    if (this.activeOutline !== null)
      this.activeOutline.active = true;
  };

  this.addObjToOutline = function(obj) {
    var that = this;
    var add = (function() {
      var id = this.id;
      if (this.parent instanceof LEEWGL.Scene === true) {
        that.outline[id] = {};
        that.outline[id].obj = this;
        that.outline[id].active = false;
        that.outline[id].editable = false;
        that.outline[id].children = {};
      } else {
        id = this.parent.id;
        that.outline[id].children[this.id] = {};
        that.outline[id].children[this.id].obj = this;
        that.outline[id].children[this.id].active = false;
        that.outline[id].children[this.id].editable = false;
      }
    });
    if (obj.length) {
      for (var i = 0; i < obj.length; ++i) {
        obj[i].traverse(add);
      }
    } else {
      obj.traverse(add);
    }
    this.updateOutline = true;
  };

  this.clearOutline = function() {
    this.outline = {};
  };

  this.removeObjFromOutline = function(index) {
    if (this.activeOutline.obj.parent instanceof LEEWGL.Scene === false) {
      var parentID = this.activeOutline.obj.parent.id;
      delete this.outline[parentID].children[index];
    } else {
      delete this.outline[index];
    }
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

  /**
   * Adds UI events to outline elements
   * @param  {LEEWGL.DOM.Element} elem
   * @param  {Array} outline
   */
  this.editableOutline = function(elem, outline) {
    var that = this;
    var dblclick, keydown, click;

    dblclick = function() {
      if (outline.editable === false) {
        that.setEditable(outline.obj.id);
        that.updateOutline = true;
      }
    };
    keydown = function(event, element) {
      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        that.activeElement.editables.set(that.activeElement, 'alias', element.get('text'));
        that.setEditable();
        that.updateOutline = true;
        that.setInspectorElement(outline.obj.id);

        event.preventDefault();
        event.stopPropagation();
      }
    };
    click = function() {
      if (outline.active === false && outline.editable === false) {
        that.setActive(outline.obj.id);
        that.setEditable();
        that.updateOutline = true;
        that.setInspectorElement(outline.obj.id);
      }
    };

    elem.addEvent('dblclick', function(event) {
      dblclick(new LEEWGL.DOM.Element(this));
    });

    elem.addEvent('keydown', function(event) {
      keydown(event, new LEEWGL.DOM.Element(this));
    });

    elem.addEvent('click', function(event) {
      click();
    });
  };

  this.editableDOM = function() {
    var that = this;
    var elements = document.querySelectorAll('.editable');

    var edit = function(element) {
      element.set('contenteditable', true);
    };

    for (var i = 0; i < elements.length; ++i) {
      edit(new LEEWGL.DOM.Element(elements[i]));
    }
  };

  /**
   * Sets given container to a HTML-form of this.outline
   * Calls this.displayOutlineContextMenu
   * @param  {LEEWGL.GameObject} container
   */
  this.outlineToHTML = function(container) {
    if (this.updateOutline === false)
      return;

    container = (typeof container === 'string') ? document.querySelector(container) : container;
    container = new LEEWGL.DOM.Element(container, {
      'html': ''
    });
    var that = this;

    var list = new LEEWGL.DOM.Element('ul');

    var setActive = function(element, outline) {
      element.addEvent('contextmenu', function(event) {
        if (outline.active === false && outline.editable === false) {
          that.setActive(outline.obj.id);
          that.setEditable();
          that.updateOutline = true;
          that.setInspectorElement(outline.obj.id);
        }

        that.displayOutlineContextMenu(outline.obj.id, event);
      });
    };

    var level = 0;
    var constructOutline = function(outlineObj) {
      var obj = outlineObj.obj;
      var item = new LEEWGL.DOM.Element('li');
      var element = new LEEWGL.DOM.Element('a', {
        'href': '#',
        'html': obj.alias,
        'styles': {
          'margin-left': level + 'px'
        }
      });

      item.grab(element);
      list.grab(item);

      if (outlineObj.active === true)
        item.set('class', 'active');

      if (outlineObj.editable === true) {
        item.set('class', 'edited');
        element.set('contenteditable', true);
      }
      that.editableOutline(element, outlineObj);
      setActive(element, outlineObj);

      level = 0;
      for (var i in outlineObj.children) {
        level += 10;
        constructOutline(outlineObj.children[i]);
      }
      /**
       * tooltip
       */
      var showTooltipID;
      var showTooltip = function(element) {
        var data = new LEEWGL.DOM.Element('ul');
        var tagName = new LEEWGL.DOM.Element('li', {
          'text' : 'Tagname: ' + obj.tagname
        });
        data.grab(tagName);

        element.addEvent('mouseenter', function(event) {
          showTooltipID = window.setTimeout(function() {
            that.tooltipPopup.empty();
            that.tooltipPopup.addCustomElementToContent(data);
            that.tooltipPopup.setDimensions();
            var positionY = element.position().y;
            var positionX = that.inspector.position().x;

            var size = that.tooltipPopup.getSize();
            that.tooltipPopup.setPosition({
              'x': positionX,
              'y': positionY
            });
            that.tooltipPopup.show();
          }, 1000);
        });
      };

      var hideTooltip = function(element) {
        element.addEvent('mouseout', function(event) {
          window.clearTimeout(showTooltipID);
          that.tooltipPopup.hide();
        });
      };

      showTooltip(item);
      hideTooltip(item);
    };

    for (var i in this.outline) {
      var outline = this.outline[i];
      constructOutline(outline);
    }

    container.grab(list);
    this.updateOutline = false;
  };

  this.dispatchTypes = function(element, vector, type, num) {
    var vec = vec3.clone(vector);

    var checkNaN = function(vector) {
      for (var i = 0; i < vector.length; ++i) {
        if (isNaN(vector[i]))
          return false;
      }
      return true;
    };
    var pos = function(args) {
      if (!checkNaN(args[0]))
        return;
      this.transform.setPosition(args[0]);
    };
    var trans = function(args) {
      if (!checkNaN(args[0]))
        return;
      this.transform.translate(args[0]);
    };
    var rot = function(args) {
      if (!checkNaN(args[0]))
        return;
      if (args[1] === 0)
        this.transform.rotateX(args[0][0]);
      else if (args[1] === 1)
        this.transform.rotateY(args[0][1]);
      else if (args[1] === 2)
        this.transform.rotateZ(args[0][2]);
    };
    var scale = function(args) {
      if (!checkNaN(args[0]))
        return;
      this.transform.scale(args[0]);
    };

    if (type === 'transform-position') {
      element.traverse(pos, [vec]);
    } else if (type === 'transform-translation') {
      element.traverse(trans, [vec]);
    } else if (type === 'transform-rotation') {
      element.traverse(rot, [vector, num]);
    } else if (type === 'transform-scale') {
      element.traverse(scale, [vector]);
    }
  };
  /**
   * Returns link with event handler to remove component from given element
   * @param  {LEEWGL.GameObject} element
   * @param  {LEEWGL.Component} component
   * @return {LEEWGL.DOM.Element}
   */
  this.removeComponentButton = function(element, component) {
    var that = this;
    var removeComponentContainer = new LEEWGL.DOM.Element('div', {
      'class': 'icon-container-small fright'
    });
    var removeComponent = new LEEWGL.DOM.Element('a', {
      'class': 'delete-icon bg-pos54 pointer',
      'title': 'Remove Component'
    });

    removeComponent.addEvent('click', function() {
      element.removeComponent(component);
      that.setInspectorElement(element.id);
    });

    removeComponentContainer.grab(removeComponent);

    return removeComponentContainer;
  };

  /**
   * Returns a HTML-form of the transform component of given element
   * Adds UI events to change transform values
   * @param  {LEEWGL.GameObject} element
   * @return {LEEWGL.DOM.Element} container
   */
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

    var keydown = (function(event, td, table, vector) {
      var num = parseInt(td.get('num'));
      var value = parseFloat(td.get('text'));
      var keys = Object.keys(vector);

      var size = table.size(false);
      table.setStyle('width', size.width + 'px');

      if (event.keyCode === LEEWGL.KEYS.ENTER) {
        if (typeof vector[num] === 'undefined') {
          vector[keys[index]] = value;
        } else {
          vector[num] = value;
        }

        that.dispatchTypes(element, vector, td.get('identifier'), num);
        that.setInspectorElement(element.id);

        event.preventDefault();
        event.stopPropagation();
      }
    });

    var keyup = (function(event, td, table, vector) {
      var num = parseInt(td.get('num'));
      var value = parseFloat(td.get('text'));
      var keys = Object.keys(vector);

      if (typeof vector[num] === 'undefined') {
        vector[keys[index]] = value;
      } else {
        vector[num] = value;
      }
      that.dispatchTypes(element, vector, td.get('identifier'), num);
    });

    // / position
    container.grab(HTMLHELPER.createTableAsDiv({
      'id': 'transform-position',
      'container-class': 'component-detail-container',
      'table-class': 'm0auto dark-primary-color p5 max-width-280',
      'table-width': 'fit',
      'headline-class': 'component-detail-headline',
      'headline-type': 'h4',
      'title-class': 'table-title',
      'content-class': 'editable table-content',
    }, ['x:', 'y:', 'z:'], vec3.clone(transform.position), 'Position', keydown, keyup));
    // / translation
    container.grab(HTMLHELPER.createTableAsDiv({
      'id': 'transform-translation',
      'container-class': 'component-detail-container',
      'table-class': 'm0auto dark-primary-color p5 max-width-280',
      'table-width': 'fit',
      'headline-class': 'component-detail-headline',
      'headline-type': 'h4',
      'title-class': 'table-title',
      'content-class': 'editable table-content',
    }, ['x:', 'y:', 'z:'], vec3.clone(transform.transVec), 'Translation', keydown, keyup));

    // / rotation
    container.grab(HTMLHELPER.createTableAsDiv({
      'id': 'transform-rotation',
      'container-class': 'component-detail-container',
      'table-class': 'm0auto dark-primary-color p5 max-width-280',
      'table-width': 'fit',
      'headline-class': 'component-detail-headline',
      'headline-type': 'h4',
      'title-class': 'table-title',
      'content-class': 'editable table-content',
    }, ['x:', 'y:', 'z:'], vec3.clone(transform.rotVec), 'Rotation', keydown, keyup));
    // / scale
    container.grab(HTMLHELPER.createTableAsDiv({
      'id': 'transform-scale',
      'container-class': 'component-detail-container',
      'table-class': 'm0auto dark-primary-color p5 max-width-280',
      'table-width': 'fit',
      'headline-class': 'component-detail-headline',
      'headline-type': 'h4',
      'title-class': 'table-title',
      'content-class': 'editable table-content',
    }, ['x:', 'y:', 'z:'], vec3.clone(transform.scaleVec), 'Scale', keydown, keyup));

    return container;
  };

  /**
   * Returns a HTML-form of the custom script component of given element
   * Adds UI events to add/delete/modify scripts
   * @param  {LEEWGL.GameObject} element
   * @return {LEEWGL.DOM.Element} container
   */
  this.customScriptToHTML = function(element) {
    var that = this;
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

    var removeComponentContainer = this.removeComponentButton(element, script);

    var appliedScriptsContainer = new LEEWGL.DOM.Element('div', {
      'class': 'component-detail-container'
    });
    var appliedScriptsHeadline = new LEEWGL.DOM.Element('h4', {
      'class': 'component-detail-headline',
      'text': 'Applied Scripts'
    });

    appliedScriptsContainer.grab(appliedScriptsHeadline);

    var appliedScripts = script.applied;
    var appliedScriptsLength = Object.keys(script.applied).length;
    /**
     * Applied Scripts
     */
    if (appliedScriptsLength > 0) {
      if (typeof this.saved['applied-scripts-data-toggled-' + element.id] === 'undefined')
        this.saved['applied-scripts-data-toggled-' + element.id] = 'false';

      var height = '0px';
      var opacity = 0;
      if (this.saved['applied-scripts-data-toggled-' + element.id] === 'true') {
        height = '150px';
        opacity = 1;
      }

      var iconContainer = new LEEWGL.DOM.Element('div', {
        'class': 'icon-container-small fright',
        'data-toggled': this.saved['applied-scripts-data-toggled-' + element.id]
      });

      var toggleAppliedScript = new LEEWGL.DOM.Element('a', {
        'class': 'toggle-down bg-pos47 pointer',
        'title': 'Toggle Applied Scripts'
      });

      var clearer = new LEEWGL.DOM.Element('div', {
        'class': 'clearer'
      });

      var appliedScriptsInnerContainer = new LEEWGL.DOM.Element('div', {
        'styles': {
          'height': height
        },
        'class': 'mtop10'
      });

      iconContainer.grab(toggleAppliedScript);
      appliedScriptsContainer.grab(iconContainer, 'top');
      appliedScriptsContainer.grab(clearer);

      var appliedScriptsList = new LEEWGL.DOM.Element('ul', {
        'styles': {
          'opacity': opacity
        }
      });

      var appliedScriptsEvents = function(script, id, editAppliedScript, deleteAppliedScript) {
        editAppliedScript.addEvent('click', function(event) {
          that.popup.setOptions({
            'wrapper-width': 400,
          });
          that.popup.empty();
          that.popup.addTitleText(id);

          var codeContainer = new LEEWGL.DOM.Element('textarea', {
            'text': script.get('data'),
            'styles': {
              'margin-top': '5px',
              'margin-bottom': '5px'
            }
          });
          var updateAppliedScript = new LEEWGL.DOM.Element('input', {
            'type': 'submit',
            'class': 'submit',
            'value': 'Update script'
          });

          updateAppliedScript.addEvent('click', function(event) {
            that.addScriptToObject(id, element.id, codeContainer.e.value);
            that.setInspectorElement(element.id);
            event.preventDefault();
            event.stopPropagation();
          });

          that.popup.addCustomElementToContent(codeContainer);
          that.popup.addCustomElementToContent(updateAppliedScript);
          that.popup.setDimensions();
          that.popup.center();
          that.popup.setStyle({
            'word-wrap': 'break-word'
          });
          that.popup.show();
        });

        deleteAppliedScript.addEvent('click', function(event) {
          that.removeScriptFromObject(id, element.id);
          that.setInspectorElement(element.id);
        });
      };

      for (var scriptID in appliedScripts) {
        var appliedScriptListItem = new LEEWGL.DOM.Element('li', {
          'class': 'big-list'
        });
        var appliedScript = new LEEWGL.DOM.Element('a', {
          'href': '#',
          'text': scriptID,
          'data': this.saved['custom-object-' + element.id + '-script-' + scriptID],
          'class': 'fleft',
          'styles': {
            'width': '225px',
            'line-height': '24px'
          }
        });
        var editAppliedScript = new LEEWGL.DOM.Element('a', {
          'href': '#',
          'title': 'Edit script',
          'class': 'edit-icon fright mright5 bg-pos0 pointer'
        });
        var deleteAppliedScript = new LEEWGL.DOM.Element('a', {
          'href': '#',
          'title': 'Delete script',
          'class': 'delete-icon fright bg-pos0 pointer'
        });
        var clearer = new LEEWGL.DOM.Element('div', {
          'class': 'clearer'
        });

        appliedScriptsEvents(appliedScript, scriptID, editAppliedScript, deleteAppliedScript);

        appliedScriptListItem.grab(appliedScript);
        appliedScriptListItem.grab(deleteAppliedScript);
        appliedScriptListItem.grab(editAppliedScript);
        appliedScriptListItem.grab(clearer);
        appliedScriptsList.grab(appliedScriptListItem);
      }

      appliedScriptsInnerContainer.grab(appliedScriptsList);
      appliedScriptsContainer.grab(appliedScriptsInnerContainer);
      var animation = new LEEWGL.DOM.Animator();

      iconContainer.addEvent('click', function(event) {
        if (iconContainer.get('data-toggled') === 'false') {
          animation.animate(appliedScriptsInnerContainer, {
            'height': '150px'
          }, 0.2, function() {
            animation.fade('toggle', appliedScriptsList, 0.2);
            toggleAppliedScript.set('class', 'toggle-up bg-pos46 pointer');
          });
          iconContainer.set('data-toggled', 'true');
          that.saved['applied-scripts-data-toggled-' + element.id] = 'true';
        } else {
          animation.fade('out', appliedScriptsList, 0.2, function() {
            animation.animate(appliedScriptsInnerContainer, {
              'height': '0px'
            }, 0.2);
            toggleAppliedScript.set('class', 'toggle-down bg-pos47 pointer');
          });
          iconContainer.set('data-toggled', 'false');
          that.saved['applied-scripts-data-toggled-' + element.id] = 'false';
        }
      });
    } else {
      appliedScriptsHeadline.set('text', 'No applied scripts');
    }

    var newScriptContainer = new LEEWGL.DOM.Element('div', {
      'class': 'component-detail-container'
    });
    var newScriptHeadline = new LEEWGL.DOM.Element('h4', {
      'class': 'component-detail-headline mbot10',
      'text': 'New Script'
    });

    var newScriptName = new LEEWGL.DOM.Element('input', {
      'type': 'text',
      'placeholder': 'Enter your script name here',
      'styles': {
        'margin-bottom': '10px'
      }
    });

    var newScriptContent = new LEEWGL.DOM.Element('textarea', {
      'rows': 5,
      'cols': 30,
      'placeholder': 'Enter your custom code here'
    });

    newScriptContainer.grab(newScriptHeadline);
    newScriptContainer.grab(newScriptName);
    newScriptContainer.grab(newScriptContent);

    var addScript = new LEEWGL.DOM.Element('input', {
      'type': 'submit',
      'class': 'submit-small',
      'value': 'Add script',
      'styles': {
        'margin-bottom': '5px'
      }
    });

    addScript.addEvent('click', function(event) {
      var scriptID = newScriptName.e.value;
      if (scriptID === '')
        scriptID = 'custom-object-' + element.id + '-script-' + that.appliedScripts;
      that.addScriptToObject(scriptID, element.id, newScriptContent.e.value);
      that.setInspectorElement(element.id);
      event.preventDefault();
      event.stopPropagation();
    });

    container.grab(appliedScriptsContainer);
    container.grab(newScriptContainer);
    container.grab(addScript);

    container.grab(removeComponentContainer, 'top');

    return container;
  };
  /**
   * Returns a HTML-form of the texture component of given element
   * @param  {LEEWGL.GameObject} element
   * @return {LEEWGL.DOM.Element} container
   */
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

    var removeComponentContainer = this.removeComponentButton(element, texture);

    var fileName = new LEEWGL.DOM.Element('h4', {
      'class': 'component-sub-headline'
    });
    var fileInput = new LEEWGL.DOM.Element('input', {
      'type': 'file'
    });
    var imageContainer = new LEEWGL.DOM.Element('div', {
      'id': 'texture-preview-container',
      'class': 'image-preview-container'
    });
    var imageAnchor = new LEEWGL.DOM.Element('a', {
      'class': 'lb-image'
    });
    var image = new LEEWGL.DOM.Element('img');
    imageAnchor.grab(image);
    imageContainer.grab(imageAnchor);

    if (typeof this.saved['object-' + element.id + '-texture-path'] !== 'undefined') {
      imageAnchor.set('href', this.saved['object-' + element.id + '-texture-path']);
      image.set('src', this.saved['object-' + element.id + '-texture-path']);
      fileInput.set('value', this.saved['object-' + element.id + '-texture-path']);
      fileName.set('text', this.saved['object-' + element.id + '-texture-path']);
    } else {
      fileName.set('text', 'No Texture');
    }

    var path = LEEWGL.ROOT + 'texture/';
    var name = '';
    if (texture.initialized === true) {
      name = texture.getSource();
      imageAnchor.set('href', name);
      image.set('src', name);
      fileName.set('text', name);
    }

    var that = this;
    fileInput.addEvent('change', function(event) {
      name = this.value.substr(this.value.lastIndexOf('\\') + 1, this.value.length);
      path = LEEWGL.ROOT + 'texture/';
      texture.init(that.gl, path + name);

      that.saved['object-' + element.id + '-texture-path'] = path + name;
      fileName.set('text', path + name);

      imageAnchor.set('href', path + name);
      image.set('src', path + name);
      that.lightbox.update();
    });

    container.grab(fileName);
    container.grab(fileInput);
    container.grab(imageContainer);
    container.grab(removeComponentContainer, 'top');

    return container;
  };
  /**
   * Returns a HTML-form of the billboard component of given element
   * @param  {LEEWGL.GameObject} element
   * @return {LEEWGL.DOM.Element} container
   */
  this.billboardToHTML = function(element) {
    var billboard = element.components['Billboard'];
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container',
      'id': 'billboard-component-container'
    });
    var title = new LEEWGL.DOM.Element('h3', {
      'class': 'component-headline',
      'html': 'Billboard'
    });
    container.grab(title);

    var removeComponentContainer = this.removeComponentButton(element, billboard);

    var fileName = new LEEWGL.DOM.Element('h4', {
      'class': 'component-sub-headline'
    });
    var fileInput = new LEEWGL.DOM.Element('input', {
      'type': 'file'
    });
    var imageContainer = new LEEWGL.DOM.Element('div', {
      'id': 'billboard-preview-container',
      'class': 'image-preview-container'
    });
    var imageAnchor = new LEEWGL.DOM.Element('a', {
      'class': 'lb-image'
    });
    var image = new LEEWGL.DOM.Element('img');
    imageAnchor.grab(image);
    imageContainer.grab(imageAnchor);

    // if (typeof this.saved['object-' + element.id + '-texture-path'] !== 'undefined') {
    //   image.set('src', this.saved['object-' + element.id + '-texture-path']);
    //   fileInput.set('value', this.saved['object-' + element.id + '-texture-path']);
    //   fileName.set('text', this.saved['object-' + element.id + '-texture-path']);
    // } else {
    //   fileName.set('text', 'No Texture');
    // }

    var that = this;

    var path = LEEWGL.ROOT + 'billboard/';
    var name = '';
    if (billboard.initialized === true) {
      name = billboard.getSource();
      imageAnchor.set('href', name);
      image.set('src', name);
      fileName.set('text', name);
    }

    fileInput.addEvent('change', function(event) {
      name = this.value.substr(this.value.lastIndexOf('\\') + 1, this.value.length);
      billboard.init(that.gl, path + name);

      that.saved['object-' + element.id + '-billboard-path'] = path + name;
      fileName.set('text', path + name);

      imageAnchor.set('href', path + name);
      image.set('src', path + name);
      that.lightbox.update();
    });

    container.grab(fileName);
    container.grab(fileInput);
    container.grab(imageContainer);
    container.grab(removeComponentContainer, 'top');

    return container;
  };
  /**
   * Returns a HTML-form of the bumpMap component of given element
   * @param  {LEEWGL.GameObject} element
   * @return {LEEWGL.DOM.Element} container
   */
  this.bumpMapToHTML = function(element) {
    var bumpMap = element.components['BumpMap'];
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container',
      'id': 'bumpmap-component-container'
    });
    var title = new LEEWGL.DOM.Element('h3', {
      'class': 'component-headline',
      'html': 'BumpMap'
    });
    container.grab(title);

    var removeComponentContainer = this.removeComponentButton(element, bumpMap);

    var fileName = new LEEWGL.DOM.Element('h4', {
      'class': 'component-sub-headline'
    });
    var fileInput = new LEEWGL.DOM.Element('input', {
      'type': 'file'
    });
    var imageContainer = new LEEWGL.DOM.Element('div', {
      'id': 'billboard-preview-container',
      'class': 'image-preview-container'
    });
    var imageAnchor = new LEEWGL.DOM.Element('a', {
      'class': 'lb-image'
    });
    var image = new LEEWGL.DOM.Element('img');
    imageAnchor.grab(image);
    imageContainer.grab(imageAnchor);

    // if (typeof this.saved['object-' + element.id + '-texture-path'] !== 'undefined') {
    //   image.set('src', this.saved['object-' + element.id + '-texture-path']);
    //   fileInput.set('value', this.saved['object-' + element.id + '-texture-path']);
    //   fileName.set('text', this.saved['object-' + element.id + '-texture-path']);
    // } else {
    //   fileName.set('text', 'No Texture');
    // }

    var that = this;

    var path = LEEWGL.ROOT + 'texture/';
    var name = '';
    if (bumpMap.initialized === true) {
      name = bumpMap.getSource();
      imageAnchor.set('href', name);
      image.set('src', name);
      fileName.set('text', name);
    }

    fileInput.addEvent('change', function(event) {
      name = this.value.substr(this.value.lastIndexOf('\\') + 1, this.value.length);
      bumpMap.init(that.gl, path + name);

      that.saved['object-' + element.id + '-bumpMap-path'] = path + name;
      fileName.set('text', path + name);

      imageAnchor.set('href', path + name);
      image.set('src', path + name);
      that.lightbox.update();
    });

    container.grab(fileName);
    container.grab(fileInput);
    container.grab(imageContainer);
    container.grab(removeComponentContainer, 'top');

    return container;
  };
  /**
   * Returns a HTML-form of the collider component of given element
   * @param  {LEEWGL.GameObject} element
   * @return {LEEWGL.DOM.Element} container
   */
  this.colliderToHTML = function(element) {
    var that = this;
    var collider = element.components['Collider'];
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'component-container',
      'id': 'collider-component-container'
    });
    var title = new LEEWGL.DOM.Element('h3', {
      'class': 'component-headline',
      'html': 'Collider'
    });
    container.grab(title);

    var removeComponentContainer = this.removeComponentButton(element, collider);

    container.grab(removeComponentContainer, 'top');

    return container;
  };
  /**
   * Iterates through components of given element and returns a HTML-form of all components
   * @param  {LEEWGL.GameObject} element
   * @return {LEEWGL.DOM.Element} container
   */
  this.componentsToHTML = function(element) {
    var container = new LEEWGL.DOM.Element('div');
    var title;

    var that = this;

    for (var name in element.components) {
      if (!element.components.hasOwnProperty(name))
        continue;

      var component = element.components[name];

      if (component instanceof LEEWGL.Component.Transform)
        container.grab(this.transformToHTML(element));
      else if (component instanceof LEEWGL.Component.CustomScript)
        container.grab(this.customScriptToHTML(element));
      else if (component instanceof LEEWGL.Component.Texture)
        container.grab(this.textureToHTML(element));
      else if (component instanceof LEEWGL.Component.Collider)
        container.grab(this.colliderToHTML(element));
      else if (component instanceof LEEWGL.Component.Billboard)
        container.grab(this.billboardToHTML(element));
      else if (component instanceof LEEWGL.Component.BumpMap)
        container.grab(this.bumpMapToHTML(element));
    }
    return container;
  };

  /**
   * Returns a HTML-form of the editable json array of given obj
   * @param  {LEEWGL.GameObject} obj
   * @return {LEEWGL.DOM.Element} container
   */
  this.valuesToHTML = function(obj) {
    var container;
    var title;

    var that = this;

    if (typeof obj.editables !== 'undefined') {
      container = new LEEWGL.DOM.Element('div', {
        'class': 'component-container'
      });
      title = new LEEWGL.DOM.Element('h3', {
        'class': 'component-headline',
        'html': 'Values'
      });
      container.grab(title);

      var keyFunction = (function(element, vector) {
        var num = parseInt(element.get('num'));
        var id = element.get('identifier');
        var value = '';
        if (typeof vector === 'object') {
          value = parseFloat(element.get('text'));
          obj.editables.set(obj, id, value, num);
        } else {
          value = element.e.value;
          if (obj.editables.type === 'number')
            value = parseFloat(element.e.value);
          obj.editables.set(obj, id, value);
        }
      });

      var keyup = (function(event, element, table, vector) {
        keyFunction(element, vector);
      });

      var keydownTable = (function(event, element, table, vector) {
        var size = table.size(false);
        table.setStyle('width', size.width + 'px');
        if (event.keyCode === LEEWGL.KEYS.ENTER) {
          keyFunction(element, vector);
          that.updateOutline = true;
          that.setInspectorElement(obj.id);
        }
      });

      var keydownInput = (function(event, element, vector) {
        if (event.keyCode === LEEWGL.KEYS.ENTER) {
          keyFunction(element, vector);
          that.updateOutline = true;
          that.setInspectorElement(obj.id);
        }
      });

      /// FIXME: can be called in play mode and doesnt work as expected
      var changeLight = (function(event, element, content) {
        var old = that.scene.getObjectByType('Light');
        var newType = element.e.value;

        if (old.lightType === newType)
          return;

        that.scene.remove(old);
        that.removeObjFromOutline(old.id);

        var newLight = functionFromString('LEEWGL.Light.' + newType + 'Light');
        newLight = new newLight({
          'tagname': 'Light',
          'alias': 'Light'
        });
        that.scene.add(newLight);
        that.addObjToOutline(newLight);
        that.setInspectorElement(newLight.id);

        var typeShader = LEEWGL.ShaderLibrary[newLight.lightType.toUpperCase()];
        that.app.onShaderChange('light', typeShader);
      });

      var changeRenderProperties = (function(event, element, vector) {
        var id = element.get('identifier');
        // obj.editables.set(obj, '')
        console.log(obj.editables);
        console.log(element.e.checked);
      });

      for (var e in obj.editables) {
        var editable = obj.editables[e];
        if (editable.type === 'vector') {
          console.log(editable);
          container.grab(HTMLHELPER.createTableAsDiv({
            'id': e,
            'container-class': 'component-detail-container',
            'table-class': 'm0auto dark-primary-color p5 max-width-280',
            'table-width': 'fit',
            'headline-class': 'component-detail-headline',
            'headline-type': 'h4',
            'title-class': 'table-title',
            'content-class': 'editable table-content'
          }, editable['table-titles'], editable.value, editable.name, keydownTable, keyup));
        } else if (editable.type === 'string' || editable.type === 'number') {
          container.grab(HTMLHELPER.createContainerDetailInput({
            'id': e,
            'container-class': 'component-detail-container',
            'headline-class': 'component-detail-headline',
            'headline-type': 'h4'
          }, editable.name, editable.value, keydownInput, keyup));
        } else if (editable.type === 'array') {
          if (obj instanceof LEEWGL.Light) {
            var light = this.scene.getObjectByType('Light');
            /// deep copy of string array
            var content = JSON.parse(JSON.stringify(LEEWGL.ENGINE.LIGHTS));
            /// get all but the actual light type
            content.splice(LEEWGL.ENGINE.LIGHTS.indexOf(light.lightType), 1);
            container.grab(HTMLHELPER.createDropdown({
              'id': e,
              'container-class': 'component-detail-container',
              'headline-class': 'component-detail-headline',
              'headline-type': 'h4',
              'input-class': 'settings-dropdown'
            }, editable.name, content, changeLight, light.lightType));
          }
        } else if (editable.type === 'checkbox') {
          var ids = [];
          var c = [];
          var d = [];
          for (var checkbox in editable) {
            if (checkbox !== 'alias' && checkbox !== 'type' && checkbox !== 'name') {
              ids.push(checkbox);
              c.push(editable[checkbox]['name']);
              d.push(editable[checkbox]['value']);
            }
          }
          container.grab(HTMLHELPER.createCheckbox({
            'container-class': 'component-detail-container',
            'headline-class': 'component-detail-headline',
            'headline-type': 'h4',
            'input-class': 'settings-checkbox fleft'
          }, ids, editable.name, c, changeRenderProperties, d));
        }
      }
      return container;
    }
  };

  /**
   * Sets inspector content to given dom content
   * @param  {LEEWGL.DOM.Element | DOMElement} content
   */
  this.setInspectorContent = function(content) {
    if (typeof this.inspector === 'undefined') {
      console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
      return;
    }
    this.inspector.set('html', '');
    this.inspector.grab(content);
  };

  /**
   * Sets inspector to given id of gameobject
   * @param  {number} index
   */
  this.setInspectorElement = function(index) {
    if (typeof this.inspector === 'undefined') {
      console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
      return;
    }

    this.inspector.set('html', '');

    this.activeIndex = index;
    this.setActive(index);

    if (index === -1) {
      this.activeElement = null;
      this.activeOutline = null;
      window.activeElement = this.activeElement;
      this.updateOutline = true;
      return;
    }

    this.activeElement = this.activeOutline.obj;
    window.activeElement = this.activeElement;

    var name = new LEEWGL.DOM.Element('h3', {
      'class': 'component-detail-headline',
      'text': activeElement.alias
    });

    this.inspector.grab(name);

    var values = this.valuesToHTML(activeElement);
    var components = this.componentsToHTML(activeElement);
    var componentsButton = this.componentsButton();

    this.inspector.grab([values, components, componentsButton]);

    this.editableDOM();

    this.lightbox.update();
    this.updateOutline = true;
  };

  /**
   * Returns container with button to add further components to gameobject on click
   * @return {LEEWGL.DOM.Element} container
   */
  this.componentsButton = function() {
    var that = this;
    var container = new LEEWGL.DOM.Element('div', {
      'class': 'controls-container'
    });
    var addComponentControl = new LEEWGL.DOM.Element('input', {
      'class': 'submit',
      'type': 'submit',
      'value': 'Add Component'
    });
    container.grab(addComponentControl);

    addComponentControl.addEvent('click', function(event) {
      that.displayComponentMenu(event);
    });

    return container;
  };

  /**
   * @param  {string} title
   * @param  {DOMElement} content
   */
  this.setSidebarContent = function(title, content) {
    this.sidebar.setOptions({
      'wrapper-height': this.sidebar.parent.size()['scroll-height']
    });
    this.sidebar.empty();
    this.sidebar.addTitleText(title);
    this.sidebar.addCustomElementToContent(content);
    this.sidebar.setDimensions();
    this.sidebar.show();
  };

  /**
   * @param  {string} title
   * @param  {DOMElement} content
   */
  this.setPopupContent = function(title, content) {
    this.popup.empty();
    this.popop.addTitleText(title);
    this.popop.addCustomElementToContent(content);
    this.popop.setDimensions();
    this.popup.center();
    this.popop.show();
  };

  /**
   * @param  {string} title
   * @param  {string} src
   */
  this.setSidebarHTML = function(title, src) {
    this.sidebar.setOptions({
      'wrapper-height': this.sidebar.parent.size()['scroll-height']
    });
    this.sidebar.empty();
    this.sidebar.addTitleText(title);
    this.sidebar.addHTMLFile(src);
    this.sidebar.setDimensions();
    this.sidebar.show();
  };

  /**
   * @param  {string} title
   * @param  {string} src
   */
  this.setPopupHTML = function(title, src) {
    this.popup.empty();
    this.popup.addTitleText(title);
    this.popup.addHTMLFile(src);
    this.popup.setDimensions();
    this.popup.center();
    this.popup.show();
  };

  this.dynamicContainers = function(classname_toggle, classname_container, movable_container) {
    var that = this;
    var toggles = document.querySelectorAll(classname_toggle);
    var containers = document.querySelectorAll(classname_container);

    var makeDynamic = function(index) {
      var toggle = new LEEWGL.DOM.Element(toggles[index]);
      var container = new LEEWGL.DOM.Element(containers[index]);

      toggle.addEvent('mousedown', function(event) {
        if (event.which === 1 || event.button === LEEWGL.MOUSE.LEFT) {
          container.addClass('movable');
          container.addEvent('click', that.drag.drag(container, event));
        }
      });
      toggle.addEvent('dblclick', function(event) {
        container.removeClass('movable');
        that.drag.restore(container, event);
      });
    };

    for (var i = 0; i < toggles.length; ++i) {
      makeDynamic(i);
    }
  };

  this.tooltipEvent = function(classname) {
    var elements = document.querySelectorAll(classname);

    var showTooltipID;
    var that = this;
    var showTooltip = function(element) {
      element.addEvent('mouseenter', function(event) {
        showTooltipID = window.setTimeout(function() {
          that.tooltipPopup.empty();
          that.tooltipPopup.addText(element.get('data-tooltip'));
          that.tooltipPopup.setDimensions();
          var position = element.position();
          var size = that.tooltipPopup.getSize();
          that.tooltipPopup.setPosition({
            'x': position.x - (size.width / 2),
            'y': position.y - (size.height + 10)
          });
          that.tooltipPopup.show();
        }, 1000);
      });
    };

    var hideTooltip = function() {
      element.addEvent('mouseout', function(event) {
        window.clearTimeout(showTooltipID);
        that.tooltipPopup.hide();
      });
    };

    for (var i = 0; i < elements.length; ++i) {
      var element = new LEEWGL.DOM.Element(elements[i]);
      showTooltip(element);
      hideTooltip();
    }
  };

  this.addScriptToObject = function(scriptID, elementID, src) {
    var script;
    var element = this.outline[elementID].obj;

    element.components['CustomScript'].addScript(scriptID, src);
    var applied = element.components['CustomScript'].applied;

    if (element.hasEventListenerType(scriptID)) {
      element.removeEventListenerType(scriptID);
    } else {
      this.appliedScripts++;
    }

    this.saved['custom-object-' + elementID + '-script-' + scriptID] = src;

    // element.addEventListener(scriptID, function() {
    //     var func = Function(src).bind(element);
    //     console.log(src);
    //     func();
    // });
  };

  this.removeScriptFromObject = function(scriptID, elementID) {
    var element = this.outline[elementID].obj;

    element.components['CustomScript'].removeScript(scriptID);
    if (element.hasEventListenerType(scriptID))
      element.removeEventListenerType(scriptID);
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

  this.displaySettings = function(displayInSidebar) {
    displayInSidebar = (typeof displayInSidebar !== 'undefined') ? displayInSidebar : true;

    if (displayInSidebar === true)
      this.setSidebarContent('Settings', SETTINGS.toHTML());
    else
      this.setInspectorContent(SETTINGS.toHTML());
    this.editableDOM();
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

  this.displaySidebar = function() {
    this.sidebar.setOptions({
      'wrapper-height': this.sidebar.parent.size()['scroll-height']
    });
    this.sidebar.setDimensions();
    this.sidebar.toggle();
  };

  this.displayOutlineContextMenu = function(index, event) {
    var that = this;

    this.contextMenu.empty();

    var listItems = ['Duplicate', 'Copy', 'Cut', 'Paste', 'Paste into', 'Delete'];

    this.contextMenu.addList(listItems, function(item) {
      if (item.toLowerCase() === 'duplicate')
        that.duplicateObject();
      if (item.toLowerCase() === 'copy')
        that.copyObject();
      else if (item.toLowerCase() === 'cut')
        that.cutObject();
      else if (item.toLowerCase() === 'paste')
        that.pasteObject();
      else if (item.toLowerCase() === 'paste into')
        that.pasteObjectInto();
      else if (item.toLowerCase() === 'delete')
        that.deleteObject();

      that.contextMenu.hide();
    });

    var scroll = this.popup.parent.getScroll();
    var spacing = 20;

    this.contextMenu.setPosition({
      'x': scroll.x + event.clientX,
      'y': scroll.y + event.clientY + spacing
    });
    this.contextMenu.setDimensions();
    this.contextMenu.show();

    var documentClickHandler = (function(evt) {
      that.contextMenu.hide();
      document.removeEventListener('click', documentClickHandler);
      evt.preventDefault();
    });

    document.addEventListener('click', documentClickHandler);
    event.preventDefault();
  };

  this.displayComponentMenu = function(event) {
    var that = this;

    // / get all not already added components
    var availableComponents = this.getAvailableComponents(this.activeOutline.obj);

    this.popup.setOptions({
      'title-fontsize': 19,
      'wrapper-width': 275
    });
    this.popup.empty();
    this.popup.addTitleText('Add Component');

    var scroll = this.popup.parent.getScroll();
    var spacing = 20;

    this.popup.addList(availableComponents, function(item) {
      var className = functionFromString('LEEWGL.Component.' + item);
      that.activeElement.addComponent(new className());
      that.setInspectorElement(that.activeElement.id);
      that.popup.hide();
    });

    this.popup.setPosition({
      'x': scroll.x + event.clientX,
      'y': scroll.y + event.clientY + spacing
    });
    this.popup.setDimensions();
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

  /**
   * Transformation Control
   */

  this.setTransformationMode = function(mode) {
    var activeControl = new LEEWGL.DOM.Element(document.querySelector('.' + mode + '-control'));
    if (activeControl.hasClass(this.transformationMode + '-control'))
      activeControl.removeClass(this.transformationMode + '-control');

    activeControl.addClass(mode + '-control-active');
    if (mode !== this.transformationMode) {
      var oldControl = new LEEWGL.DOM.Element(document.querySelector('.' + this.transformationMode + '-control-active'));
      oldControl.removeClass(this.transformationMode + '-control-active');
      oldControl.addClass(this.transformationMode + '-control');
    }
    this.transformationMode = mode;

    this.statusBarToHTML();
  };

  /**
   * Scene Management
   */

  this.play = function(playControl) {
    if (playControl instanceof LEEWGL.DOM.Element === false)
      playControl = new LEEWGL.DOM.Element(playControl);

    if (playControl.get('id') === 'play-control') {
      playControl.set('id', 'pause-control');
      playControl.removeClass('play-control');
      playControl.addClass('pause-control');
      this.playing = true;
      this.paused = false;
    } else {
      playControl.set('id', 'pause-control');
      playControl.addClass('play-control');
      playControl.removeClass('pause-control');
      this.paused = true;
      this.playing = false;
      return;
    }

    this.app.onPlay();

    Window.prototype.dispatchEvent({
      'type': 'custom'
    });
  };

  this.stop = function() {
    var playControl;
    if ((playControl = new LEEWGL.DOM.Element(document.getElementById('pause-control'))) !== null) {
      playControl.set('id', 'play-control');
      playControl.addClass('play-control');
      playControl.removeClass('pause-control');
    }

    this.app.onStop();
    this.playing = false;
    this.paused = false;
  };

  /**
   * Object methods
   *
   */

  /**
   * Duplicates selected object
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
  /**
   * Deletes selected object
   */
  this.deleteObject = function() {
    if (this.activeElement === null) {
      console.warn('LEEWGL.UI: No active element selected!');
      return;
    }
    this.removeObjFromOutline(this.activeIndex);
    this.scene.remove(this.activeElement);
    this.activeElement = null;
    this.activeOutline = null;
  };
  /**
   * Copies selected object
   */
  this.copyObject = function() {
    if (this.activeElement === null) {
      console.warn('LEEWGL.UI: No active element selected!');
      return;
    }

    this.clipBoard = this.activeElement.clone();
    this.statusBarToHTML();
  };
  /**
   * Cuts selected object
   */
  this.cutObject = function() {
    if (this.activeElement === null) {
      console.warn('LEEWGL.UI: No active element selected!');
      return;
    }

    this.clipBoard = this.activeElement.clone();
    this.removeObjFromOutline(this.activeIndex);
    this.scene.remove(this.activeElement);
    this.activeElement = null;

    this.statusBarToHTML();
  };
  /**
   * Pastes cut / copied object into scene
   */
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
  /**
   * Pastes cut / copied object into selected object
   */
  this.pasteObjectInto = function() {
    if (this.clipBoard === null) {
      console.warn('LEEWGL.UI: No element in clipboard!');
      return;
    }

    this.activeOutline.obj.add(this.clipBoard);
    this.addObjToOutline(this.clipBoard);

    this.clipBoard = null;
    this.statusBarToHTML();
  };
  /**
   * Adds a new custom script component to active object
   */
  this.addCustomScriptComponent = function() {
    this.activeElement.addComponent(new LEEWGL.Component.CustomScript());
    this.setInspectorElement(this.activeIndex);
  };

  /**
   * Insert predefined objectes
   */

  /**
   * Creates and inserts a new LEEWGL.Geometry3D.Triangle
   */
  this.insertTriangle = function() {
    var triangle = new LEEWGL.Geometry3D.Triangle();
    triangle.setBuffer(this.gl);
    triangle.setColor(this.gl, ColorHelper.getUniqueColor());
    this.scene.add(triangle);
    this.addObjToOutline(triangle);
  };
  /**
   * Creates and inserts a new LEEWGL.Geometry3D.Cube
   */
  this.insertCube = function() {
    var cube = new LEEWGL.Geometry3D.Cube();
    cube.setBuffer(this.gl);
    cube.setColor(this.gl, ColorHelper.getUniqueColor());
    this.scene.add(cube);
    this.addObjToOutline(cube);
  };
  /**
   * Creates and inserts a new LEEWGL.Geometry3D.Sphere
   */
  this.insertSphere = function() {
    var sphere = new LEEWGL.Geometry3D.Sphere();
    sphere.setBuffer(this.gl);
    sphere.setColor(this.gl, ColorHelper.getUniqueColor());

    this.displayInsertPrompt(sphere);
    //
    // this.scene.add(sphere);
    // this.addObjToOutline(sphere);
  };

  /**
   * Inserts a light with given options
   * @param  {string} options.type - can be Directional, Point or Spot
   */
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

    this.scene.add(light);
    this.addObjToOutline(light);
  };
  /**
   * Inserts a camera with given options
   * @param  {string} options.type - can be Perspective or Orthogonal
   */
  this.insertCamera = function(options) {
    if (typeof options === 'undefined') {
      console.error('LEEWGL.UI.insertCamera: No options param given!');
      return false;
    }
    var camera = null;
    if (options.type === 'Perspective')
      camera = new LEEWGL.Camera.PerspectiveCamera();
    else
      camera = new LEEWGL.Camera.OrthogonalCamera();

    this.scene.add(camera);
    this.addObjToOutline(camera);
  };
  /**
   * Shows this.popup with a form to edit values and components of given obj
   * @param  {LEEWGL.GameObject} obj
   */
  this.displayInsertPrompt = function(obj) {
    var that = this;
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': 450,
      'wrapper-height': 'auto',
      'title-fontsize': 19
    });

    this.popup.addTitleText('Insert ' + obj.type);

    var content = new LEEWGL.DOM.Element('div', {
      'styles': {
        'width': '290px',
        'margin': '0 auto'
      }
    });
    content.grab(this.componentsToHTML(obj));
    content.grab(this.valuesToHTML(obj));

    /// TODO: inject to div container
    var insertButton = new LEEWGL.DOM.Element('input', {
      'type': 'submit',
      'class': 'submit',
      'value': 'Insert'
    });

    insertButton.addEvent('click', function(e) {
      that.scene.add(obj);
      that.addObjToOutline(obj);
      that.setInspectorElement(obj.id);
      that.popup.hide();
    });

    content.grab(insertButton);

    this.popup.addCustomElementToContent(content);

    this.popup.setDimensions();
    this.popup.center();
    this.popup.show();
    this.editableDOM();
  };
  /**
   * Shows this.popup with a form to import a custom script
   */
  this.displayImportScript = function() {
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': 500,
      'wrapper-height': 'auto',
    });

    this.popup.addTitleText('Import Script');
    this.popup.addHTMLFile('html/import_script.html');
    this.popup.setDimensions();
    this.popup.center();
    this.popup.show();
  };
  this.importScriptFromSource = function(textarea) {
    this.addScriptToDOM(this.importedScripts, textarea.value);
    this.importedScripts++;
  };

  this.displayImportModel = function() {
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': 350,
      'wrapper-height': 'auto',
      'title-fontsize': 23
    });

    this.popup.addTitleText('Import Model');
    this.popup.addHTMLFile('html/import_model.html');
    this.popup.setDimensions();
    this.popup.center();
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

  this.displayAbout = function(displayInSidebar) {
    displayInSidebar = (typeof displayInSidebar !== 'undefined') ? displayInSidebar : false;

    if (displayInSidebar === false) {
      this.setPopupHTML('About LEEWGL', 'html/about.html');
    } else {
      this.setSidebarHTML('About LEEWGL', 'html/about.html');
    }
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

    this.setInspectorElement(this.activeIndex);
  };

  this.displayExport = function() {
    this.popup.empty();
    this.popup.setOptions({
      'wrapper-width': 500,
      'title-fontsize': 23
    });

    this.setPopupHTML('Export', 'html/export.html');
    this.popup.setDimensions();
    this.popup.center();

    var textarea_vertex_shaders = new LEEWGL.DOM.Element(document.getElementById('export-vertex-shaders'));
    var textarea_fragment_shaders = new LEEWGL.DOM.Element(document.getElementById('export-fragment-shaders'));
    textarea_vertex_shaders.set('html', this.scene.activeShader.code.vertex);
    textarea_fragment_shaders.set('html', this.scene.activeShader.code.fragment);

    var textarea_export = new LEEWGL.DOM.Element(document.getElementById('export'));

    /*jshint multistr: true */
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

  this.export = function() {
    this.ajax.send('POST', LEEWGL.ROOT + 'php/write_to_file.php', false, "code=" + encodeURIComponent(this.scene.export()));
  };

  this.preventRefresh = function() {
    window.onkeydown = function(event) {
      if ((event.keyCode || event.which) === LEEWGL.KEYS.F5) {
        event.preventDefault();
      }
    };
  };

  this.statusBarToHTML = function() {
    this.statusBar.empty();
    if (this.statusBar !== null) {
      var clipBoardContent = new LEEWGL.DOM.Element('div', {
        'class': 'fright mright10'
      });
      this.statusBar.grab(clipBoardContent);
      var helpContent = new LEEWGL.DOM.Element('div', {
        'class': 'mright10'
      });
      this.statusBar.grab(helpContent);

      if (this.transformationMode === 'translation')
        helpContent.set('html', '<strong>[CTRL]</strong> - Move element in Z-axis <strong>[ALT]</strong> - Move element in local space');
      else if (this.transformationMode === 'scale')
        helpContent.set('html', '<strong>[CTRL]</strong> - Scale element in X-axis <strong>[ALT]</strong> - Scale element in Z-axis');
      else if (this.transformationMode === 'rotation')
        helpContent.set('html', '<strong>[CTRL]</strong> - Rotate element in X-axis <strong>[ALT]</strong> - Rotate element in Z-axis');

      if (this.clipBoard !== null) {
        clipBoardContent.set('html', '1 Element selected');
      } else
        clipBoardContent.set('html', 'Nothing selected');
    }
  };
};

/**
 * Basic class which provides needed functions for more complex dynamic container classes
 * @constructor
 * @param {string} options.wrapper-class
 * @param {string} options.title-class
 * @param {number} options.title-fontsize
 * @param {string} options.content-class
 * @param {number|string} options.wrapper-width - can be '250px' | 250 or 'fit' to fit to content
 * @param {number} options.wrapper-padding - only gets used if wrapper-width is set to 'fit'
 * @param {number|string} options.wrapper-height - can be '250px' | 250 or 'fit' to fit to content
 * @param {number} options.wrapper-height-padding - only gets used if wrapper-height is set to 'fit'
 * @param {DOMElement} options.parent
 * @param {number} options.position.x
 * @param {number} options.position.y
 * @param {bool} options.hidden
 * @param {bool} options.title-enabled
 */
LEEWGL.UI.BasicPopup = function(options) {
  this.options = {
    'wrapper-class': 'popup',
    'title-class': 'popup-title',
    'title-fontsize': 23,
    'content-class': 'popup-content',
    'wrapper-width': 350,
    'wrapper-width-padding': 0,
    'wrapper-height': 'auto',
    'wrapper-height-padding': 0,
    'parent': document.body,
    'position': {
      'x': 0,
      'y': 0
    },
    'hidden': true,
    'title-enabled': true
  };

  extend(LEEWGL.UI.BasicPopup.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  /** @inner {object} */
  this.pos = this.options.position;
  /** @inner {LEEWGL.DOM.Element} */
  this.parent = new LEEWGL.DOM.Element(this.options.parent);

  /** @inner {LEEWGL.DOM.Element} */
  this.wrapper = undefined;
  /** @inner {LEEWGL.DOM.Element} */
  this.title = undefined;
  /** @inner {LEEWGL.DOM.Element} */
  this.content = undefined;

  /** @inner {bool} */
  this.initialized = false;
  /** @inner {bool} */
  this.isDisplayed = false;

  /** @inner {LEEWGL.AsynchRequest} */
  this.ajax = new LEEWGL.AsynchRequest();
};

LEEWGL.UI.BasicPopup.prototype = {
  constructor: LEEWGL.UI.BasicPopup,
  /**
   * Creates the various popup DOM elements and calls extra functions depending on this.options
   */
  create: function() {
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

    this.initialized = true;

    if (this.options['hidden'] === true)
      this.hide();

    this.setDimensions();
  },
  /**
   * Sets width and height of the container as given in options and positions the popup
   */
  setDimensions: function() {
    var size = this.getSize();
    if (this.options['wrapper-width'] === 'fit')
      this.wrapper.setStyle('width', size.width + this.options['wrapper-width-padding'] + 'px');
    else
      this.wrapper.setStyle('width', (typeof this.options['wrapper-width'] === 'number') ? this.options['wrapper-width'] + 'px' : this.options['wrapper-width']);
    if (this.options['wrapper-height'] === 'fit')
      this.wrapper.setStyle('height', size.height + this.options['wrapper-height-padding'] + 'px');
    else
      this.wrapper.setStyle('height', (typeof this.options['wrapper-height'] === 'number') ? this.options['wrapper-height'] + 'px' : this.options['wrapper-height']);
  },
  /**
   * Sets top and left style of this.wrapper
   * @param {number} pos.x
   * @param {number} pos.y
   */
  setPosition: function(pos) {
    pos = (typeof pos !== 'undefined') ? pos : this.pos;
    this.pos = pos;
    this.wrapper.setStyles({
      'top': this.pos.y + 'px',
      'left': this.pos.x + 'px',
      'position': 'absolute'
    });
  },
  /**
   * Set style of this.wrapper
   */
  setStyle: function(styles) {
    this.wrapper.setStyles(styles);
  },
  /**
   * Sets this.options.center to true and positions the popup
   */
  center: function() {
    this.centerX();
    this.centerY();
  },
  /**
   * Centers this.wrapper on x axis
   */
  centerX: function() {
    var size = this.getSize();
    var parentSize = this.parent.size();
    var parentScroll = this.parent.getScroll();
    this.pos.x = ((parentSize['display-width'] / 2) - (size['display-width'] / 2) + parentScroll.x);
    this.setPosition();
  },
  /**
   * Centers this.wrapper on y axis
   */
  centerY: function() {
    var size = this.getSize();
    var parentSize = this.parent.size();
    var parentScroll = this.parent.getScroll();
    this.pos.y = ((parentSize['display-height'] / 2) - (size['display-height'] / 2) + parentScroll.y);
    this.setPosition();
  },
  /**
   * Gets size of this.wrapper
   * @return {object}
   */
  getSize: function() {
    var size = this.wrapper.size(this.isDisplayed, this.parent);
    return size;
  },
  /**
   * Adds text to content
   * @param {string} text
   */
  addText: function(text) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.BasicPopup: call create() first!');
      return;
    }
    var content = new LEEWGL.DOM.Element('p', {
      'text': text
    });
    this.content.grab(content);
  },
  /**
   * @param {DOMElement} element
   */
  addCustomElementToTitle: function(element) {
    this.title.grab(element);
  },
  /**
   * @param {DOMElement} element
   */
  addCustomElementToContent: function(element) {
    this.content.grab(element);
  },
  /**
   * @param {string} text
   */
  addTitleText: function(text) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.BasicPopup: call create() first!');
      return;
    }
    var header = new LEEWGL.DOM.Element('h1', {
      'text': text,
      'styles': {
        'font-size': this.options['title-fontsize'] + 'px'
      }
    });
    this.title.grab(header);
  },
  /**
   * @param {string} html
   */
  addHTML: function(html) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.BasicPopup: call create() first!');
      return;
    }
    this.content.appendHTML(html);
  },
  /**
   * @param {string} path
   */
  addHTMLFile: function(path) {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.BasicPopup: call create() first!');
      return;
    }
    this.content.set('html', this.ajax.send('GET', LEEWGL.ROOT + path, false, null).response.responseText);
  },
  /**
   * Sets this.wrapper style display to block
   */
  show: function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.BasicPopup: call create() first!');
      return;
    }

    this.wrapper.setStyle('display', 'block');
    this.isDisplayed = true;
  },
  /**
   * Sets this.wrapper style display to none
   */
  hide: function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.BasicPopup: call create() first!');
      return;
    }

    this.wrapper.setStyle('display', 'none');
    this.isDisplayed = false;
  },
  /**
   * Resets the popup
   * Sets this.title.innerHTML and this.content.innerHTML to ''
   */
  empty: function() {
    if (this.initialized === false) {
      console.error('LEEWGL.UI.BasicPopup: call create() first!');
      return;
    }

    if (this.options['title-enabled'] === true)
      this.title.set('html', '');

    this.content.set('html', '');
  }
};

/**
 * Popup with extended features such as Drag'n'Drop of popup container, close button,
 * an overlay container and buttons
 * @constructor
 * @augments LEEWGL.UI.BasicPopup
 * @param {bool} options.overlay-enabled
 * @param {string} options.overlay-class
 * @param {string} options.list-item-class
 * @param {bool} options.close-icon-enabled
 * @param {bool} options.close-button-enabled
 * @param {bool} options.movable
 */
LEEWGL.UI.Popup = function(options) {
  LEEWGL.UI.BasicPopup.call(this, options);

  var ext_options = {
    'overlay-enabled': false,
    'overlay-class': 'popup-overlay',
    'list-item-class': 'popup-list',
    'close-icon-enabled': true,
    'close-button-enabled': false,
    'movable': true,
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  /** @inner {LEEWGL.DOM.Element} */
  this.overlay = undefined;
  /** @inner {array} */
  this.listItems = [];
};

LEEWGL.UI.Popup.prototype = Object.create(LEEWGL.UI.BasicPopup.prototype);

/**
 * Creates the various popup DOM elements and calls extra functions depending on this.options
 */
LEEWGL.UI.Popup.prototype.create = function() {
  LEEWGL.UI.BasicPopup.prototype.create.call(this);

  if (this.options['overlay-enabled'] === true) {
    this.overlay = new LEEWGL.DOM.Element('div', {
      'class': this.options['overlay-class']
    });
    this.parent.grab(this.overlay);
  }

  if (this.options['close-icon-enabled'] === true && this.options['title-enabled'] === true)
    this.addCloseIcon();

  if (this.options['close-button-enabled'] === true)
    this.addCloseButton();

  if (this.options['movable'] === true && this.options['title-enabled'] === true) {
    this.drag = new LEEWGL.DragDrop();
    this.movable();
  }
};

/**
 * Add a list each list item representing an index of the content array
 * A custom callback function when clicking on a list-item can be given
 * @param {array} content
 * @param {function} evFunction - optional
 */
LEEWGL.UI.Popup.prototype.addList = function(content, evFunction) {
  evFunction = (typeof evFunction !== 'undefined') ? evFunction : function() {};

  var list = new LEEWGL.DOM.Element('ul', {
    'class': 'popup-list'
  });
  this.listItems = [];

  var clickEvent = function(item, index) {
    item.addEvent('click', function(event) {
      evFunction(content[index]);
    });
  };

  for (var i = 0; i < content.length; ++i) {
    var item = new LEEWGL.DOM.Element('li', {
      'class': this.options['list-item-class'] + ' pointer',
      'html': content[i]
    });
    this.listItems.push(item);

    if (typeof evFunction === 'function') {
      clickEvent(item, i);
    }
    list.grab(item);
  }

  this.content.grab(list);
};

/**
 * Adds a close icon to the title with a callback on click to hide the popup
 */
LEEWGL.UI.Popup.prototype.addCloseIcon = function() {
  if (this.initialized === false) {
    console.error('LEEWGL.UI.Popup: call create() first!');
    return;
  }

  var iconContainer = new LEEWGL.DOM.Element('div', {
    'class': 'icon-container fright'
  });
  var clearer = new LEEWGL.DOM.Element('div', {
    'class': 'clearer'
  });

  var closeIcon = new LEEWGL.DOM.Element('a', {
    'title': 'Close Popup',
    'class': 'closeable bg-pos56 pointer'
  });

  iconContainer.grab(closeIcon);
  iconContainer.grab(clearer);

  closeIcon.addEvent('click', function(event) {
    this.hide();
  }.bind(this));

  this.title.grab(iconContainer);
};

/**
 * Adds a button with an user-definable callback on click to the content
 * @param {string}   value
 * @param {function} callback
 */
LEEWGL.UI.Popup.prototype.addButton = function(value, callback) {
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
 * Adds a button with attached event to close the popup on click to the content
 */
LEEWGL.UI.Popup.prototype.addCloseButton = function() {
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
 * Adds a movable-icon to the title with attached event to move the container around
 * Double click on the moveable-icon resets the container
 */
LEEWGL.UI.Popup.prototype.movable = function() {
  if (this.initialized === false) {
    console.error('LEEWGL.UI.Popup: call create() first!');
    return;
  }

  var that = this;

  var iconContainer = new LEEWGL.DOM.Element('div', {
    'class': 'icon-container fleft'
  });
  var clearer = new LEEWGL.DOM.Element('div', {
    'class': 'clearer'
  });

  var moveIcon = new LEEWGL.DOM.Element('a', {
    'title': 'Move Popup',
    'class': 'move-icon bg-pos57 pointer'
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
 * Displays overlay div container
 */
LEEWGL.UI.Popup.prototype.showOverlay = function() {
  if (this.options['overlay-enabled'] === true)
    this.overlay.setStyle('display', 'fixed');
};

/**
 * Calls LEEWGL.UI.BasicPopup.show and LEEWGL.UI.Popuo.showOverlay
 */
LEEWGL.UI.Popup.prototype.show = function() {
  LEEWGL.UI.BasicPopup.prototype.show.call(this);
  this.showOverlay();
};

/**
 * Hides the overlay div container
 */
LEEWGL.UI.Popup.prototype.hideOverlay = function() {
  if (this.options['overlay-enabled'] === true)
    this.overlay.setStyle('display', 'none');
};

/**
 * Calls LEEWGL.UI.BasicPopup.hide and LEEWGL.UI.Popuo.hideOverlay
 */
LEEWGL.UI.Popup.prototype.hide = function() {
  LEEWGL.UI.BasicPopup.prototype.hide.call(this);
  this.hideOverlay();
};

/**
 * Calls LEEWGL.UI.BasicPopup.empty and recreates the close-icon, close-button and moveable-icon if set in the options
 */
LEEWGL.UI.Popup.prototype.empty = function() {
  LEEWGL.UI.BasicPopup.prototype.empty.call(this);

  if (this.options['close-icon-enabled'] === true)
    this.addCloseIcon();

  if (this.options['close-button-enabled'] === true)
    this.addCloseButton();

  if (this.options['movable'] === true)
    this.movable();
};

/**
 * @constructor
 * @augments LEEWGL.UI.BasicPopup
 * @param {bool} options.toggle-button-enabled
 * @param {bool} options.animated - if set to true the sidebar moves in / out when shown / hidden
 */
LEEWGL.UI.Sidebar = function(options) {
  LEEWGL.UI.BasicPopup.call(this, options);

  this.options['wrapper-class'] = 'sidebar';
  this.options['title-class'] = 'sidebar-title';
  this.options['content-class'] = 'sidebar-content';
  this.options['hidden'] = false;

  var ext_options = {
    'toggle-button-enabled': true,
    'animated': true
  };

  this.addOptions(ext_options);
  this.setOptions(options);
};

LEEWGL.UI.Sidebar.prototype = Object.create(LEEWGL.UI.BasicPopup.prototype);

/**
 * Creates the various popup DOM elements and calls extra functions depending on this.options
 */
LEEWGL.UI.Sidebar.prototype.create = function() {
  LEEWGL.UI.BasicPopup.prototype.create.call(this);

  if (this.options['toggle-button-enabled'] === true)
    this.addToggleButton();

  if (this.options.animated === true)
    this.animator = new LEEWGL.DOM.Animator();
};

LEEWGL.UI.Sidebar.prototype.addToggleButton = function() {
  if (this.initialized === false) {
    console.error('LEEWGL.UI.Popup: call create() first!');
    return;
  }

  var that = this;
  var size = this.getSize();

  this.toggleIconContainer = new LEEWGL.DOM.Element('div', {
    'class': 'icon-container fright',
    'styles': {
      'left': this.options['wrapper-width'] + 'px',
      'position': 'absolute'
    }
  });
  var clearer = new LEEWGL.DOM.Element('div', {
    'class': 'clearer'
  });
  this.toggleIcon = new LEEWGL.DOM.Element('a', {
    'title': 'Toggle Sidebar',
    'class': 'toggle-right bg-pos108 pointer',
  });

  this.toggleIconContainer.grab(this.toggleIcon);
  this.toggleIconContainer.grab(clearer);

  this.toggleIcon.addEvent('mousedown', function(event) {
    if (event.which === 1 || event.button === LEEWGL.MOUSE.LEFT)
      that.toggle();
  });

  this.wrapper.grab(this.toggleIconContainer, 'top');
};

/**
 * Toggle visibility of sidebar
 */
LEEWGL.UI.Sidebar.prototype.toggle = function() {
  if (this.isDisplayed === true)
    this.hide();
  else
    this.show();
};

/**
 * Displays the sidebar
 */
LEEWGL.UI.Sidebar.prototype.show = function() {
  if (this.isDisplayed !== false)
    return;

  var that = this;

  if (this.options['toggle-button-enabled'] === true) {
    this.toggleIconContainer.setStyles({
      'left': '0px',
      'position': 'relative'
    });
    this.toggleIcon.set('class', 'toggle-left bg-pos88 pointer');
  }

  if (this.pos.x < 0) {
    if (this.options.animated === true) {
      if (this.animator.isRunning(this.wrapper) === false) {
        this.animator.animate(this.wrapper, {
          'left': 0
        }, 0.5, undefined, 100);
        that.isDisplayed = true;
      }
    } else {
      this.wrapper.setStyle('left', '0px');
      this.toggleIconContainer.setStyles({
        'left': '0px',
        'position': 'relative'
      });
      this.isDisplayed = true;
    }
  }
};

/**
 * Hides the sidebar
 */
LEEWGL.UI.Sidebar.prototype.hide = function() {
  if (this.isDisplayed !== true)
    return;

  var that = this;
  var size = this.getSize();

  if (this.options['toggle-button-enabled'] === true) {
    this.toggleIconContainer.setStyles({
      'left': size.width + 'px',
      'position': 'absolute'
    });
    this.toggleIcon.set('class', 'toggle-right bg-pos108 pointer');
  }

  if (this.options.animated === true) {
    if (this.animator.isRunning(this.wrapper) === false) {
      this.animator.animate(this.wrapper, {
        'left': -size.width,
      }, 0.5, function() {
        that.isDisplayed = false;
      }, 100);
    }
  } else {
    this.wrapper.setStyle('left', -size.width);
    this.isDisplayed = false;
  }
};
/** @constant {string} */
LEEWGL.UI.STATIC = 'static';
/** @constant {string} */
LEEWGL.UI.ABSOLUTE = 'absolute';
/** @constant {string} */
LEEWGL.UI.FIXED = 'fixed';

/**
 * window load event to set global
 */
var init = function() {
  var ui = new LEEWGL.UI();
  /** @global */
  window.UI = ui;
};

addEventToWindow('onload', init);
