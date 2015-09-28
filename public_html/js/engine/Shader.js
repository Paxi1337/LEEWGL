LEEWGL.REQUIRES.push('Shader');

/**
 * @constructor
 */
LEEWGL.Shader = function() {
  Object.defineProperties(this, {
    'program': {
      value: null,
      enumerable: false,
      writable: true
    },
    'uniforms': {
      value: {},
      enumerable: false,
      writable: true
    },
    'attributes': {
      value: {},
      enumerable: false,
      writable: true
    },
    'code': {
      value: {},
      enumerable: true,
      writable: true
    }
  });
};

LEEWGL.Shader.prototype = {
  constructor: LEEWGL.Shader,

  /**
   * @return {webGLProgram}
   */
  getProgram: function() {
    return this.program;
  },
  /**
   * @param  {webGLContext} gl
   * @param  {string} type
   * @param  {string} code
   * @return {webGLShader} shader
   */
  compile: function(gl, type, code) {
    var _shader = null;
    if (type === LEEWGL.Shader.FRAGMENT) {
      _shader = gl.createShader(gl.FRAGMENT_SHADER);
      this.code.fragment = code;
    } else if (type === LEEWGL.Shader.VERTEX) {
      _shader = gl.createShader(gl.VERTEX_SHADER);
      this.code.vertex = code;
    } else {
      console.error('LEEWGL.Shader.compile(): unknown type given');
      return null;
    }

    gl.shaderSource(_shader, code);
    gl.compileShader(_shader);
    if (!gl.getShaderParameter(_shader, gl.COMPILE_STATUS)) {
      console.log(_shader);
      console.error('LEEWGL.Shader.compile(): compile error: ' + gl.getShaderInfoLog(_shader));
      return null;
    }
    return _shader;
  },
  /**
   * @param {webGLContext} gl
   * @param {string} selector
   * @return {string}
   */
  getShaderDOM: function(gl, selector) {
    var _script = document.querySelector(selector);
    if (_script === null) {
      console.error("LEEWGL.Shader.getShaderDOM(): No shader with selector " + selector + " found.");
    }

    return this.getShaderContentDOM(_script);
  },
  /**
   * @param {DOMElement} dom
   * @return {string}
   */
  getShaderContentDOM: function(dom) {
    var _str = '';
    var _k = dom.firstChild;
    var _content = '';
    while (_k) {
      if (_k.nodeType === 3)
        _content += _k.textContent;
      _k = _k.nextSibling;
    }

    return _content;
  },
  /**
   * @param {webGLContext} gl
   */
  linkShader: function(gl) {
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
      console.error("LEEWGL.Shader.linkShader(): Could not initialise shaders");
  },
  /**
   * @param  {webGLContext} gl
   */
  use: function(gl) {
    gl.useProgram(this.program);
  },
  /**
   * @param {webGLContext} gl
   * @param {string} type
   * @param {string} code
   */
  createShaderFromCode: function(gl, type, code) {
    if (this.program === null)
      this.program = gl.createProgram();

    var _shader = this.compile(gl, type, code);
    gl.attachShader(this.program, _shader);
  },
  /**
   * @param {webGLContext} gl
   * @param {string} type
   * @param {string} selector
   */
  createShaderFromDOM: function(gl, type, selector) {
    if (this.program === null)
      this.program = gl.createProgram();

    var _shader = this.compile(gl, type, code);
    gl.attachShader(this.program, _shader);
  },
  /**
   * Fills the object uniforms with the functions to set shader uniforms
   * @param {webGLContext} gl
   * @return {Array} this.uniforms
   */
  createUniformSetters: function(gl) {
    var that = this;

    /**
     * @param {webGLContext} gl
     * @param {webGLUniformInfo} uniform
     * @return {function}
     */
    var createUniformSetter = function(gl, uniform) {
      var isArray = (uniform.size > 1 && uniform.name.substr(-3) === '[0]') ? true : false;
      var type = uniform.type;
      var loc = gl.getUniformLocation(that.program, uniform.name);

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
      if (type === gl.INT || type === gl.SAMPLER_2D)
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

    var numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);

    for (var i = 0; i < numUniforms; ++i) {
      var uniformInfo = gl.getActiveUniform(this.program, i);
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
  },
  /**
   * Fills the object attributes with the functions to set shader attributes
   * @param {webGLContext} gl
   * @return {Array} this.attributes
   */
  createAttributeSetters: function(gl) {
    /**
     * @param {number} index
     * @return {function}
     */
    var createAttributeSetter = function(index) {
      return function(buffer) {
        var webglBuffer = buffer.getBuffer();
        buffer.bind(gl);
        gl.enableVertexAttribArray(index);
        gl.vertexAttribPointer(index, webglBuffer.numComponents, gl.FLOAT, false, 0, 0);
      };
    };

    var numAttributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);

    for (var i = 0; i < numAttributes; ++i) {
      var attributeInfo = gl.getActiveAttrib(this.program, i);
      if (!attributeInfo)
        break;

      var index = gl.getAttribLocation(this.program, attributeInfo.name);
      this.attributes[attributeInfo.name] = createAttributeSetter(index);
    }

    return this.attributes;
  },
  /**
   * Creates a deep copy of the object
   * @param  {LEEWGL.Shader} shader
   * @return {LEEWGL.Shader}
   */
  clone: function(shader) {
    if (typeof shader === 'undefined')
      shader = new LEEWGL.Shader();

    shader.program = this.program;
    shader.code = this.code;

    var name = null;

    for (name in this.uniforms) {
      if (this.uniforms.hasOwnProperty(name)) {
        shader.uniforms[name] = this.uniforms[name];
      }
    }
    for (name in this.attributes) {
      if (this.attributes.hasOwnProperty(name)) {
        shader.attributes[name] = this.attributes[name];
      }
    }

    return shader;
  }
};

/**
 * Shader Types
 */
LEEWGL.Shader.VERTEX = "x-shader/x-vertex";
LEEWGL.Shader.FRAGMENT = "x-shader/x-fragment";
