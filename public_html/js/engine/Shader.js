LEEWGL.Shader = function () {
    var _shaderContent = null;
    var _program = null;

    this.uniforms = [];
    this.attributes = [];

    this.getProgram = function () {
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

    this.createUniformSetters = function (gl) {
        var createUniformSetter = function (gl, uniform) {
            var isArray = (uniform.size > 1 && uniform.name.substr(-3) === '[0]') ? true : false;
            var type = uniform.type;
            var loc = gl.getUniformLocation(_program, uniform.name);

            if (type === gl.FLOAT && isArray)
                return function (v) {
                    gl.uniform1fv(loc, v);
                };
            if (type === gl.FLOAT)
                return function (v) {
                    gl.uniform1f(loc, v);
                };
            if (type === gl.FLOAT_VEC2)
                return function (v) {
                    gl.uniform2fv(loc, v);
                };
            if (type === gl.FLOAT_VEC3)
                return function (v) {
                    gl.uniform3fv(loc, v);
                };
            if (type === gl.FLOAT_VEC4)
                return function (v) {
                    gl.uniform4fv(loc, v);
                };
            if (type === gl.INT && isArray)
                return function (v) {
                    gl.uniform1iv(loc, v);
                };
            if (type === gl.INT)
                return function (v) {
                    gl.uniform1i(loc, v);
                };
            if (type === gl.INT_VEC2)
                return function (v) {
                    gl.uniform2iv(loc, v);
                };
            if (type === gl.INT_VEC3)
                return function (v) {
                    gl.uniform3iv(loc, v);
                };
            if (type === gl.INT_VEC4)
                return function (v) {
                    gl.uniform4iv(loc, v);
                };
            if (type === gl.BOOL)
                return function (v) {
                    gl.uniform1iv(loc, v);
                };
            if (type === gl.BOOL_VEC2)
                return function (v) {
                    gl.uniform2iv(loc, v);
                };
            if (type === gl.BOOL_VEC3)
                return function (v) {
                    gl.uniform3iv(loc, v);
                };
            if (type === gl.BOOL_VEC4)
                return function (v) {
                    gl.uniform4iv(loc, v);
                };
            if (type === gl.FLOAT_MAT2)
                return function (v) {
                    gl.uniformMatrix2fv(loc, false, v);
                };
            if (type === gl.FLOAT_MAT3)
                return function (v) {
                    gl.uniformMatrix3fv(loc, false, v);
                };
            if (type === gl.FLOAT_MAT4)
                return function (v) {
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

    this.createAttributeSetters = function (gl) {
        var createAttributeSetter = function (index) {
            return function (buffer) {
                var webglBuffer = buffer.getBuffer();
                buffer.bind(gl);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(index, webglBuffer.numComponents, gl.FLOAT, false, 0, 0);
            };
        };

        var numAttributes = gl.getProgramParameter(_program, gl.ACTIVE_ATTRIBUTES);
        
        for (var i = 0; i < numAttributes; ++i) {
            var attributeInfo = gl.getActiveAttrib(_program, i);
            if(!attributeInfo)
                break;
            
            var index = gl.getAttribLocation(_program, attributeInfo.name);
            this.attributes[attributeInfo.name] = createAttributeSetter(index);
        }
    };
};