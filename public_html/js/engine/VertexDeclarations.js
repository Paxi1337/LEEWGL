LEEWGL.BufferInformation = function() {};

LEEWGL.BufferInformation.VertexTypePos2 = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec2.create();
    this.size = 2;
};

LEEWGL.BufferInformation.VertexTypePos2UV = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec2.create();
    this.uv = vec2.create();
    this.size = 2;
};

LEEWGL.BufferInformation.VertexTypePos2Color = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec2.create();
    this.color = vec4.create();
    this.size = 2;
};

LEEWGL.BufferInformation.VertexTypePos3 = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec3.create();
    this.size = 3;
};

LEEWGL.BufferInformation.VertexTypePos3UV = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec3.create();
    this.uv = vec2.create();
    this.size = 3;
};

LEEWGL.BufferInformation.VertexTypePos3Color = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec3.create();
    this.color = vec4.create();
    this.size = 3;
};

LEEWGL.BufferInformation.VertexTypePos4 = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec4.create();
    this.size = 4;
};

LEEWGL.BufferInformation.VertexTypePos4UV = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec4.create();
    this.uv = vec2.create();
    this.size = 4;
};

LEEWGL.BufferInformation.VertexTypePos4Color = function() {
    LEEWGL.BufferInformation.call(this);
    
    this.pos = vec4.create();
    this.color = vec4.create();
    this.size = 4;
};


