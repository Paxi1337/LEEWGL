LEEWGL.App = function(options) {
    this.type = 'App';
    
    this.core = options.core;
    this.gl = this.core.getContext();
    
    this.shader = new LEEWGL.Shader();
    this.buffers = [new LEEWGL.Buffer()];
    
    this.mouseVector = vec3.create();
};

LEEWGL.App.prototype = {
    constructor : LEEWGL.App,
    
    onCreate : function() {
    },
    
    onUpdate : function() {
    },
    
    onRender : function() {
    },
    
    onKeyPressed : function(event) {
    },
    
    onMouseDown : function(event) {
        
    },
    onMouseUp : function(event) {
        
    },
    onMouseMove : function(event) {
        
    }
};

