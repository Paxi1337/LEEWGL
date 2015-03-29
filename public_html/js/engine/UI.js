LEEWGL.UI = function(options) {
    var inspector;

    this.outline = {};

    this.update = false;

    this.activeElement = undefined;
    this.storage = new LEEWGL.LocalStorage();
    this.playing = undefined;

    this.gl = undefined;
    this.scene = undefined;

    this.activeIndex = undefined;

    this.drag = new LEEWGL.DragDrop();
    this.popup = new LEEWGL.UI.Popup();
    this.popup.create();

    this.setGL = function(gl) {
        this.gl = gl;
    };

    this.setScene = function(scene) {
        this.scene = scene;
    };

    this.setInspector = function(container) {
        this.inspector = (typeof container === 'string') ? document.querySelector(container) : container;
    };

    this.setEditable = function(index) {
        for (var i = 0; i < Object.keys(this.outline).length; ++i) {
            this.outline[i].editable = false;
        }

        if (index !== -1)
            this.outline[index].editable = true;
    };

    this.setActive = function(index) {
        for (var i = 0; i < Object.keys(this.outline).length; ++i) {
            this.outline[i].active = false;
        }

        if (index !== -1)
            this.outline[index].active = true;
    };

    this.addObjToOutline = function(obj) {
        this.outline[obj.id] = {};
        this.outline[obj.id].obj = obj;
        this.outline[obj.id].active = false;
        this.outline[obj.id].editable = false;

        this.update = true;
    };

    this.removeObjFromOutline = function(index) {
        this.outline.splice(index, 1);
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

        for (var i = 1; i < Object.keys(this.outline).length; ++i) {
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
        }

        container.appendChild(list);

        this.update = false;
    };

    this.createTable = function(header, content) {
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');
        var tr;
        var td;

        var that = this;

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
                        content[keys[index]] = this.innerText;
                    } else {
                        content[num] = this.innerText;
                    }

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
        return table;
    };

    this.componentsToHTML = function(activeElement) {
        var container;
        var title;

        var that = this;

        for (var compName in activeElement.components) {
            if (!activeElement.components.hasOwnProperty(compName))
                continue;

            container = document.createElement('div');
            title = document.createElement('h3');
            title.innerHTML = 'Type: ' + compName;
            container.appendChild(title);

            var comp = activeElement.components[compName];
            var hr = document.createElement('hr');

            // / LEEWGL.TransformComponent
            if (compName === LEEWGL.Component.TransformComponent) {
                container.setAttribute('class', 'table-container');
                var pos = document.createElement('h4');
                pos.innerHTML = 'Position: ';

                var trans = document.createElement('h4');
                trans.innerHTML = 'Translation: ';

                var rot = document.createElement('h4');
                rot.innerHTML = 'Rotation: ';

                var scale = document.createElement('h4');
                scale.innerHTML = 'Scale: ';

                // / position
                container.appendChild(pos);
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.position));
                // / translation
                container.appendChild(trans);
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.transVec));
                // / rotation
                container.appendChild(rot);
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.rotVec));
                // / scale
                container.appendChild(scale);
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.scaleVec));

                container.appendChild(hr);
            } else if (compName === LEEWGL.Component.CustomScriptComponent) {
                container.setAttribute('id', 'custom-script-container');

                var textfield = document.createElement('textarea');
                textfield.setAttribute('rows', 5);
                textfield.setAttribute('cols', 30);
                textfield.setAttribute('placeholder', comp.code);

                textfield.value = that.storage.getValue('customScript' + activeElement.id);

                textfield.addEventListener('keyup', function(event) {
                    if (event.keyCode === LEEWGL.KEYS.ENTER) {
                        that.addScript(activeElement.id, this.value);
                        event.stopPropagation();
                    }
                });

                container.appendChild(textfield);
                container.appendChild(hr);
            } else if (compName === LEEWGL.Component.LightComponent) {
                container.setAttribute('class', 'table-container');
                var direction = document.createElement('h4');
                direction.setAttribute('class', 'fleft mright10');
                direction.innerHTML = 'Direction: ';

                var color = document.createElement('h4');
                color.setAttribute('class', 'fleft mright10');
                color.innerHTML = 'Color: ';

                // / direction
                container.appendChild(direction);
                container.appendChild(this.createTable(['x', 'y', 'z'], comp.direction));
                // / color
                container.appendChild(color);
                container.appendChild(this.createTable(['r', 'g', 'b'], comp.color));
            }

            this.inspector.appendChild(container);
        }
    };

    this.setInspectorContent = function(index) {
        if (typeof this.inspector === 'undefined') {
            console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
            return;
        }

        var that = this;
        this.inspector.innerHTML = '';
        this.activeIndex = index;
        this.activeElement = this.outline[index].obj;
        window.activeElement = this.activeElement;

        var name = document.createElement('h3');
        name.innerHTML = 'Name: ' + activeElement.name;

        this.inspector.appendChild(name);
        this.componentsToHTML(activeElement);

        // / interactive GUI elements
        // / add component
        var interactiveControlsContainer = document.createElement('div');
        interactiveControlsContainer.setAttribute('class', 'controls-container');

        var addComponentControl = document.createElement('button');
        addComponentControl.setAttribute('type', 'button');
        addComponentControl.appendChild(document.createTextNode('Add Component'));
        interactiveControlsContainer.appendChild(addComponentControl);

        addComponentControl.addEventListener('click', function(event) {
            that.displayComponentMenu(index, event);
        });

        this.inspector.appendChild(interactiveControlsContainer);
    };

    this.dynamicContainers = function(classname_toggle, classname_container, movable_container) {
        var that = this;
        var toggle = document.querySelectorAll(classname_toggle);
        var container = document.querySelectorAll(classname_container);

        for (var i = 0; i < toggle.length; ++i) {
            (function(index) {
                toggle[index].addEventListener('mousedown', function(event) {
                    var c = container[index];
                    c.addEventListener('click', that.drag.drag(c, event));
                });
                toggle[index].addEventListener('dblclick', function(event) {
                    var c = container[index];
                    that.drag.restore(c, event);
                });
            })(i);
        }
    };

    this.addScript = function(id, src) {
        var script;
        if ((script = document.querySelector('#customScript' + id)) !== null) {
            document.body.removeChild(script);
        }
        this.storage.setValue('customScript' + id, src);

        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.id = 'customScript' + id;

        var code = 'UI.outline[' + id + '].obj.addEventListener("custom", function() { if(UI.playing === true) {' + src + '}});';

        newScript.appendChild(document.createTextNode(code));
        document.body.appendChild(newScript);
    };

    this.displayComponentMenu = function(index, event) {
        // / get all not already added components
        var availableComponents = this.getAvailableComponents(this.outline[index].obj);

        this.popup.empty();
        this.popup.setPosition({
            'x': event.clientX,
            'y': event.clientY
        });

        var that = this;
        var testClass = this.stringToFunction('LEEWGL.Component.' + availableComponents[0]);
        console.log(testClass);

        console.log(availableComponents[0]);

        console.log(this.activeElement.components);
        console.log(availableComponents);

        this.popup.addList(availableComponents, function(item) {
            var className = that.stringToFunction('LEEWGL.Component.' + item);
            that.activeElement.addComponent(new className());
            that.setInspectorContent(that.activeElement.id);
            that.popup.hide();
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

    };

    this.pause = function(element) {
        if (this.playing === true) {
            this.paused = true;
        }
    };

    this.stop = function() {
        this.playing = false;
    };

    this.displaySettings = function() {
        this.inspector.innerHTML = '';
        var container = document.createElement('div');

        var list = document.createElement('ul');

        for (var k in LEEWGL.Settings) {
            var name = document.createElement('h4');
            name.innerText = k;
            container.appendChild(name);

            if (typeof LEEWGL.Settings[k] === 'object') {
                container.appendChild(this.createTable(Object.keys(LEEWGL.Settings[k]), LEEWGL.Settings[k]));
            } else {
                var item = document.createElement('li');
                var content = document.createTextNode(LEEWGL.Settings[k]);
                item.appendChild(content);

                container.appendChild(item);
            }

        }
        this.inspector.appendChild(container);
    };

    /// object methods
    this.duplicateObject = function() {
        if (this.activeElement === null) {
            console.warn('LEEWGL.UI: No active element selected!');
            return;
        }
        var copy = this.activeElement.clone();
        this.scene.add(copy);
    };

    this.insertTriangle = function() {
        var triangle = new LEEWGL.Geometry.Triangle();
        triangle.setBuffer(this.gl);
        triangle.addColor(this.gl, undefined, triangle.faces);
        this.scene.add(triangle);
    };

    this.insertCube = function() {
        var cube = new LEEWGL.Geometry.Cube();
        cube.setBuffer(this.gl);
        cube.addColor(this.gl, undefined, cube.faces);
        this.scene.add(cube);
    };

    this.insertSphere = function() {
        var sphere = new LEEWGL.Geometry.Sphere();
        sphere.setBuffer(this.gl);
        sphere.addColor(this.gl, undefined, sphere.faces);
        this.scene.add(sphere);
    };

    this.importScript = function() {
        this.popup.empty();
        this.popup.addTitleText('Import Script');
        this.popup.show();
    };

    this.displayAbout = function() {
        this.popup.empty();
        this.popup.addHTMLFile('html/about.html');
        this.popup.show();
    };

    this.contextMenu = function(event) {
        this.popup.center = false;
        this.popup.overlayEnabled = false;

        this.popup.empty();

        this.popup.setPosition({
            'x': event.clientX,
            'y': event.clientY
        });
        this.popup.addTitleText('Context Menu');
        // this.popup.show();

        event.stopPropagation();
        event.preventDefault();
    };

    this.stringToFunction = function(str) {
        var arr = str.split(".");
        var fn = window;
        for (var i = 0; i < arr.length; ++i) {
            fn = fn[arr[i]];
        }

        return fn;
    };
};

LEEWGL.UI.Popup = function(options) {
    this.wWidth = 250;
    this.wHeight = 100;
    this.overlayEnabled = true;
    this.center = true;
    this.hidden = true;
    this.pos = {
        'x': 0,
        'y': 0
    };

    this.parent = document.body;

    this.wClass = 'popup';
    this.tClass = 'popup-title';
    this.cClass = 'popup-content';
    this.oClass = 'popup-overlay';
    this.closeIcon = LEEWGL.ROOT + 'img/icons/';

    this.wrapper = undefined;
    this.title = undefined;
    this.content = undefined;
    this.overlay = undefined;

    this.initialized = false;

    this.ajax = new LEEWGL.AsynchRequest();

    if (typeof options !== 'undefined') {
        this.wWidth = (typeof options.wrapperWidth !== 'undefined') ? options.wrapperWidth : this.wWidth;
        this.wHeight = (typeof options.wrapperHeight !== 'undefined') ? options.wrapperHeight : this.wHeight;
        this.overlayEnabled = (typeof options.overlayEnabled !== 'undefined') ? options.overlayEnabled : this.overlayEnabled;
    }

    this.setPosition = function() {
        if (arguments.length === 1) {
            this.pos = arguments[0];
        } else {
            this.pos.x = arguments[0];
            this.pos.y = arguments[1];
        }

        this.center = false;
        this.position();
    };

    this.create = function() {
        if (typeof this.wrapper !== 'undefined')
            return;

        if (this.parent === null)
            this.parent = document.body;

        this.wrapper = document.createElement('div');
        this.wrapper.setAttribute('class', this.wClass);

        this.title = document.createElement('div');
        this.title.setAttribute('class', this.tClass);

        this.content = document.createElement('div');
        this.content.setAttribute('class', this.cClass);

        this.overlay = document.createElement('div');
        this.overlay.setAttribute('class', this.oClass);

        this.wrapper.appendChild(this.title);
        this.wrapper.appendChild(this.content);

        this.parent.appendChild(this.wrapper);
        this.parent.appendChild(this.overlay);

        this.position();

        this.initialized = true;

        if (this.hidden === true)
            this.hide();
    };

    this.position = function() {
        if (this.center === true) {
            var bodyX = document.body.offsetWidth;
            var bodyY = document.body.offsetHeight;

            this.pos.x = (bodyX / 2) - (this.wWidth / 2);
            this.pos.y = (bodyY / 2) - this.wHeight;
        }

        this.wrapper.style.top = this.pos.y + 'px';
        this.wrapper.style.left = this.pos.x + 'px';
    };

    this.addText = function(text) {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }
        var content = document.createElement('p');
        content.innerHTML = text;
        this.content.appendChild(content);
    };

    this.addHTML = function(html) {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }
        console.log(html);
        this.content.innerHTML += html;
    };

    this.addList = function(content, evFunction) {
        var list = document.createElement('ul');
        list.setAttribute('class', 'popup-list');

        for (var i = 0; i < content.length; ++i) {
            var item = document.createElement('li');
            item.innerHTML = content[i];

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
    };

    this.show = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        this.wrapper.style.display = 'block';
        this.overlay.style.display = 'fixed';
    };

    this.hide = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        this.wrapper.style.display = 'none';
        this.overlay.style.display = 'none';
    };

    this.empty = function() {
        if (this.initialized === false) {
            console.error('LEEWGL.UI.Popup: call create() first!');
            return;
        }

        this.title.innerHTML = '';
        this.content.innerHTML = '';
    };
}

window.addEventListener('load', function() {
    var UI = new LEEWGL.UI();
    window.UI = UI;
});

LEEWGL.UI.STATIC = 'static';
LEEWGL.UI.ABSOLUTE = 'absolute';
