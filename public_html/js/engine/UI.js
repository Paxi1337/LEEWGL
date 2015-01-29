LEEWGL.UI = function (options) {
    var outline = [];
    var activeElement;
    var inspector;
    var update = false;

    Object.defineProperties(this, {
        outline : {
            enumerable : true,
            value : outline
        },
        activeElement : {
            enumerable : true,
            value : activeElement
        }
    });

    this.setInspector = function (container) {
        this.inspector = (typeof container === 'string') ? document.querySelector(container) : container;
    };

    this.addObjToOutline = function (obj) {
        this.outline[obj.id] = obj;
        this.update = true;
    };

    this.removeObjFromOutline = function (index) {
        this.outline.splice(index, 1);
        this.update = true;
    };

    this.outlineToHTML = function (container) {
        if(this.update === false)
            return;

        container = (typeof container === 'string') ? document.querySelector(container) : container;

        container.innerHTML = '';

        var list = document.createElement('ul');

        for(var i = 0; i < this.outline.length; ++i) {
            var item = document.createElement('li');
            item.innerHTML = this.outline[i].name;
            list.appendChild(item);

            var that = this;
            (function (index) {
                item.addEventListener('click', function () {
                    that.setInspectorContent(index);
                });
            })(i);
        }

        container.appendChild(list);

        this.update = false;
    };

    this.createTable = function (header, content) {
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');
        var tr;
        var td;

        tr = document.createElement('tr');
        /// headers
        for(var i = 0; i < header.length; ++i) {
            td = document.createElement('th');
            td.innerHTML = header[i];

            tr.appendChild(td);
            thead.appendChild(tr);
        }

        table.appendChild(thead);

        tr = document.createElement('tr');
        /// content
        for(var i = 0; i < content.length; ++i) {
            td = document.createElement('td');
            td.setAttribute('contenteditable', true);
            td.innerHTML = content[i];

            /// html5 feature - gets called when dom elements with contenteditable = true get edited
            td.addEventListener('input', function () {

            });

            tr.appendChild(td);
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        return table;
    };

    this.componentsToHTML = function (activeElement) {
        var container;

        for(var component in activeElement.components) {
            if(!activeElement.components.hasOwnProperty(component))
                continue;
            
            container = document.createElement('div');
            var obj = activeElement.components[component];
            
            
            /// LEEWGL.TransformComponent
            if(component === LEEWGL.Component.TransformComponent) {
                container.setAttribute('id', 'table-container');
                /// position
                container.appendChild(this.createTable(['x', 'y', 'z'], [obj.position[0], obj.position[1], obj.position[2]]));
                /// translation
                container.appendChild(this.createTable(['x', 'y', 'z'], [obj.transVec[0].toPrecision(6), obj.transVec[1].toPrecision(6), obj.transVec[2].toPrecision(6)]));
                /// rotation
                container.appendChild(this.createTable(['x', 'y', 'z'], [obj.rotVec[0], obj.rotVec[1], obj.rotVec[2]]));
                /// scale
                container.appendChild(this.createTable(['x', 'y', 'z'], [obj.scaleVec[0], obj.scaleVec[1], obj.scaleVec[2]]));
            } else if(component === LEEWGL.Component.CustomScriptComponent) {
                container = document.createElement('div');
                container.setAttribute('id', 'custom-script-container');

                var textfield = document.createElement('textarea');
                textfield.setAttribute('rows', 5);
                textfield.setAttribute('cols', 30);
                textfield.setAttribute('placeholder', obj.code);
                
                textfield.addEventListener('keyup', function(event) {
                    /// enter key
                    if(event.keyCode === 13) {
                        var script = document.createElement('script');
                        script.type = 'text/javascript';
                        var code = this.value;
                        
                        script.appendChild(document.createTextNode(code));
                        document.body.appendChild(script);
                    };
                });
                
                container.appendChild(textfield);
            }
            this.inspector.appendChild(container);
        }
    };

    this.setInspectorContent = function (index) {
        if(typeof this.inspector === 'undefined') {
            console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
            return;
        }

        this.inspector.innerHTML = '';
        var activeElement = this.outline[index];

        var list = document.createElement('ul');

        var item = document.createElement('li');
        var name = document.createElement('h3');
        name.innerHTML = 'Name: ' + activeElement.name;
        item.appendChild(name);
        list.appendChild(item);

        for(var prop in activeElement.components) {
            if(!activeElement.components.hasOwnProperty(prop))
                continue;

            var item = document.createElement('li');
            var type = document.createElement('h3');
            type.innerHTML = 'Type: ' + prop;

            item.appendChild(type);
            list.appendChild(item);
        }


        this.inspector.appendChild(list);
        this.componentsToHTML(activeElement);
    };
};

var UI = new LEEWGL.UI();