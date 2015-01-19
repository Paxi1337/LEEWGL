LEEWGL.Component = function () {
    this.type = 'GeneralComponent';
};

LEEWGL.Transform = function () {
    LEEWGL.Component.call(this);
    
    this.type = 'Transform';
    
    this.x = 0;
    this.y = 0;
    this.z = 0;

    var position = [this.x, this.y, this.z];

    var translation = mat4.create();
    var rotation = mat4.create();
    var scale = mat4.create();

    // private properties - configurable tag defaults to false
    Object.defineProperties(this, {
        position: {
            enumerable: true,
            value: position
        },
        translation: {
            enumerable: true,
            value: translation
        },
        rotation: {
            enumerable: true,
            value: rotation
        },
        scale: {
            enumerable: true,
            value: scale
        }
    });

};

LEEWGL.Transform.prototype = {
    offsetPosition: function (vector) {
        vec3.add(this.position, this.position, vector);
    },
    setPosition: function () {
        if (arguments === 'undefined') {
            console.error('LEEWGL.Transform.setPosition(): no arguments given!');
            return false;
        }

        if (typeof arguments[0] === 'object'){
            vec3.copy(this.position, arguments[0]);
        } else {
            vec3.set(this.position, arguments[0], arguments[1], arguments[2]);
        }
    },
    translate: function (vector) {
        mat4.translate(this.translation, mat4.create(), vector);
    },
    scale: function (vector) {
        mat4.scale(this.scale, mat4.create(), vector);
    },
    matrix : function() {
        return mat4.multiply(mat4.create(), this.translation, this.scale);
    },
    clone: function (transform) {
        if (transform === 'undefined')
            transform = new LEEWGL.Transform();

        transform.position.copy(transform.position, this.position);
        transform.translation.copy(transform.translation, this.translation);
        transform.rotation.copy(transform.rotation, this.rotation);
        transform.scale.copy(transform.scale, this.scale);

        return transform;
    }
};

LEEWGL.Geometry = function () {
    LEEWGL.Object3D.call(this);

    this.type = 'Geometry';

    this.vertices = [];
    this.indices = [];
    this.boundingBox = null;
    this.boundingSphere = null;

    this.vertexBuffer = new LEEWGL.Buffer({'picking': true});
    this.indexBuffer = new LEEWGL.IndexBuffer();
    this.colorBuffer = new LEEWGL.Buffer();
    this.textureBuffer = new LEEWGL.Buffer();
    this.colors = [];
    this.faces = 0;

    this.normal = vec3.fromValues(0.0, LEEWGL.up, 0.0);

    this.setBuffer = function (gl) {
        this.vertexBuffer.setData(gl, this.vertices, new LEEWGL.BufferInformation.VertexTypePos3());
        this.indexBuffer.setData(gl, this.indices);
    };

    this.setColorBuffer = function (gl) {
        if (this.colors[0].length % 4 !== 0) {
            console.error('LEEWGL.Geometry.addColor(): Color array must be multiple of 4!');
            return false;
        }

        this.colorBuffer.setData(gl, this.colors, new LEEWGL.BufferInformation.VertexTypePos4());
    };

    this.addColor = function (gl, colors, length) {
        if (colors !== undefined && colors.length === length) {
            this.colors = colors;
            this.setColorBuffer(gl);
        } else {
            this.colors = [];
            for (var i = 0; i < length; ++i) {
                this.colors.push([1.0, 0.0, 1.0, 1.0]);
            }

            this.setColorBuffer(gl);
        }
    };
};

LEEWGL.Geometry.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Geometry.prototype.setVertices = function (vertices) {
    for (var i = 0; i < vertices.length; ++i) {
        this.vertices.push(vertices[i]);
    }
};

LEEWGL.Geometry.prototype.clone = function () {
    var geometry = new LEEWGL.Geometry();
    var vertices = this.vertices;

    for (var i = 0; i < vertices.length; ++i) {
        geometry.vertices.push(vertices[i].clone());
    }

    LEEWGL.Object3D.prototype.clone.call(this, geometry);

    return geometry;
};

LEEWGL.Geometry.Plane = function () {
    LEEWGL.Geometry.call(this);

    this.x = vec3.create();
    this.y = vec3.create();
    this.z = vec3.create();

    this.distance = 0.0;
};

LEEWGL.Geometry.Plane.prototype = Object.create(LEEWGL.Geometry.prototype);

/**
 * 
 * @param vec3 origin
 * @returns {undefined}
 */
LEEWGL.Geometry.Plane.prototype.distance = function (origin) {
    return vec3.dot(this.normal, origin) + this.distance;
};

LEEWGL.Geometry.Triangle = function () {
    LEEWGL.Geometry.call(this);

    this.faces = 4;

    this.x = vec3.create();
    this.y = vec3.create();
    this.z = vec3.create();

    vec3.set(this.x, 0.0, 0.0, 0.0);
    vec3.set(this.y, 0.0, 0.0, 0.0);
    vec3.set(this.z, 0.0, 0.0, 0.0);

    this.vertices = [
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        0.0, 1.0, 1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0
    ];

    this.indices = [
        0, 1, 2,
        3, 4, 2,
        4, 1, 2,
        3, 2, 0,
        3, 4, 1
    ];
};

LEEWGL.Geometry.Triangle.prototype = Object.create(LEEWGL.Geometry.prototype);

LEEWGL.Geometry.Triangle.prototype.intersectRay = function (origin, direction, collision, distance, segmentationMax) {
    var plane = new LEEWGL.Geometry.Plane();
    vec3.set(plane.x, this.x);
    vec3.set(plane.y, this.y);
    vec3.set(plane.z, this.z);

    var denom = vec3.dot(plane.normal, direction);
    if (Math.abs(denom) < Math.EPSILON)
        return false;

    var t = -(plane.distance + vec3.dot(plane.normal, origin)) / denom;
    if (t <= 0)
        return false;

    if (segmentationMax !== undefined && t > segmentationMax)
        return false;

    vec3.set(collision, direction);
    vec3.scale(collision, collision, t);
    vec3.add(collision, origin, collision);

    if (this.pointInTriangle(collision)) {
        collision[3] = t;
        return true;
    }

    return false;
};

Object.defineProperty(LEEWGL.Geometry.Triangle.prototype, 0, {
    get: function () {
        return this.z;
    },
    set: function (v) {
        return vec3.set(this.x, v);
    },
    enumerable: false,
    configurable: false
});

Object.defineProperty(LEEWGL.Geometry.Triangle.prototype, 1, {
    get: function () {
        return this.y;
    },
    set: function (v) {
        return vec3.set(this.y, v);
    },
    enumerable: false,
    configurable: false
});

Object.defineProperty(LEEWGL.Geometry.Triangle.prototype, 2, {
    get: function () {
        return this.z;
    },
    set: function (v) {
        return vec3.set(this.z, v);
    },
    enumerable: false,
    configurable: false
});

LEEWGL.Geometry.Cube = function () {
    LEEWGL.Geometry.call(this);

    this.faces = 6;

    this.vertices = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];

    this.indices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23    // left
    ];
};

LEEWGL.Geometry.Cube.prototype = Object.create(LEEWGL.Geometry.prototype);





