LEEWGL.Shader = function() {
    var _program = null;

    this.uniforms = [];
    this.attributes = [];

    this.getProgram = function() {
        return _program;
    };

    this.compile = function(gl, type, code) {
        var _shader = null;
        if (type === LEEWGL.Shader.FRAGMENT) {
            _shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type === LEEWGL.Shader.VERTEX) {
            _shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            console.error('LEEWGL.Shader.addShader(): unknown type given');
            return null;
        }

        gl.shaderSource(_shader, code);
        gl.compileShader(_shader);
        if (!gl.getShaderParameter(_shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(_shader));
            return null;
        }

        return _shader;
    };

    this.getShaderDOM = function(gl, selector) {
        var _script = document.querySelector(selector);
        if (_script === null) {
            console.error("LEEWGL.Shader: No shader with selector " + selector + " found.");
        }

        return this.getShaderContentDOM(_script);
    };

    this.getShaderContentDOM = function(dom) {
        var _str = '';
        var _k = dom.firstChild;
        var _content = '';
        while (_k) {
            if (_k.nodeType === 3)
                _content += _k.textContent;
            _k = _k.nextSibling;
        }

        return _content;
    };
    this.linkShader = function(gl) {
        gl.linkProgram(_program);
        if (!gl.getProgramParameter(_program, gl.LINK_STATUS))
            console.error("LEEWGL.Shader: Could not initialise shaders");
    };
    this.use = function(gl) {
        gl.useProgram(_program);
    };

    this.createShaderFromCode = function(gl, type, code) {
        if (_program === null)
            _program = gl.createProgram();

        var _shader = this.compile(gl, type, code);
        gl.attachShader(_program, _shader);
    };

    this.createShaderFromDOM = function(gl, type, selector) {
        if (_program === null)
            _program = gl.createProgram();

        var _shader = this.compile(gl, type, code);
        gl.attachShader(_program, _shader);
    };

    this.createUniformSetters = function(gl) {
        var createUniformSetter = function(gl, uniform) {
            var isArray = (uniform.size > 1 && uniform.name.substr(-3) === '[0]') ? true : false;
            var type = uniform.type;
            var loc = gl.getUniformLocation(_program, uniform.name);

            if (type === gl.FLOAT && isArray)
                return function(v) {
                    gl.uniform1fv(loc, v);
                };
            if (type === gl.FLOAT)
                return function(v) {
                    gl.uniform1f(loc, v);
                };
            if (type === gl.FLOAT_VEC2)
                return function(v) {
                    gl.uniform2fv(loc, v);
                };
            if (type === gl.FLOAT_VEC3)
                return function(v) {
                    gl.uniform3fv(loc, v);
                };
            if (type === gl.FLOAT_VEC4)
                return function(v) {
                    gl.uniform4fv(loc, v);
                };
            if (type === gl.INT && isArray)
                return function(v) {
                    gl.uniform1iv(loc, v);
                };
            if (type === gl.INT)
                return function(v) {
                    gl.uniform1i(loc, v);
                };
            if (type === gl.INT_VEC2)
                return function(v) {
                    gl.uniform2iv(loc, v);
                };
            if (type === gl.INT_VEC3)
                return function(v) {
                    gl.uniform3iv(loc, v);
                };
            if (type === gl.INT_VEC4)
                return function(v) {
                    gl.uniform4iv(loc, v);
                };
            if (type === gl.BOOL)
                return function(v) {
                    gl.uniform1iv(loc, v);
                };
            if (type === gl.BOOL_VEC2)
                return function(v) {
                    gl.uniform2iv(loc, v);
                };
            if (type === gl.BOOL_VEC3)
                return function(v) {
                    gl.uniform3iv(loc, v);
                };
            if (type === gl.BOOL_VEC4)
                return function(v) {
                    gl.uniform4iv(loc, v);
                };
            if (type === gl.FLOAT_MAT2)
                return function(v) {
                    gl.uniformMatrix2fv(loc, false, v);
                };
            if (type === gl.FLOAT_MAT3)
                return function(v) {
                    gl.uniformMatrix3fv(loc, false, v);
                };
            if (type === gl.FLOAT_MAT4)
                return function(v) {
                    gl.uniformMatrix4fv(loc, false, v);
                };
        };

        var numUniforms = gl.getProgramParameter(_program, gl.ACTIVE_UNIFORMS);

        for (var i = 0; i < numUniforms; ++i) {
            var uniformInfo = gl.getActiveUniform(_program, i);
            if (!uniformInfo)
                break;

            var name = uniformInfo.name;
            /// remove array suffix
            if (name.substr(-3) === '[0]')
                name = name.substr(0, name.length - 3);

            var setter = createUniformSetter(gl, uniformInfo);
            this.uniforms[name] = setter;
        }

        return this.uniforms;
    };

    this.createAttributeSetters = function(gl) {
        var createAttributeSetter = function(index) {
            return function(buffer) {
                var webglBuffer = buffer.getBuffer();
                buffer.bind(gl);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(index, webglBuffer.numComponents, gl.FLOAT, false, 0, 0);
            };
        };

        var numAttributes = gl.getProgramParameter(_program, gl.ACTIVE_ATTRIBUTES);

        for (var i = 0; i < numAttributes; ++i) {
            var attributeInfo = gl.getActiveAttrib(_program, i);
            if (!attributeInfo)
                break;

            var index = gl.getAttribLocation(_program, attributeInfo.name);
            this.attributes[attributeInfo.name] = createAttributeSetter(index);
        }
    };
};

LEEWGL.Shader.VERTEX = "x-shader/x-vertex";
LEEWGL.Shader.FRAGMENT = "x-shader/x-fragment";
