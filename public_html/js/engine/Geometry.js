LEEWGL.Geometry = function () {
    LEEWGL.Object3D.call(this);

    this.type = 'Geometry';

    this.vertices = [];
    this.boundingBox = null;
    this.boundingSphere = null;
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

LEEWGL.Geometry.Cube = function() {
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
};

LEEWGL.Geometry.Cube.prototype = Object.create(LEEWGL.Geometry.prototype);





