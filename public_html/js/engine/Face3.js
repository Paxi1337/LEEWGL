LEEWGL.Face3 = function(x, y, z, normal, color, materialID) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.normal = normal instanceof vec3 ? normal : vec3.create();
    this.vertexNormals = normal instanceof Array ? normal : [];
    
    this.color = color instanceof vec4 ? color : vec4.create();
    this.vertexColors = color instanceof Array ? color : [];
    
    this.tangents = [];
    this.materialID = materialID !== undefined ? materialID : 0;
};

LEEWGL.Face3.prototype = {
    constructor : LEEWGL.Face3,
    
    clone : function() {
        var face = new LEEWGL.Face3(this.x, this.y, this.z);
        
        vec3.copy(face.normal, this.normal);
        vec4.copy(face.color, this.color);
        face.materialID = this.materialID;
        
        for(var i = 0; i < this.vertexNormals.length; ++i) {
            face.vertexNormals[i] = vec3.clone(this.vertexNormals[i]);
        }
        for(var i = 0; i < this.vertexColors.length; ++i) {
            face.vertexColors[i] = vec4.clone(this.vertexColors[i]);
        }
        for(var i = 0; i < this.tangents.length; ++i) {
            face.tangents[i] = vec3.clone(this.tangents[i]);
        }
        
        return face;
    }
};

