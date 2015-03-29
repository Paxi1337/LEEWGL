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
    }
};

LEEWGL.Math.Ray = {
    'origin': vec3.create(),
    'direction': vec3.create()
};
