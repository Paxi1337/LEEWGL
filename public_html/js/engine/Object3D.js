LEEWGL.Object3D = function(options) {
    Object.defineProperty(this, 'id', {
        value: LEEWGL.Object3DCount++
    });

    this.name = (typeof options !== 'undefined' && typeof options.name !== 'undefined') ? options.name : 'Object3D_' + LEEWGL.Object3DCount;
    this.type = 'Object3D';

    this.parent = 'undefined';
    this.children = [];

    this.up = vec3.clone(LEEWGL.Object3D.DefaultUp);

    var scope = this;
    this.inOutline = (typeof options !== 'undefined' && typeof options.inOutine !== 'undefined') ? options.inOutline : true;

    this.components = {};

    this.matrix = mat4.create();
    this.matrixWorld = mat4.create();

    this.draggable = true;

    this.visible = true;
    this.autoUpdate = true;

    this.userData = {};
    this.render = true;

    this.needsUpdate = false;

    this.addComponent(new LEEWGL.Component.Transform());
    this.transform = this.components['Transform'];
};

LEEWGL.Object3D.DefaultUp = [0.0, 1.0, 0.0];

LEEWGL.Object3D.prototype = {
    constructor: LEEWGL.Object3D,
    add: function(object) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; ++i) {
                this.add(arguments[i]);
            }

            return this;
        }

        if (object === this) {
            console.error("LEEWGL.Object3D.add:", object, " can't be added as a child of itself");
            return this;
        }

        if (object instanceof LEEWGL.Object3D) {
            if (object.parent !== 'undefined') {
                object.parent.remove(object);
            }
            object.parent = this;
            this.children.push(object);
        } else {
            console.error("LEEWGL.Object3D.add:", object, " is not an instance of LEEWGL.Object3D");
        }

        this.needsUpdate = true;

        return this;
    },
    addComponent: function(component) {
        this.components[component.type] = component;
    },
    removeComponent: function(component) {
        this.components[component.type] = null;
    },
    remove: function(object) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; ++i) {
                this.remove(arguments[i]);
            }

            return this;
        }

        var index = this.children.indexOf(object);
        if (index !== -1) {
            object.parent = 'undefined';
            this.children.splice(index, 1);
        }

        this.needsUpdate = true;
    },
    applyMatrix: function(matrix) {
        mat4.multiply(this.matrix, this.matrix, matrix);
    },
    localToWorld: function(vector) {},
    worldToLocal: function() {

    },
    lookAt: function(vector) {
        var matrix = mat4.create();
        mat4.lookAt(matrix, vector, this.position, this.up);
        return matrix;
    },
    getObjectById: function(id, recursive) {
        if (this.id === id)
            return this;

        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
            var object = child.getObjectById(id, recursive);
            if (object !== 'undefined') {
                return object;
            }
        }
        return 'undefined';
    },
    getObjectByName: function(name, recursive) {
        if (this.name === name)
            return this;

        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
            var object = child.getObjectByName(name, recursive);
            if (object !== 'undefined') {
                return object;
            }
        }
        return 'undefined';
    },
    traverse: function(callback) {
        callback(this);
        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
            child.traverse(callback);
        }
    },
    traverseVisible: function(callback) {
        if (this.visible === true)
            return;
        callback(this);
        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
            child.traverseVisible(callback);
        }
    },
    clone: function(object, recursive) {
        if (object === 'undefined')
            object = new LEEWGL.Object3D();
        if (recursive === 'undefined')
            recursive = true;

        object.name = this.name + 'Clone';

        vec3.copy(object.up, this.up);

        LEEWGL.Component.Transform.prototype.clone.call(this.transform, object.transform);

        object.visible = this.visible;

        object.userData = JSON.parse(JSON.stringify(this.userData));

        if (recursive === true) {
            for (var i = 0; i < this.children.length; ++i) {
                var child = this.children[i];
                object.add(child.clone());
            }
        }

        return object;
    }
};

LEEWGL.EventDispatcher.prototype.apply(LEEWGL.Object3D.prototype);
LEEWGL.Object3DCount = 0;
