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





