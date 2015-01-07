LEEWGL.Shader = function () {
    var _shaderContent = null;
    var _program = null;
    
    this.getProgram = function() {
        return _program;
    };
    
    this.init = function (gl, selector) {
        var _vertex = this.getShaderDOM(gl, '#shader-vs');
        var _fragment = this.getShaderDOM(gl, '#shader-fs');

        if (_program === null)
            _program = gl.createProgram();
        
        
        gl.attachShader(_program, _vertex);
        gl.attachShader(_program, _fragment);

        this.linkShader(gl);
        this.use(gl);

        _program.vertexPositionAttribute = gl.getAttribLocation(_program, "aVertexPosition");
        gl.enableVertexAttribArray(_program.vertexPositionAttribute);
        
        _program.vertexColorAttribute = gl.getAttribLocation(_program, "aVertexColor");
        gl.enableVertexAttribArray(_program.vertexColorAttribute);
        
        console.log(gl.getAttribLocation(_program, "aVertexColor"));
        
//        _program.textureCoordAttribute = gl.getAttribLocation(_program, "aTextureCoord");
//        gl.enableVertexAttribArray(_program.textureCoordAttribute);

        _program.projection = gl.getUniformLocation(_program, "uProjection");
        _program.mvp = gl.getUniformLocation(_program, "uMVP");
        _program.sampler = gl.getUniformLocation(_program, "uSampler");
        _program.offscreen = gl.getUniformLocation(_program, "uOffscreen");
    };

    this.getShaderDOM = function (gl, selector) {
        var _script = document.querySelector(selector);
        if (_script === null) {
            console.error("LEEWGL.Shader: No shader with selector " + selector + " found.");
        }

        this.getShaderContentDOM(_script);

        var _shader = null;

        if (_script.type === "x-shader/x-fragment")
            _shader = gl.createShader(gl.FRAGMENT_SHADER);
        else if (_script.type === "x-shader/x-vertex")
            _shader = gl.createShader(gl.VERTEX_SHADER);
        else
            return null;

        gl.shaderSource(_shader, _shaderContent);
        gl.compileShader(_shader);

        if (!gl.getShaderParameter(_shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(_shader));
            return null;
        }

        return _shader;
    };

    this.getShaderContentDOM = function (dom) {
        var _str = '';
        var _k = dom.firstChild;

        _shaderContent = '';
        while (_k) {
            if (_k.nodeType === 3)
                _shaderContent += _k.textContent;
            _k = _k.nextSibling;
        }
    };

    this.linkShader = function (gl) {
        gl.linkProgram(_program);

        if (!gl.getProgramParameter(_program, gl.LINK_STATUS))
            console.error("LEEWGL.Shader: Could not initialise shaders");
    };

    this.use = function (gl) {
        gl.useProgram(_program);
    };
    
    this.setMatrixUniform = function(gl, loc, mat) {
        gl.uniformMatrix4fv(loc, false, mat);
    };
    
    this.setIntegerUniform = function(gl, loc, integer) {
        gl.uniform1i(loc, integer);
    };
};