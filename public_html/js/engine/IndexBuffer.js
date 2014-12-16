LEEWGL.IndexBuffer = function () {
    var _buffer = null;

    this.setData = function (gl, indices) {
        _buffer = _buffer !== null ? _buffer : this.create(gl);
        this.bind(gl, _buffer);
        
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    };

    this.create = function (gl) {
        return gl.createBuffer();
    };

    this.bind = function (gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _buffer);
    };

    this.getBuffer = function () {
        return _buffer;
    };
};