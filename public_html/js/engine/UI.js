/**
 * [UI description]
 * @param {object} options
 */
LEEWGL.UI = function(options) {
    this.inspector;
    this.statusBar;

    this.outline = {};

    this.update = false;

    this.activeElement = undefined;
    this.storage = new LEEWGL.LocalStorage();
    this.playing = undefined;

    this.gl = undefined;
    this.scene = undefined;

    this.activeIndex = undefined;

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

    this.confirmationPopup = new LEEWGL.UI.Popup({
        'movable': false,
        'close-icon-enabled': false,
        'close-button-enabled': true,
        'wrapper-width': 200,
        'title-enabled': true
    });
    this.confirmationPopup.create();

    this.importedScripts = [];
    this.objectScripts = [];

    this.clipBoard = null;

    this.saved = {};

    this.importer = new LEEWGL.Importer();

    this.setGL = function(gl) {
        this.gl = gl;
    };

    this.setScene = function(scene) {
        this.scene = scene;
    };

    this.setInspector = function(container) {
        this.inspector = (typeof container === 'string') ? document.querySelector(container) : container;
    };

    this.setStatusBar = function(container) {
        this.statusBar = (typeof container === 'string') ? document.querySelector(container) : container;
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
                that.activeElement.name = element.innerText;
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
                if (element.getAttribute('contenteditable') === null) {
                    element.setAttribute('contenteditable', true);
                    element.setAttribute('class', 'editable');
                }
            };

            keydownFunction = function(element) {
                if (element.getAttribute('contenteditable') !== null) {
                    element.removeAttribute('contenteditable');
                    element.removeAttribute('class');
                }
            };

            clickFunction = function() {};
        }

        obj.addEventListener('dblclick', function(event) {
            dblclickFunction(this);
        });

        obj.addEventListener('keydown', function(event) {
            if (event.keyCode === LEEWGL.KEYS.ENTER) {
                keydownFunction(this);
                event.preventDefault();
                event.stopPropagation();
            }
        });

        obj.addEventListener('click', function(event) {
            clickFunction();
        });
    };

    this.outlineToHTML = function(container) {
        if (this.update === false)
            return;

        container = (typeof container === 'string') ? document.querySelector(container) : container;

        var that = this;

        container.innerHTML = '';

        var list = document.createElement('ul');

        for (var i in this.outline) {
            var outline = this.outline[i];

            var obj = outline.obj;
            var item = document.createElement('li');
            var element = document.createElement('a');
            element.setAttribute('href', '#');

            element.innerHTML = obj.name;

            item.appendChild(element);
            list.appendChild(item);

            if (outline.active === true)
                item.setAttribute('class', 'active');

            if (outline.editable === true) {
                item.setAttribute('class', 'editable');
                element.setAttribute('contenteditable', true);
            }

            /// events
            this.editable(element, i);

            (function(index) {
                element.addEventListener('contextmenu', function(event) {
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

        container.appendChild(list);

        this.update = false;
    };
    /**
     * [createTable description]
     * @param {array} header
     * @param {array} content
     * @param {object} title
     */
    this.createTable = function(header, content, title) {
        var container = document.createElement('div');
        var table = document.createElement('table');
        table.setAttribute('class', 'component-table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');
        var tr;
        var td;

        var that = this;

        container.setAttribute('class', 'component-detail-container');

        if (typeof title !== 'undefined') {
            var headlineContainer = document.createElement('div');
            var headline = document.createElement(title.type);
            headline.setAttribute('class', title.class);
            headline.innerHTML = title.title;
            headlineContainer.appendChild(headline);
            container.appendChild(headlineContainer);
        }

        tr = document.createElement('tr');
        // / headers
        for (var i = 0; i < header.length; ++i) {
            td = document.createElement('th');
            td.innerHTML = header[i];

            tr.appendChild(td);
            thead.appendChild(tr);
        }

        table.appendChild(thead);

        var fillTable = function(index, content) {
            var td = document.createElement('td');
            td.setAttribute('num', index);

            var c = content[index];

            that.editable(td, index, true);

            if (typeof c === 'undefined') {
                var keys = Object.keys(content);
                c = content[keys[index]];
            }

            if (typeof c === 'number')
                td.innerHTML = c.toPrecision(LEEWGL.Settings.DisplayPrecision);
            else
                td.innerHTML = c;

            // / html5 feature - gets called when dom elements with contenteditable = true get edited
            td.addEventListener('keydown', function(event) {


                if (event.keyCode === LEEWGL.KEYS.ENTER) {
                    var num = this.getAttribute('num');
                    if (typeof content[num] === 'undefined') {
                        var keys = Object.keys(content);
                        content[keys[index]] = parseFloat(this.innerText);
                    } else {
                        content[num] = parseFloat(this.innerText);
                    }

                    window.dispatchEvent({
                        'type': 'value-edit'
                    });

                    event.preventDefault();
                    event.stopPropagation();
                }
            });

            return td;
        };

        tr = document.createElement('tr');
        // / content
        if (typeof content.length === 'undefined') {
            var i = 0;
            for (var k in content) {
                td = fillTable(i, content);

                tr.appendChild(td);
                tbody.appendChild(tr);
                ++i;
            }
        } else {
            for (var i = 0; i < content.length; ++i) {
                td = fillTable(i, content);

                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        }

        table.appendChild(tbody);
        container.appendChild(table);

        return container;
    };

    this.componentsToHTML = function(activeElement) {
        var container;
        var title;

        var that = this;
        window.removeEventListener('value-edit');

        for (var name in activeElement.components) {
            if (!activeElement.components.hasOwnProperty(name))
                continue;

            container = document.createElement('div');
            container.setAttribute('class', 'component-container');
            title = document.createElement('h3');
            title.setAttribute('class', 'component-headline');
            title.innerHTML = name;
            container.appendChild(title);

            var comp = activeElement.components[name];

            if (comp instanceof LEEWGL.Component.Transform) {
                (function(component) {
                    window.addEventListener('value-edit', function(event) {
                        component.translate(component.transVec);
                        component.rotateX(LEEWGL.Math.degToRad(component.rotVec[0]));
                        component.rotateY(LEEWGL.Math.degToRad(component.rotVec[1]));
                        component.rotateZ(LEEWGL.Math.degToRad(component.rotVec[2]));
                        component.scale(component.scaleVec);
                    });
                })(comp);

                // / position
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.position, {
                    'title': 'Position',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));
                // / translation
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.transVec, {
                    'title': 'Translation',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));

                // / rotation
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.rotVec, {
                    'title': 'Rotation',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));
                // / scale
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.scaleVec, {
                    'title': 'Scale',
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));

            } else if (comp instanceof LEEWGL.Component.CustomScript) {
                container.setAttribute('id', 'custom-script-component-container');

                var textfield = document.createElement('textarea');
                textfield.setAttribute('rows', 5);
                textfield.setAttribute('cols', 30);
                textfield.setAttribute('placeholder', comp.code);

                if (typeof this.saved['custom-object-script-' + activeElement.id] !== 'undefined')
                    textfield.value = this.saved['custom-object-script-' + activeElement.id];

                textfield.addEventListener('keyup', function(event) {
                    if (event.keyCode === LEEWGL.KEYS.ENTER) {
                        that.addScriptToObject(activeElement.id, this.value);
                        event.stopPropagation();
                    }
                });

                container.appendChild(textfield);
            } else if (comp instanceof LEEWGL.Component.Texture) {
                container.setAttribute('id', 'texture-component-container');

                var fileName = document.createElement('h4');
                fileName.setAttribute('class', 'component-sub-headline');

                var fileInput = document.createElement('input');
                fileInput.setAttribute('type', 'file');

                var imageContainer = document.createElement('div');
                imageContainer.setAttribute('id', 'texture-preview-container');
                var image = document.createElement('img');
                imageContainer.appendChild(image);

                if (typeof this.saved['object-' + this.activeIndex + '-texture-path'] !== 'undefined') {
                    image.setAttribute('src', this.saved['object-' + this.activeIndex + '-texture-path']);
                    fileInput.setAttribute('value', this.saved['object-' + this.activeIndex + '-texture-path']);
                    fileName.innerText = this.saved['object-' + this.activeIndex + '-texture-path'];
                } else {
                    fileName.innerText = 'No Texture';
                }

                fileInput.addEventListener('change', function(event) {
                    var name = this.value.substr(this.value.lastIndexOf('\\') + 1, this.value.length);
                    var path = LEEWGL.ROOT + 'texture/';
                    comp.init(that.gl, path + name);
                    that.activeElement.setTexture(comp.texture);

                    that.saved['object-' + that.activeIndex + '-texture-path'] = path + name;
                    fileName.innerText = path + name;

                    image.setAttribute('src', path + name);
                });

                container.appendChild(fileName);
                container.appendChild(fileInput);
                container.appendChild(imageContainer);
            }

            this.inspector.appendChild(container);
        }
    };

    this.valuesToHTML = function(activeElement) {
        var container;
        var title;

        var that = this;

        if (activeElement instanceof LEEWGL.Light) {
            container = document.createElement('div');
            container.setAttribute('class', 'component-container');
            title = document.createElement('h3');
            title.setAttribute('class', 'component-headline');
            title.innerHTML = 'Values';
            container.appendChild(title);

            for (var i = 0; i < activeElement.editables.length; ++i) {
                var editable = activeElement.editables[i];

                if (editable.value instanceof Array) {
                    container.appendChild(this.createTable(editable['table-titles'], editable.value, {
                        'title': editable.name,
                        'type': 'h4',
                        'class': 'component-detail-headline'
                    }));
                } else {
                    var containerDetail = document.createElement('div');
                    containerDetail.setAttribute('class', 'component-detail-container');
                    var name = document.createElement('h4');
                    name.setAttribute('class', 'component-detail-headline');
                    name.innerText = editable.name;
                    containerDetail.appendChild(name);
                    var input = document.createElement('input');
                    input.setAttribute('type', 'text');
                    input.setAttribute('class', 'settings-input');
                    input.setAttribute('value', editable.value);

                    containerDetail.appendChild(input);
                    container.appendChild(containerDetail);
                }
            }

            this.inspector.appendChild(container);
        }

    };

    this.setInspectorContent = function(index) {
        if (typeof this.inspector === 'undefined') {
            console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
            return;
        }

        this.inspector.innerHTML = '';

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

        var name = document.createElement('h3');
        name.setAttribute('class', 'component-detail-headline');
        name.innerHTML = 'Name - ' + activeElement.name;

        this.inspector.appendChild(name);
        this.valuesToHTML(activeElement);
        this.componentsToHTML(activeElement);
        this.componentsButton(index);
        this.update = true;
    };

    this.componentsButton = function(index) {
        var that = this;
        var componentsControlContainer = document.createElement('div');
        componentsControlContainer.setAttribute('class', 'controls-container');

        var addComponentControl = document.createElement('input');
        addComponentControl.setAttribute('class', 'submit');
        addComponentControl.setAttribute('type', 'submit');
        addComponentControl.setAttribute('value', 'Add Component');
        componentsControlContainer.appendChild(addComponentControl);

        addComponentControl.addEventListener('click', function(event) {
            that.displayComponentMenu(index, event);
        });

        this.inspector.appendChild(componentsControlContainer);
    };

    this.dynamicContainers = function(classname_toggle, classname_container, movable_container) {
        var that = this;
        var toggle = document.querySelectorAll(classname_toggle);
        var container = document.querySelectorAll(classname_container);

        for (var i = 0; i < toggle.length; ++i) {
            (function(index) {
                toggle[index].addEventListener('mousedown', function(event) {
                    if (event.which === 1 || event.button === LEEWGL.MOUSE.LEFT) {
                        var c = container[index];
                        c.setAttribute('class', 'movable');
                        c.addEventListener('click', that.drag.drag(c, event));
                    }
                });
                toggle[index].addEventListener('dblclick', function(event) {
                    var c = container[index];

                    c.className = c.className.replace(/\bmovable\b/, '');
                    that.drag.restore(c, event);
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

        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.id = 'custom-object-script-' + id;

        var code = 'UI.outline[' + id + '].obj.addEventListener("custom", function() { if(UI.playing === true) {' + src + '}});';

        newScript.appendChild(document.createTextNode(code));
        document.body.appendChild(newScript);
    };

    this.addScriptToDOM = function(id, src) {
        var script;
        if ((script = document.querySelector('#custom-dom-script-' + id)) !== null) {
            document.body.removeChild(script);
        }

        this.saved['custom-dom-script-' + id] = src;

        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.id = 'custom-dom-script-' + id;

        var code = 'Window.prototype.addEventListener("custom", function() { if(UI.playing === true) {' + src + '}}.bind(this));';

        newScript.appendChild(document.createTextNode(code));
        document.body.appendChild(newScript);
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
            for (var i = 0; i < a.length; ++i) {
                if (!visited[a[i]])
                    arr.push(a[i]);
            }
            return arr;
        };

        var availableComponents = subArray(LEEWGL.Component.Components, activeComponents);
        return availableComponents;
    };

    this.play = function(element) {
        this.playing = true;

        if (element.getAttribute('id') === 'play-control') {
            element.setAttribute('id', 'pause-control');
        } else {
            element.setAttribute('id', 'play-control');
            return;
        }

        for (var i = 0; i < Object.keys(this.outline).length; ++i) {
            this.outline[i].obj.dispatchEvent({
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
        if ((playIcon = document.getElementById('pause-control')) !== null)
            playIcon.setAttribute('id', 'play-control');

        this.playing = false;
    };

    this.displaySettings = function() {
        this.inspector.innerHTML = '';
        var container = document.createElement('div');
        container.setAttribute('class', 'component-container');

        for (var k in LEEWGL.Settings) {
            if (typeof LEEWGL.Settings[k] === 'object') {
                container.appendChild(this.createTable(Object.keys(LEEWGL.Settings[k]), LEEWGL.Settings[k], {
                    'title': k,
                    'type': 'h4',
                    'class': 'component-detail-headline'
                }));
            } else {
                var containerDetail = document.createElement('div');
                containerDetail.setAttribute('class', 'component-detail-container');
                var name = document.createElement('h4');
                name.setAttribute('class', 'component-detail-headline');
                name.innerText = k;
                containerDetail.appendChild(name);
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('class', 'settings-input');
                input.setAttribute('value', LEEWGL.Settings[k]);

                containerDetail.appendChild(input);
                container.appendChild(containerDetail);
            }
        }

        var submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('class', 'submit');
        submit.setAttribute('value', 'Update Settings');

        submit.addEventListener('click', function(event) {
            this.updateSettings();
            event.preventDefault();
        }.bind(this));

        container.appendChild(submit);

        this.inspector.appendChild(container);
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

            if (name.indexOf('custom-object-script-') !== -1) {
                var id = name.substr(name.lastIndexOf('-') + 1, name.length);
                this.addScriptToObject(id, this.saved[name]);
            } else if (name.indexOf('custom-dom-script-') !== -1) {
                var id = name.substr(name.lastIndexOf('-') + 1, name.length);
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
                this.statusBar.innerHTML = '1 Element selected';
            else
                this.statusBar.innerHTML = 'Nothing selected';
        }
    };
};

/**
 * [Popup description]
 * @param {object} options
 */
LEEWGL.UI.Popup = function(options) {
    this.pos = {
        'x': 0,
        'y': 0
    };

    this.parent = document.body;

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

    this.drag = new LEEWGL.DragDrop();
    this.ajax = new LEEWGL.AsynchRequest();

    this.setOptions = function(options) {
        if (typeof options !== 'undefined') {
            for (var attribute in this.options) {
                if (options.hasOwnProperty(attribute))
                    this.options[attribute] = options[attribute];
            }
        }
    };

    this.setDimensions = function() {
        this.wrapper.style.width = (typeof this.options['wrapper-width'] === 'number') ? this.options['wrapper-width'] + 'px' : this.options['wrapper-width'];
        this.wrapper.style.height = (typeof this.options['wrapper-height'] === 'number') ? this.options['wrapper-height'] + 'px' : this.options['wrapper-height'];
        this.position();
    };

    this.setOptions(options);

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

    this.create = function() {
        if (typeof this.wrapper !== 'undefined')
            return;

        if (this.parent === null)
            this.parent = document.body;

        this.wrapper = document.createElement('div');
        this.wrapper.setAttribute('class', this.options['wrapper-class']);

        if (this.options['title-enabled'] === true) {
            this.title = document.createElement('div');
            this.title.setAttribute('class', this.options['title-class']);
            this.wrapper.appendChild(this.title);
        }

        this.content = document.createElement('div');
        this.content.setAttribute('class', this.options['content-class']);

        this.wrapper.appendChild(this.content);

        this.parent.appendChild(this.wrapper);

        if (this.options['overlay-enabled'] === true) {
            this.overlay = document.createElement('div');
            this.overlay.setAttribute('class', this.options['overlay-class']);
            this.parent.appendChild(this.overlay);
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
        this.position();
    };

    this.center = function() {
        this.options['center'] = true;
        this.position();
    };

    this.getSize = function() {
        var x = 0,
            y = 0;

        this.show();
        x = this.wrapper.offsetWidth;
        y = this.wrapper.offsetHeight;
        this.hide();
        return {
            'x': parseInt(x),
            'y': parseInt(y)
        };
    };

    this.position = function() {
        var size = this.getSize();

        if (this.options['center'] === true) {
            var bodyX = document.body.offsetWidth;
            var bodyY = document.body.offsetHeight;

            this.pos.x = (bodyX / 2) - (size.x / 2);
            this.pos.y = (bodyY / 2) - size.y;
        }

        this.wrapper.style.top = this.pos.y + 'px';
        this.wrapper.style.left = this.pos.x + 'px';
    };

    this.addText = function(text) {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }
        var content = document.createTextNode(text);
        this.content.appendChild(content);
    };

    this.addHTML = function(html) {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }
        this.content.innerHTML += html;
    };

    this.addList = function(content, evFunction) {
        var list = document.createElement('ul');
        list.setAttribute('class', 'popup-list');

        this.listItems = [];

        for (var i = 0; i < content.length; ++i) {
            var item = document.createElement('li');
            item.innerHTML = content[i];
            item.setAttribute('class', this.options['list-item-class']);

            this.listItems.push(item);

            if (typeof evFunction === 'function') {
                (function(index) {
                    item.addEventListener('click', function(event) {
                        evFunction(content[index]);
                    });
                })(i);
            }

            list.appendChild(item);
        }

        this.content.appendChild(list);
    };

    this.addCustomElementToTitle = function(element) {
        this.title.appendChild(element);
    };

    this.addCustomElementToContent = function(element) {
        this.content.appendChild(element);
    };

    this.addTitleText = function(text) {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }
        var header = document.createElement('h1');
        header.innerText = text;
        this.title.appendChild(header);
    };

    this.addHTMLFile = function(path) {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }
        this.content.innerHTML = this.ajax.send('GET', LEEWGL.ROOT + path, false, null).response.responseText;
    };

    this.addCloseIcon = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        var iconContainer = document.createElement('div');
        iconContainer.setAttribute('class', 'popup-icon-wrapper fright mright10');
        var clearer = document.createElement('div');
        clearer.setAttribute('class', 'clearer');

        var closeIcon = document.createElement('img');
        closeIcon.setAttribute('alt', 'Close Popup');
        closeIcon.setAttribute('title', 'Close Popup');
        closeIcon.setAttribute('class', 'popup-close-icon');

        iconContainer.appendChild(closeIcon);
        iconContainer.appendChild(clearer);

        closeIcon.addEventListener('click', function(event) {
            this.hide();
        }.bind(this));

        this.title.appendChild(iconContainer);
    };

    this.addCloseButton = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        var buttonContainer = document.createElement('div');
        buttonContainer.setAttribute('class', 'popup-button-wrapper');
        var button = document.createElement('input');
        button.setAttribute('type', 'submit');
        button.setAttribute('value', 'Close');
        buttonContainer.appendChild(button);

        button.addEventListener('click', function(event) {
            this.hide();
        }.bind(this));

        this.content.appendChild(buttonContainer);
    };

    this.movable = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        var that = this;

        var iconContainer = document.createElement('div');
        iconContainer.setAttribute('class', 'popup-icon-wrapper fleft mleft10');
        var clearer = document.createElement('div');
        clearer.setAttribute('class', 'clearer');

        var moveIcon = document.createElement('img');
        moveIcon.setAttribute('alt', 'Move Popup');
        moveIcon.setAttribute('title', 'Move Popup');
        moveIcon.setAttribute('class', 'popup-move-icon');

        iconContainer.appendChild(moveIcon);
        iconContainer.appendChild(clearer);

        moveIcon.addEventListener('mousedown', function(event) {
            if (event.which === 1 || event.button === LEEWGL.MOUSE.LEFT) {
                that.wrapper.addEventListener('click', that.drag.drag(that.wrapper, event));
            }
        });
        moveIcon.addEventListener('dblclick', function(event) {
            that.drag.restore(that.wrapper, event);
        });

        this.title.appendChild(iconContainer);
    };

    this.show = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        this.wrapper.style.display = 'block';
        this.showOverlay();
    };

    this.hide = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        this.wrapper.style.display = 'none';
        this.hideOverlay();
    };

    this.showOverlay = function() {
        if (this.options['overlay-enabled'] === true)
            this.overlay.style.display = 'fixed';

    };

    this.hideOverlay = function() {
        if (this.options['overlay-enabled'] === true)
            this.overlay.style.display = 'none';
    };

    this.empty = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        if (this.options['title-enabled'] === true)
            this.title.innerHTML = '';

        if (this.options['close-icon-enabled'] === true)
            this.addCloseIcon();

        if (this.options['close-button-enabled'] === true)
            this.addCloseButton();

        if (this.options['movable'] === true)
            this.movable();

        this.content.innerHTML = '';
    };
}

window.addEventListener('load', function() {
    var UI = new LEEWGL.UI();
    window.UI = UI;
});

LEEWGL.UI.STATIC = 'static';
LEEWGL.UI.ABSOLUTE = 'absolute';
