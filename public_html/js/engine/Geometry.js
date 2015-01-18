LEEWGL.Geometry = function () {
    LEEWGL.Object3D.call(this);

    this.type = 'Geometry';

    this.vertices = [];
    this.indices = [];
    this.boundingBox = null;
    this.boundingSphere = null;

    this.vertexBuffer = new LEEWGL.Buffer({'picking': true});
    this.indexBuffer = new LEEWGL.IndexBuffer();

    this.normal = vec3.fromValues(0.0, LEEWGL.up, 0.0);
    
    this.setBuffer = function(gl) {
        this.vertexBuffer.setData(gl, this.vertices, new LEEWGL.BufferInformation.VertexTypePos3());
        this.indexBuffer.setData(gl, this.indices);
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

    this.x = vec3.create();
    this.y = vec3.create();
    this.z = vec3.create();

    vec3.set(this.x, 0.0, 0.0, 0.0);
    vec3.set(this.y, 0.0, 0.0, 0.0);
    vec3.set(this.z, 0.0, 0.0, 0.0);

    this.vertices = [
        // front
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        0.0, 1.0, 1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
    ];

    this.indices = [
        0, 1, 2, // front
        3, 4, 2, // back
        4, 1, 2, // right
        3, 2, 0, // left
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

LEEWGL.Geometry.Triangle.prototype.inTriangle = function (point) {
    var u = vec3.create();
    var v = vec3.create();

    u[0]

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





