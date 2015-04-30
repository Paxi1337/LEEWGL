/**
 * [UI description]
 * @param {object} options
 */
LEEWGL.UI = function(options) {
    this.inspector = undefined;
    this.statusBar = undefined;

    this.outline = {};

    this.update = false;

    this.activeElement = undefined;
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
        if(this.settingsDisplayed === true) {

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

            this.update = true;
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

        this.update = true;
    };

    this.removeObjFromOutline = function(index) {
        delete this.outline[index];
        this.update = true;
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
                    that.update = true;
                }
            };

            keydownFunction = function(element) {
                that.activeElement.name = element.get('text');
                that.setEditable(-1);
                that.update = true;
                that.setInspectorContent(index);
            };

            clickFunction = function() {
                var activeOutline = that.outline[index];
                if (activeOutline.active === false && activeOutline.editable === false) {
                    that.setActive(index);
                    that.setEditable(-1);
                    that.update = true;
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

            keydownFunction = function(element) {
                if (element.get('contenteditable') !== null)
                    element.removeAttributes(['contenteditable', 'class']);
            };

            clickFunction = function() {};
        }

        obj.addEvent('dblclick', function(event) {
            dblclickFunction(new LEEWGL.DOM.Element(this));
        });

        obj.addEvent('keydown', function(event) {
            if (event.keyCode === LEEWGL.KEYS.ENTER) {
                keydownFunction(new LEEWGL.DOM.Element(this));
                event.preventDefault();
                event.stopPropagation();
            }
        });

        obj.addEvent('click', function(event) {
            clickFunction();
        });
    };

    this.outlineToHTML = function(container) {
        if (this.update === false)
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
                        that.update = true;
                        that.setInspectorContent(index);
                    }

                    that.displayOutlineContextMenu(index, event);
                });
            })(i);
        }

        container.grab(list);
        this.update = false;
    };
    /**
     * [createTable description]
     * @param {array} header
     * @param {array} content
     * @param {object} title
     */
    this.createTable = function(header, content, title) {
        var container = new LEEWGL.DOM.Element('div', {
            'class': 'component-detail-container'
        });
        var table = new LEEWGL.DOM.Element('table', {
            'class': 'component-table'
        });
        var thead = new LEEWGL.DOM.Element('thead');
        var tbody = new LEEWGL.DOM.Element('tbody');
        var tr;
        var td;

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
        for (var i = 0; i < header.length; ++i) {
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

            var c = content[index];

            that.editable(td, index, true);

            if (typeof c === 'undefined') {
                var keys = Object.keys(content);
                c = content[keys[index]];
            }

            if (typeof c === 'number')
                td.set('html', c.toPrecision(LEEWGL.Settings.DisplayPrecision));
            else
                td.set('html', c);

            // / html5 feature - gets called when dom elements with contenteditable = true get edited
            td.addEvent('keydown', function(event) {
                if (event.keyCode === LEEWGL.KEYS.ENTER) {
                    var el = new LEEWGL.DOM.Element(this);
                    var num = el.get('num');
                    if (typeof content[num] === 'undefined') {
                        var keys = Object.keys(content);
                        content[keys[index]] = parseFloat(el.get('text'));
                    } else {
                        content[num] = parseFloat(el.get('text'));
                    }

                    var trans = that.activeElement.transform.transVec;
                    var rot = that.activeElement.transform.rotVec;
                    var scale = that.activeElement.transform.scaleVec;

                    that.activeElement.transform.dispatchEvent({
                        'type': 'update-all',
                        'data': {
                            'translation': trans,
                            'rotation': rot,
                            'scale': scale
                        }
                    });

                    that.update = true;
                    that.setInspectorContent(that.activeIndex);

                    event.preventDefault();
                    event.stopPropagation();
                }
            });

            return td;
        };

        tr = new LEEWGL.DOM.Element('tr');
        // / content
        if (typeof content.length === 'undefined') {
            var i = 0;
            for (var k in content) {
                td = fillTable(i, content);

                tr.grab(td);
                tbody.grab(tr);
                ++i;
            }
        } else {
            for (var i = 0; i < content.length; ++i) {
                td = fillTable(i, content);

                tr.grab(td);
                tbody.grab(tr);
            }
        }

        table.grab(tbody);
        container.grab(table);

        return container;
    };

    this.componentsToHTML = function(activeElement) {
        var container;
        var title;

        var that = this;
        // window.removeEventListener('value-edit');

        for (var name in activeElement.components) {
            if (!activeElement.components.hasOwnProperty(name))
                continue;

            container = new LEEWGL.DOM.Element('div', {
                'class': 'component-container'
            });
            title = new LEEWGL.DOM.Element('h3', {
                'class': 'component-headline',
                'html': name
            });
            container.grab(title);

            var comp = activeElement.components[name];

            if (comp instanceof LEEWGL.Component.Transform) {
                // / position
                container.grab(this.createTable(['x', 'y', 'z'], comp.position, {
                    'title': 'Position',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));
                // / translation
                container.grab(this.createTable(['x', 'y', 'z'], comp.transVec, {
                    'title': 'Translation',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));

                // / rotation
                container.grab(this.createTable(['x', 'y', 'z'], comp.rotVec, {
                    'title': 'Rotation',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));
                // / scale
                container.grab(this.createTable(['x', 'y', 'z'], comp.scaleVec, {
                    'title': 'Scale',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));

            } else if (comp instanceof LEEWGL.Component.CustomScript) {
                container.set('id', 'custom-script-component-container');

                var textfield = new LEEWGL.DOM.Element('textarea', {
                    'rows': 5,
                    'cols': 30,
                    'placeholder': comp.code
                });

                if (typeof this.saved['custom-object-script-' + activeElement.id] !== 'undefined')
                    textfield.set('value', this.saved['custom-object-script-' + activeElement.id]);

                textfield.addEvent('keyup', function(event) {
                    if (event.keyCode === LEEWGL.KEYS.ENTER) {
                        that.addScriptToObject(activeElement.id, this.value);
                        event.stopPropagation();
                    }
                });

                container.grab(textfield);
            } else if (comp instanceof LEEWGL.Component.Texture) {
                container.set('id', 'texture-component-container');

                var fileName = new LEEWGL.DOM.Element('h4', {
                    'class': 'component-sub-headline'
                });
                var fileInput = new LEEWGL.DOM.Element('input', {
                    'type': 'file'
                });
                var imageContainer = new LEEWGL.DOM.Element('div', {
                    'id': 'texture-preview-container'
                });
                var image = new LEEWGL.DOM.Element('img');
                imageContainer.grab(image);

                if (typeof this.saved['object-' + this.activeIndex + '-texture-path'] !== 'undefined') {
                    image.set('src', this.saved['object-' + this.activeIndex + '-texture-path']);
                    fileInput.set('value', this.saved['object-' + this.activeIndex + '-texture-path']);
                    fileName.set('text', this.saved['object-' + this.activeIndex + '-texture-path']);
                } else {
                    fileName.set('text', 'No Texture');
                }

                fileInput.addEvent('change', function(event) {
                    var name = this.value.substr(this.value.lastIndexOf('\\') + 1, this.value.length);
                    var path = LEEWGL.ROOT + 'texture/';
                    comp.init(that.gl, path + name);
                    that.activeElement.setTexture(comp.texture);

                    that.saved['object-' + that.activeIndex + '-texture-path'] = path + name;
                    fileName.set('text', path + name);

                    image.set('src', path + name);
                });

                container.grab(fileName);
                container.grab(fileInput);
                container.grab(imageContainer);
            }

            this.inspector.grab(container);
        }
    };

    this.valuesToHTML = function(activeElement) {
        var container;
        var title;

        var that = this;

        if (activeElement instanceof LEEWGL.Light) {
            container = new LEEWGL.DOM.Element('div', {
                'class': 'component-container'
            });
            title = new LEEWGL.DOM.Element('h3', {
                'class': 'component-headline1',
                'html': 'Values'
            });
            container.grab(title);

            for (var i = 0; i < activeElement.editables.length; ++i) {
                var editable = activeElement.editables[i];

                if (editable.value instanceof Array) {
                    container.grab(this.createTable(editable['table-titles'], editable.value, {
                        'title': editable.name,
                        'type': 'h4',
                        'class': 'component-detail-headline'
                    }));
                } else {
                    this.createContainerDetailInput(container, editable.name, editable.value);
                }
            }
            this.inspector.grab(container);
        }
    };

    this.createContainerDetailInput = function(container, title, value) {
        var containerDetail = new LEEWGL.DOM.Element('div', {
            'class': 'component-detail-container'
        });
        var name = new LEEWGL.DOM.Element('h4', {
            'class': 'component-detail-headline',
            'text': title
        });
        var input = new LEEWGL.DOM.Element('input', {
            'type': 'text',
            'class': 'settings-input',
            'value': value
        });

        containerDetail.grab(name);
        containerDetail.grab(input);
        container.grab(containerDetail);
    };

    this.setInspectorContent = function(index) {
        if (typeof this.inspector === 'undefined') {
            console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
            return;
        }

        this.settingsDisplayed = false;

        this.inspector.set('html', '');

        this.activeIndex = index;
        this.setActive(index);

        if (index === -1) {
            this.activeElement = null;
            window.activeElement = this.activeElement;
            this.update = true;
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
        this.update = true;
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

        for (var k in LEEWGL.Settings) {
            if (typeof LEEWGL.Settings[k] === 'object') {
                container.grab(this.createTable(Object.keys(LEEWGL.Settings[k]), LEEWGL.Settings[k], {
                    'title': k,
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));
            } else {
                this.createContainerDetailInput(container, k, LEEWGL.Settings[k]);
            }
        }

        var submit = new LEEWGL.DOM.Element('input', {
            'type': 'submit',
            'class': 'submit',
            'value': 'Update Settings'
        });

        submit.addEvent('click', function(event) {
            this.updateSettings();
            event.preventDefault();
        }.bind(this));

        container.grab(submit);
        this.inspector.grab(container);
    };

    this.updateSettings = function() {

    };

    /// object methods
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
    this.pos = {
        'x': 0,
        'y': 0
    };

    this.parent = new LEEWGL.DOM.Element(document.body);

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

    this.wrapper = undefined;
    this.title = undefined;
    this.content = undefined;
    this.overlay = undefined;

    this.listItems = [];

    this.initialized = false;
    this.isDisplayed = false;

    this.drag = new LEEWGL.DragDrop();
    this.ajax = new LEEWGL.AsynchRequest();

    /**
     * [setOptions description]
     * @param {Array} options
     */
    this.setOptions = function(options) {
        if (typeof options !== 'undefined') {
            for (var attribute in this.options) {
                if (options.hasOwnProperty(attribute))
                    this.options[attribute] = options[attribute];
            }
        }
    };

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
