LEEWGL.BufferInformation = function() {};

LEEWGL.BufferInformation.VertexTypePos2 = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec2.create();
    this.size = 2;
};

LEEWGL.BufferInformation.VertexTypePos3 = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec3.create();
    this.size = 3;
};

LEEWGL.BufferInformation.VertexTypePos4 = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec4.create();
    this.size = 4;
};


