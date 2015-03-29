LEEWGL.Math = {
    degToRad: function(deg) {
        return deg * Math.PI / 180.0;
    },

    calculateSurfaceNormal: function(v1, v2, v3) {
        var u = [0.0, 0.0, 0.0];
        var v = [0.0, 0.0, 0.0];
        var normal = [0.0, 0.0, 0.0];

        vec3.subtract(u, v2, v1);
        vec3.subtract(v, v3, v1);

        vec3.cross(normal, u, v);
        vec3.normalize(normal, normal);

        return normal;
    },

    triangleNormalFromVertex: function(face, vertex) {
        var a = face[vertex % 3];
        var b = face[(vertex + 1) % 3];
        var c = face[(vertex + 2) % 3];

        var v1 = [];
        var v2 = [];

        vec3.subtract(v1, b, a);
        vec3.subtract(v2, c, a);

        /// TODO: add weight
        
        var n = [];
        vec3.cross(n, v1, v2);
        return vec3.normalize(n, n);
    }
};

LEEWGL.Math.Ray = {
    'origin': vec3.create(),
    'direction': vec3.create()
};
