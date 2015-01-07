LEEWGL.Buffer = function () {
    var _buffer = null;

    this.setData = function (gl, vertices, type) {
        _buffer = _buffer !== null ? _buffer : this.create(gl);
        this.bind(gl, _buffer);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        _buffer.itemSize = type.size;
        _buffer.numItems = vertices.length / type.size;
    };

    this.create = function (gl) {
        return gl.createBuffer();
    };

    this.bind = function (gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
    };
    
    this.unbind = function (gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

    this.getBuffer = function () {
        return _buffer;
    };
};

LEEWGL.RenderBuffer = function () {
    var _buffer = null;

    this.setData = function (gl, width, height) {
        _buffer = _buffer !== null ? _buffer : this.create(gl);
        this.bind(gl, _buffer);
        
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    };

    this.create = function (gl) {
        return gl.createRenderbuffer();
    };

    this.bind = function (gl) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, _buffer);
    };
    
    this.unbind = function(gl) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };

    this.getBuffer = function () {
        return _buffer;
    };
};

LEEWGL.FrameBuffer = function (gl, options) {
    var _buffer = null;
    
    this.init = function(gl, width, height) {
        width = typeof width !== undefined ? width : 512;
        height = typeof height !== undefined ? height : 512;
        
        _buffer = this.create(gl);
        _buffer.width = width;
        _buffer.height = height;
    };
    
    this.create = function (gl) {
        return gl.createFramebuffer();
    };

    this.bind = function (gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, _buffer);
    };
    
    this.unbind = function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    this.getBuffer = function () {
        return _buffer;
    };
};

