LEEWGL.Buffer = function () {
    var _buffer = null;

    this.setData = function (gl, vertices, type) {
        _buffer = _buffer !== null ? buffer : this.create(gl);
        this.bind(gl, _buffer);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        _buffer.itemSize = type.size;
        _buffer.numItems = vertices.length / type.size;
    };

    this.create = function (gl) {
        return gl.createBuffer();
    };

    this.bind = function (gl, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    };

    this.getBuffer = function () {
        return _buffer;
    };
};