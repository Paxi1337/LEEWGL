LEEWGL.Math = {
    degToRad : function(deg) {
        return deg * Math.PI / 180.0;
    }
};

LEEWGL.Math.Ray = {
    'origin' : vec3.create(),
    'direction' : vec3.create()
};

