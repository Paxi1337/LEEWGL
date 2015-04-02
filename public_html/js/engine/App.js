LEEWGL.App = function(options) {
    this.type = 'App';

    this.core = options.core;
    this.gl = this.core.getContext();
    this.canvas = this.core.getCanvas();

    this.shader = new LEEWGL.Shader();
    this.shaderLibrary = new LEEWGL.ShaderLibrary();
    this.buffers = [new LEEWGL.Buffer()];

    this.mouseVector = vec3.create();
};

LEEWGL.App.prototype = {
    constructor: LEEWGL.App,

    onCreate: function() {},

    onUpdate: function() {},

    onRender: function() {},

    onKeyUp: function(event) {},

    onKeyDown: function(event) {},

    onMouseDown: function(event) {

    },
    onMouseUp: function(event) {

    },
    onMouseMove: function(event) {

    }
};
