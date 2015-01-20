LEEWGL.Buffer = function (options) {
    var _buffer = null;
    
    if(options !== undefined && options.picking === true) {
        this.colorMapIndex = LEEWGL.Buffer.ColorMapHitCounter++;
    
        /// calculate color-map color
        this.colorMapColor = [0, 0, 0, 1];
        this.colorMapColor[0] = Math.floor(this.colorMapIndex / 65536) / 256;
        var remainder = this.colorMapIndex % 65536;
        this.colorMapColor[1] = Math.floor(remainder / 256) / 256;
        remainder = this.colorMapIndex % 256;
        this.colorMapColor[2] = remainder / 256;
    }
    
    this.setData = function (gl, vertices, type) {
        _buffer = _buffer !== null ? _buffer : this.create(gl);
        this.bind(gl, _buffer);
        
        var vertProcessed = vertices;
        
        if(typeof vertices[0] === 'object') {
            vertProcessed = [];
            for(var i = 0; i < vertices.length; ++i) {
                var v = vertices[i];
                
                for(var j = 0; j < vertices[0].length; ++j) {
                    vertProcessed = vertProcessed.concat(v);
                }
            }
        }
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertProcessed), gl.STATIC_DRAW);
        
        _buffer.numComponents = type.size;
        _buffer.numItems = vertices.length / type.size;
        _buffer.type = gl.FLOAT;
        _buffer.stride = 0;
        _buffer.offset = 0;
        _buffer.normalize = false;
    };

    this.create = function (gl) {
        _buffer = gl.createBuffer();
        return _buffer;
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

    this.create = function (gl) {
        _buffer = gl.createRenderbuffer();
        return _buffer; 
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
        width = typeof width !== 'undefined' ? width : 512;
        height = typeof height !== 'undefined' ? height : 512;
        
        _buffer = this.create(gl);
        _buffer.width = width;
        _buffer.height = height;
    };
    
    this.create = function (gl) {
        _buffer = gl.createFramebuffer();
        return _buffer;
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

LEEWGL.Buffer.ColorMapHitCounter = 1;

