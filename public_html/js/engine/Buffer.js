LEEWGL.Buffer = function(options) {
    this.buffer;

    if (options !== undefined && options.picking === true) {
        this.colorMapIndex = LEEWGL.Buffer.ColorMapHitCounter++;

        /// calculate color-map color
        this.colorMapColor = [0, 0, 0, 1];
        this.colorMapColor[0] = Math.floor(this.colorMapIndex / 65536) / 256;
        var remainder = this.colorMapIndex % 65536;
        this.colorMapColor[1] = Math.floor(remainder / 256) / 256;
        remainder = this.colorMapIndex % 256;
        this.colorMapColor[2] = remainder / 256;
    }
};

LEEWGL.Buffer.prototype = {
    constructor: LEEWGL.Buffer,

    setData: function(gl, vertices, type) {
        this.buffer = (typeof this.buffer !== 'undefined') ? this.buffer : this.create(gl);
        this.bind(gl, this.buffer);

        var vertProcessed = vertices;

        if (typeof vertices[0] === 'object') {
            vertProcessed = [];
            for (var i = 0; i < vertices.length; ++i) {
                var v = vertices[i];

                for (var j = 0; j < vertices[0].length; ++j) {
                    vertProcessed = vertProcessed.concat(v);
                }
            }
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertProcessed), gl.STATIC_DRAW);

        this.buffer.numComponents = type.size;
        this.buffer.numItems = vertices.length / type.size;
        this.buffer.type = gl.FLOAT;
        this.buffer.stride = 0;
        this.buffer.offset = 0;
        this.buffer.normalize = false;
    },

    create: function(gl) {
        this.buffer = gl.createBuffer();
        return this.buffer;
    },

    bind: function(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    },

    unbind: function(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    },

    getBuffer: function() {
        return this.buffer;
    },

    clone: function(buffer) {
        if (typeof buffer === 'undefined')
            buffer = new LEEWGL.Buffer();

        buffer.buffer = this.buffer;

        return buffer;
    }
};

LEEWGL.RenderBuffer = function() {
    LEEWGL.Buffer.call(this);
};

LEEWGL.RenderBuffer.prototype = Object.create(LEEWGL.Buffer.prototype);

LEEWGL.RenderBuffer.prototype.create = function(gl) {
    this.buffer = gl.createRenderbuffer();
    return this.buffer;
};

LEEWGL.RenderBuffer.prototype.setStorage = function(gl, width, height) {
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
};

LEEWGL.RenderBuffer.prototype.bind = function(gl) {
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.buffer);
};

LEEWGL.RenderBuffer.prototype.unbind = function(gl) {
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

LEEWGL.FrameBuffer = function(gl, options) {
    LEEWGL.Buffer.call(this);
};

LEEWGL.FrameBuffer.prototype = Object.create(LEEWGL.Buffer.prototype);

LEEWGL.FrameBuffer.prototype.create = function(gl, width, height) {
    width = typeof width !== 'undefined' ? width : 512;
    height = typeof height !== 'undefined' ? height : 512;

    this.buffer = gl.createFramebuffer();
    this.bind(gl);
    this.buffer.width = width;
    this.buffer.height = height;

    return this.buffer;
};

LEEWGL.FrameBuffer.prototype.bind = function(gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
};

LEEWGL.FrameBuffer.prototype.unbind = function(gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

LEEWGL.IndexBuffer = function() {
    LEEWGL.Buffer.call(this);
};

LEEWGL.IndexBuffer.prototype = Object.create(LEEWGL.Buffer.prototype);

LEEWGL.IndexBuffer.prototype.setData = function(gl, indices) {
    this.buffer = (typeof this.buffer !== 'undefined') ? this.buffer : this.create(gl);
    this.bind(gl, this.buffer);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
};

LEEWGL.IndexBuffer.prototype.bind = function(gl) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
};

LEEWGL.IndexBuffer.prototype.unbind = function(gl) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};


LEEWGL.Buffer.ColorMapHitCounter = 1;
