/**
 * Geometry ecapsulates various basic shapes to render.
 * @constructor
 * @augments LEEWGL.GameObject
 * @param  {bool} options.wireframe
 * @param  {up} options.up - default up vector
 */
LEEWGL.Geometry = function(options) {
  LEEWGL.REQUIRES.push('Geometry');
  LEEWGL.GameObject.call(this, options);

  this.type = 'Geometry';

  var ext_options = {
    'wireframe': false,
    'up': vec2.clone(LEEWGL.VECTOR2D.UP)
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  Object.defineProperties(this, {
    'vertices': {
      value: {
        'position': [],
        'normal': [],
        'color': [],
        'uv': [],
        'tangent': []
      },
      enumerable: true,
      writable: true
    },
    'vectors': {
      value: {
        'position': [],
        'normal': [],
        'color': [],
        'uv': []
      },
      enumerable: true,
      writable: true
    },
    'indices': {
      value: [],
      enumerable: true,
      writable: true
    },
    'buffers': {
      value: {
        'position': new LEEWGL.Buffer({
          'picking': this.options.picking
        }),
        'normal': new LEEWGL.Buffer(),
        'indices': new LEEWGL.IndexBuffer(),
        'color': new LEEWGL.Buffer(),
        'texture': new LEEWGL.Buffer(),
        'tangent': new LEEWGL.Buffer(),
      },
      enumerable: false,
      writable: true
    }
  });

  this.addComponent(new LEEWGL.Component.Renderer());


  /** @inner {LEEWGL.Material} */
  this.material = new LEEWGL.Material();
  /** @inner {number} */
  this.facesNum = 1;
  /** @inner {array} */
  this.faces = [];
  /** @inner {bool} */
  this.usesTexture = false;
  /** @inner {bool} */
  this.usesBumpMap = false;
};

LEEWGL.Geometry.prototype = Object.create(LEEWGL.GameObject.prototype);

/**
 * @param  {string} type
 * @param  {array} vertices
 */
LEEWGL.Geometry.prototype.setVerticesByType = function(type, vertices) {
  this.vertices[type] = [];
  for (var i = 0; i < vertices.length; ++i) {
    this.vertices[type].push(vertices[i]);
  }
};

/**
 * @param  {array} vertices
 */
LEEWGL.Geometry.prototype.setVertices = function(vertices) {
  for (var i = 0; i < vertices.length; ++i) {
    this.vertices.push(vertices[i]);
  }
};

/**
 * @param  {array} vertices
 */
LEEWGL.Geometry.prototype.setIndices = function(indices) {
  for (var i = 0; i < indices.length; ++i) {
    this.indices.push(indices[i]);
  }
};

/**
 * Calls setData method of color buffer
 * @param  {webGLContent} gl
 */
LEEWGL.Geometry.prototype.setColorBuffer = function(gl) {
  this.buffers.color.setData(gl, this.vertices.color, new LEEWGL.BufferInformation.VertexTypePos4());
};

/**
 * @param  {webGLContext} gl
 * @param  {vec4} color
 */
LEEWGL.Geometry.prototype.setColor = function(gl, color) {
  this.vertices.color = [];
  for (var i = 0; i < this.facesNum; ++i) {
    this.vertices.color.push(color);
  }
  this.setColorBuffer(gl);
};
/**
 * Returns geometry render data as json array
 * @return {object}
 */
LEEWGL.Geometry.prototype.renderData = function() {
  var texture = false;
  var bumpMap = false;

  this.usesTexture = false;
  this.usesBumpMap = false;

  if (typeof this.components['Texture'] !== 'undefined') {
    if (this.components['Texture'].initialized === true) {
      texture = this.components['Texture'].texture;
      this.usesTexture = true;
    }
  }
  if (typeof this.components['BumpMap'] !== 'undefined') {
    if (this.components['BumpMap'].initialized === true) {
      bumpMap = this.components['BumpMap'].bumpMap;
      this.usesBumpMap = true;
    }
  }

  var normalMatrix = mat4.create();
  mat4.invert(normalMatrix, this.transform.matrix());
  mat4.transpose(normalMatrix, normalMatrix);

  var attributes = {
    'aVertexPosition': this.buffers.position,
    'aVertexNormal': this.buffers.normal
  };

  var uniforms = {
    'uModel': this.transform.matrix(),
    'uNormalMatrix': normalMatrix
  };

  if (texture === false) {
    attributes['aVertexColor'] = this.buffers.color;
  } else {
    attributes['aTextureCoord'] = this.buffers.texture;
    uniforms['uSampler'] = texture.id;
  }

  if (bumpMap !== false) {
    attributes['aTangent'] = this.buffers.tangent;
    uniforms['uNormalSampler'] = bumpMap.id;
  }

  if (this.picking === true)
    uniforms['uColorMapColor'] = new Float32Array(this.buffers.position.colorMapColor);

  addToJSON(uniforms, this.material.renderData().uniforms);

  return {
    'attributes': attributes,
    'uniforms': uniforms
  };
};

/**
 * Sets geometry own shader attributes and uniforms and renders the geometry
 * @param  {webGLContext} gl
 * @param  {webGLDrawMode} drawMode
 */
LEEWGL.Geometry.prototype.draw = function(gl, drawMode) {
  var indices = (this.indices.length > 0) ? true : false;

  var draw = drawMode;

  if (this.options['wireframe'] === true)
    draw = gl.LINE_STRIP;

  if (this.usesTexture === true) {
    this.components['Texture'].texture.setActive(gl);
    this.components['Texture'].texture.bind(gl);

    if (this.usesBumpMap === true) {
      this.components['BumpMap'].bumpMap.setActive(gl);
      this.components['BumpMap'].bumpMap.bind(gl);
    }
  }

  if (indices === true) {
    this.buffers.indices.bind(gl);
    gl.drawElements(draw, this.indices.length, gl.UNSIGNED_SHORT, 0);
  } else {
    gl.drawArrays(draw, 0, this.vertices.position.length);
  }

  if (this.usesTexture === true) {
    this.components['Texture'].texture.unbind(gl);

    if (this.usesBumpMap === true)
      this.components['BumpMap'].bumpMap.unbind(gl);
  }
};

/**
 * Derived method from LEEWGL.GameObject
 * Calls LEEWGL.GameObject.clone and performs deep copy of this object
 * @param  {LEEWGL.Geometry} geometry
 * @param  {bool} cloneID
 * @param  {bool} addToAlias
 * @return {LEEWGL.Geometry}
 */
LEEWGL.Geometry.prototype.clone = function(geometry, cloneID, recursive, addToAlias) {
  if (typeof geometry === 'undefined')
    geometry = new LEEWGL.Geometry(this.options);

  LEEWGL.GameObject.prototype.clone.call(this, geometry, cloneID, recursive, addToAlias);

  var position = this.vertices.position;
  var normal = this.vertices.normal;
  var color = this.vertices.color;
  var uv = this.vertices.uv;
  var tangent = this.vertices.tangent;
  var vectors = this.vectors;
  var faces = this.faces;

  geometry.facesNum = this.facesNum;
  geometry.usesTexture = this.usesTexture;
  geometry.usesBumpMap = this.usesBumpMap;

  geometry.vertices.position = [];
  geometry.vertices.normal = [];
  geometry.vertices.color = [];
  geometry.vertices.uv = [];
  geometry.vertices.tangent = [];
  geometry.faces = [];

  var i = 0;
  for (i = 0; i < position.length; ++i) {
    geometry.vertices.position.push(position[i]);
  }
  for (i = 0; i < normal.length; ++i) {
    geometry.vertices.normal.push(normal[i]);
  }
  for (i = 0; i < color.length; ++i) {
    geometry.vertices.color.push(color[i]);
  }
  for (i = 0; i < uv.length; ++i) {
    geometry.vertices.uv.push(uv[i]);
  }
  for (i = 0; i < tangent.length; ++i) {
    geometry.vertices.tangent.push(tangent[i]);
  }
  for (i = 0; i < this.facesNum; ++i) {
    geometry.faces.push(faces[i]);
  }

  LEEWGL.Buffer.prototype.clone.call(this.buffers.position, geometry.buffers.position);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.normal, geometry.buffers.normal);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.indices, geometry.buffers.indices);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.color, geometry.buffers.color);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.texture, geometry.buffers.texture);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.tangent, geometry.buffers.tangent);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.bitangent, geometry.buffers.bitangent);

  return geometry;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry
 * @param  {object} options
 */
LEEWGL.Geometry3D = function(options) {
  LEEWGL.Geometry.call(this, options);

  this.type = 'Geometry3D';
  this.options['up'] = vec3.clone(LEEWGL.VECTOR3D.UP);
};

LEEWGL.Geometry3D.prototype = Object.create(LEEWGL.Geometry.prototype);

/**
 * Calculates tangents and saves them in this.tangents
 */
LEEWGL.Geometry3D.prototype.calculateTangents = function() {
  var normals = this.vertices.normal;
  var positions = this.vertices.normal;

  var position = this.vectors.position;
  var normal = this.vectors.normal;
  var uv = this.vectors.uv;
  for (var i = 0; i < positions.length; i += 3) {
    var w = vec3.fromValues(normals[i + 0], normals[i + 1], normals[i + 2]);
    vec3.normalize(w, w);

    var b = vec3.fromValues(0.0, 30.0, 1.0);
    vec3.normalize(b, b);

    var u = vec3.cross(vec3.create(), w, b);
    vec3.normalize(u, u);

    var tangent = [u[0], u[1], u[2]];

    this.vertices.tangent.push(u[0]);
    this.vertices.tangent.push(u[1]);
    this.vertices.tangent.push(u[2]);
  }
};
/**
 * Calculates faces and saves them in this.faces
 * Gets called in constructor of derived classes of Geometry
 */
LEEWGL.Geometry3D.prototype.calculateFaces = function() {
  var i = 0;

  var position = [];
  var normal = [];
  var uv = [];

  for (i = 0; i < this.vertices.position.length; i += 3) {
    var x = this.vertices.position[i + 0];
    var y = this.vertices.position[i + 1];
    var z = this.vertices.position[i + 2];

    position.push([x, y, z]);
  }

  for (i = 0; i < this.vertices.normal.length; i += 3) {
    var x = this.vertices.normal[i + 0];
    var y = this.vertices.normal[i + 1];
    var z = this.vertices.normal[i + 2];

    normal.push([x, y, z]);
  }

  for (i = 0; i < this.vertices.uv.length; i += 2) {
    var u = this.vertices.uv[i + 0];
    var v = this.vertices.uv[i + 1];

    uv.push([u, v]);
  }

  for (i = 0; i < this.indices.length; ++i) {
    var cnt = this.indices[i];
    var vectorPos = position[cnt];
    var vectorNormal = normal[cnt];
    var vectorUV = uv[cnt];
    this.vectors.position.push(vectorPos);
    this.vectors.normal.push(vectorNormal);
    this.vectors.uv.push(vectorUV);
  }

  this.facesNum = this.indices.length / 3;
};

/**
 * Calculates normals and saves them in this.vertices.normal
 * Gets called in constructor of derived classes of Geometry
 */
LEEWGL.Geometry3D.prototype.calculateNormals = function() {
  this.vertices.normal = [];
  var x = 0,
    y = 1,
    z = 2;
  var i = 0;

  for (i = 0; i < this.vertices.position.length; i += 3) {
    this.vertices.normal[i + x] = 0.0;
    this.vertices.normal[i + y] = 0.0;
    this.vertices.normal[i + z] = 0.0;
  }

  for (i = 0; i < this.indices.length; i += 3) {
    var v1 = [],
      v2 = [],
      normal = [];

    /// p2 - p1
    v1[x] = this.vertices.position[3 * this.indices[i + 2] + x] - this.vertices.position[3 * this.indices[i + 1] + x];
    v1[y] = this.vertices.position[3 * this.indices[i + 2] + y] - this.vertices.position[3 * this.indices[i + 1] + y];
    v1[z] = this.vertices.position[3 * this.indices[i + 2] + z] - this.vertices.position[3 * this.indices[i + 1] + z];
    /// p0 - p1
    v2[x] = this.vertices.position[3 * this.indices[i] + x] - this.vertices.position[3 * this.indices[i + 1] + x];
    v2[y] = this.vertices.position[3 * this.indices[i] + y] - this.vertices.position[3 * this.indices[i + 1] + y];
    v2[z] = this.vertices.position[3 * this.indices[i] + z] - this.vertices.position[3 * this.indices[i + 1] + z];

    normal[x] = v1[y] * v2[z] - v1[z] * v2[y];
    normal[y] = v1[z] * v2[x] - v1[x] * v2[z];
    normal[z] = v1[x] * v2[y] - v1[y] * v2[x];
    for (var j = 0; j < 3; ++j) { //update the normals of that triangle: sum of vectors
      this.vertices.normal[3 * this.indices[i + j] + x] = this.vertices.normal[3 * this.indices[i + j] + x] + normal[x];
      this.vertices.normal[3 * this.indices[i + j] + y] = this.vertices.normal[3 * this.indices[i + j] + y] + normal[y];
      this.vertices.normal[3 * this.indices[i + j] + z] = this.vertices.normal[3 * this.indices[i + j] + z] + normal[z];
    }
  }

  /// normalize
  for (i = 0; i < this.vertices.position.length; i += 3) {
    var normalized = [];
    normalized[x] = this.vertices.normal[i + x];
    normalized[y] = this.vertices.normal[i + y];
    normalized[z] = this.vertices.normal[i + z];

    var len = Math.sqrt((normalized[x] * normalized[x]) + (normalized[y] * normalized[y]) + (normalized[z] * normalized[z]));
    if (len === 0)
      len = 1.0;

    normalized[x] = normalized[x] / len;
    normalized[y] = normalized[y] / len;
    normalized[z] = normalized[z] / len;

    this.vertices.normal[i + x] = normalized[x];
    this.vertices.normal[i + y] = normalized[y];
    this.vertices.normal[i + z] = normalized[z];
  }
};

/**
 * Calls setData method for all buffers except color buffer
 * @param  {webGLContent} gl
 * @param  {string} type - to set one distinct buffer
 */
LEEWGL.Geometry3D.prototype.setBuffer = function(gl, type) {
  if (typeof type !== 'undefined') {
    if (type === 'indices')
      this.buffers.indices.setData(gl, this.indices);
    else
      this.buffers[type].setData(gl, this.vertices[type], new LEEWGL.BufferInformation.VertexTypePos3());
  } else {
    this.buffers.position.setData(gl, this.vertices.position, new LEEWGL.BufferInformation.VertexTypePos3());
    this.buffers.normal.setData(gl, this.vertices.normal, new LEEWGL.BufferInformation.VertexTypePos3());
    this.buffers.texture.setData(gl, this.vertices.uv, new LEEWGL.BufferInformation.VertexTypePos2());
    this.buffers.tangent.setData(gl, this.vertices.tangent, new LEEWGL.BufferInformation.VertexTypePos3());
    this.buffers.indices.setData(gl, this.indices);
  }
};

/**
 *
 * Pushes given colors into this.vertices.color and calls setColorBuffer
 * @param  {webGLContent} gl
 * @param  {array} colors
 * @param  {number} length - number of faces
 */
LEEWGL.Geometry3D.prototype.addColor = function(gl, colors, length) {
  length = (typeof length !== 'undefined') ? length : this.facesNum;
  this.vertices.color = [];
  for (var i = 0, j = 0; i < length; ++i, j += 4) {
    this.vertices.color.push([colors[(j + 0) % colors.length], colors[(j + 1) % colors.length], colors[(j + 2) % colors.length], colors[(j + 3) % colors.length]]);
  }
  this.setColorBuffer(gl);
};

/**
 * Derived method from LEEWGL.Geometry
 * Calls LEEWGL.Geometry.clone and performs deep copy of this object
 * @param  {LEEWGL.Geometry3D} geometry
 * @param  {bool} cloneID
 * @param  {bool} addToAlias
 * @return {LEEWGL.Geometry3D}
 */
LEEWGL.Geometry3D.prototype.clone = function(geometry, cloneID, recursive, addToAlias) {
  if (typeof geometry === 'undefined')
    geometry = new LEEWGL.Geometry3D(this.options);

  LEEWGL.Geometry.prototype.clone.call(this, geometry, cloneID, recursive, addToAlias);
  return geometry;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 * @param  {number} options.lines
 * @param  {dimension} options.dimension
 */
LEEWGL.Geometry3D.Grid = function(options) {
  LEEWGL.Geometry3D.call(this, options);

  var ext_options = {
    'lines': 10,
    'dimension': 10
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  this.type = 'Geometry3D.Grid';
  this.lines = this.options['lines'];
  this.dimension = this.options['dimension'];

  this.generate();
  this.calculateNormals();
  this.calculateFaces();

  this.tangents = [];
  this.bitangents = [];
};

LEEWGL.Geometry3D.Grid.prototype = Object.create(LEEWGL.Geometry3D.prototype);

/**
 * Gets called in constructor
 * Fills this.vertices.position and this.indices
 * Calls this.calculateFaces and this.calculateNormals to deliver a renderable object
 */
LEEWGL.Geometry3D.Grid.prototype.generate = function() {
  var increment = 2 * this.dimension / this.lines;

  for (var i = 0; i <= this.lines; ++i) {
    this.vertices.position[6 * i] = -this.dimension;
    this.vertices.position[6 * i + 1] = 0;
    this.vertices.position[6 * i + 2] = -this.dimension + (i * increment);

    this.vertices.position[6 * i + 3] = this.dimension;
    this.vertices.position[6 * i + 4] = 0;
    this.vertices.position[6 * i + 5] = -this.dimension + (i * increment);

    this.vertices.position[6 * (this.lines + 1) + 6 * i] = -this.dimension + (i * increment);
    this.vertices.position[6 * (this.lines + 1) + 6 * i + 1] = 0;
    this.vertices.position[6 * (this.lines + 1) + 6 * i + 2] = -this.dimension;

    this.vertices.position[6 * (this.lines + 1) + 6 * i + 3] = -this.dimension + (i * increment);
    this.vertices.position[6 * (this.lines + 1) + 6 * i + 4] = 0;
    this.vertices.position[6 * (this.lines + 1) + 6 * i + 5] = this.dimension;

    this.indices[2 * i] = 2 * i;
    this.indices[2 * i + 1] = 2 * i + 1;
    this.indices[2 * (this.lines + 1) + 2 * i] = 2 * (this.lines + 1) + 2 * i;
    this.indices[2 * (this.lines + 1) + 2 * i + 1] = 2 * (this.lines + 1) + 2 * i + 1;
  }

};
/**
 * Derived from LEEWGL.Geometry3D
 * @param  {LEEWGL.Geometry3D.Grid} grid
 * @param  {bool} cloneID
 * @param  {bool} addToAlias
 * @return {LEEWGL.Geometry3D.Grid}
 */
LEEWGL.Geometry3D.Grid.prototype.clone = function(grid, cloneID, recursive, addToAlias) {
  if (typeof grid === 'undefined')
    grid = new LEEWGL.Geometry3D.Grid(this.options);

  LEEWGL.Geometry3D.prototype.clone.call(this, grid, cloneID, recursive, addToAlias);

  grid.lines = this.lines;
  grid.dimension = this.dimension;

  return grid;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 * @param  {object} options
 */
LEEWGL.Geometry3D.Triangle = function(options) {
  LEEWGL.Geometry3D.call(this, options);

  this.type = 'Geometry3D.Triangle';

  /// FIXME:40 one position
  var position = [
    // front face
    0.0, 1.0, 0.0, //
    -1.0, -1.0, 1.0, //
    1.0, -1.0, 1.0, //
    // right face
    0.0, 1.0, 0.0, //
    1.0, -1.0, 1.0, //
    1.0, -1.0, -1.0, //
    // back face
    0.0, 1.0, 0.0, //
    1.0, -1.0, -1.0, //
    -1.0, -1.0, -1.0, //
    // left face
    0.0, 1.0, 0.0, //
    -1.0, -1.0, -1.0, //
    -1.0, -1.0, 1.0, //
    // bottom face
    -1.0, -1.0, -1.0, //
    1.0, -1.0, -1.0, //
    1.0, -1.0, 1.0, //
    -1.0, -1.0, 1.0 //
  ];
  var uv = [
    // front face
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    // right face
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    // back face
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    // left face
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    // bottom face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  var indices = [
    0, 1, 2,
    3, 4, 5,
    6, 7, 8,
    9, 10, 11,
    12, 13, 14, 12, 14, 15
  ];

  this.setVerticesByType('position', position);
  this.setVerticesByType('uv', uv);
  this.setIndices(indices);

  this.calculateNormals();
  this.calculateFaces();
  this.calculateTangents();
};

LEEWGL.Geometry3D.Triangle.prototype = Object.create(LEEWGL.Geometry3D.prototype);

LEEWGL.Geometry3D.Triangle.prototype.intersectRay = function(origin, direction, collision, distance, segmentationMax) {
  var plane = new LEEWGL.Geometry3D.Plane();
  vec3.set(plane.x, this.x);
  vec3.set(plane.y, this.y);
  vec3.set(plane.z, this.z);

  var denom = vec3.dot(plane.normal, direction);
  if (Math.abs(denom) < Math.EPSILON)
    return false;

  var t = -(plane.distance + vec3.dot(plane.normal, origin)) / denom;
  if (t <= 0)
    return false;

  if (segmentationMax !== undefined && t > segmentationMax)
    return false;

  vec3.set(collision, direction);
  vec3.scale(collision, collision, t);
  vec3.add(collision, origin, collision);

  if (this.pointInTriangle(collision)) {
    collision[3] = t;
    return true;
  }

  return false;
};

LEEWGL.Geometry3D.Triangle.prototype.import = function(stringified_json) {
  var json = JSON.parse(stringified_json);
  var triangle = new LEEWGL.Geometry3D.Triangle(json);

  return triangle;
};

/**
 * Derived from LEEWGL.Geometry3D
 * @param  {LEEWGL.Geometry3D.Triangle} triangle
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.Geometry3D.Triangle}
 */
LEEWGL.Geometry3D.Triangle.prototype.clone = function(triangle, cloneID, recursive, addToAlias) {
  if (typeof triangle === 'undefined')
    triangle = new LEEWGL.Geometry3D.Triangle(this.options);

  LEEWGL.Geometry3D.prototype.clone.call(this, triangle, cloneID, recursive, addToAlias);

  return triangle;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 * @param  {object} options
 */
LEEWGL.Geometry3D.Cube = function(options) {
  LEEWGL.Geometry3D.call(this, options);

  this.type = 'Geometry3D.Cube';

  var position = [
    // front face
    -1.0, -1.0, 1.0, //
    1.0, -1.0, 1.0, //
    1.0, 1.0, 1.0, //
    -1.0, 1.0, 1.0, //
    // back face
    -1.0, -1.0, -1.0, //
    -1.0, 1.0, -1.0, //
    1.0, 1.0, -1.0, //
    1.0, -1.0, -1.0, //
    // top face
    -1.0, 1.0, -1.0, //
    -1.0, 1.0, 1.0, //
    1.0, 1.0, 1.0, //
    1.0, 1.0, -1.0, //
    // bottom face
    -1.0, -1.0, -1.0, //
    1.0, -1.0, -1.0, //
    1.0, -1.0, 1.0, //
    -1.0, -1.0, 1.0, //
    // right face
    1.0, -1.0, -1.0, //
    1.0, 1.0, -1.0, //
    1.0, 1.0, 1.0, //
    1.0, -1.0, 1.0, //
    // left face
    -1.0, -1.0, -1.0, //
    -1.0, -1.0, 1.0, //
    -1.0, 1.0, 1.0, //
    -1.0, 1.0, -1.0, //
  ];

  var uv = [
    // front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    // top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    // bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    // right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    // left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  var indices = [
    0, 1, 2, 0, 2, 3, // front face
    4, 5, 6, 4, 6, 7, // back face
    8, 9, 10, 8, 10, 11, // top face
    12, 13, 14, 12, 14, 15, // bottom face
    16, 17, 18, 16, 18, 19, // right face
    20, 21, 22, 20, 22, 23 // left face
  ];

  this.setVerticesByType('position', position);
  this.setVerticesByType('uv', uv);
  this.setIndices(indices);

  this.calculateNormals();
  this.calculateFaces();
  this.calculateTangents();
};

LEEWGL.Geometry3D.Cube.prototype = Object.create(LEEWGL.Geometry3D.prototype);

/**
 * Derived from LEEWGL.Geometry3D
 * @param  {LEEWGL.Geometry3D.Cube} cube
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.Geometry3D.Cube}
 */
LEEWGL.Geometry3D.Cube.prototype.clone = function(cube, cloneID, recursive, addToAlias) {
  if (typeof cube === 'undefined')
    cube = new LEEWGL.Geometry3D.Cube(this.options);
  LEEWGL.Geometry3D.prototype.clone.call(this, cube, cloneID, recursive, addToAlias);
  return cube;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry3D
 * @param  {number} options.latitude
 * @param  {number} options.longitude
 * @param  {number} options.radius
 */
LEEWGL.Geometry3D.Sphere = function(options) {
  LEEWGL.Geometry3D.call(this, options);

  var ext_options = {
    'latitude': 10,
    'longitude': 10,
    'radius': 1
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  this.type = 'Geometry3D.Sphere';
  this.latitude = this.options['latitude'];
  this.longitude = this.options['longitude'];
  this.radius = this.options['radius'];

  this.generate();
  this.calculateFaces();
  this.calculateTangents();
};

LEEWGL.Geometry3D.Sphere.prototype = Object.create(LEEWGL.Geometry3D.prototype);

LEEWGL.Geometry3D.Sphere.prototype.generate = function() {
  var latNumber, longNumber = 0;

  for (latNumber = 0; latNumber <= this.latitude; ++latNumber) {
    var theta = latNumber * Math.PI / this.latitude;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (longNumber = 0; longNumber <= this.longitude; ++longNumber) {
      var phi = longNumber * 2 * Math.PI / this.longitude;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (longNumber / this.longitude);
      var v = 1 - (latNumber / this.latitude);

      this.vertices.normal.push(x);
      this.vertices.normal.push(y);
      this.vertices.normal.push(z);
      this.vertices.uv.push(u);
      this.vertices.uv.push(v);
      this.vertices.position.push(this.radius * x);
      this.vertices.position.push(this.radius * y);
      this.vertices.position.push(this.radius * z);
    }
  }

  for (latNumber = 0; latNumber < this.latitude; ++latNumber) {
    for (longNumber = 0; longNumber < this.longitude; ++longNumber) {
      var first = (latNumber * (this.longitude + 1)) + longNumber;
      var second = first + this.longitude + 1;

      this.indices.push(first);
      this.indices.push(second);
      this.indices.push(first + 1);

      this.indices.push(second);
      this.indices.push(second + 1);
      this.indices.push(first + 1);
    }
  }
};
/**
 * Derived from LEEWGL.Geometry3D
 * @param  {LEEWGL.Geometry3D.Sphere} sphere
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.Geometry3D.Sphere}
 */
LEEWGL.Geometry3D.Sphere.prototype.clone = function(sphere, cloneID, recursive, addToAlias) {
  if (typeof sphere === 'undefined')
    sphere = new LEEWGL.Geometry3D.Sphere(this.options);

  LEEWGL.Geometry3D.prototype.clone.call(this, sphere, cloneID, recursive, addToAlias);

  sphere.latitude = this.latitude;
  sphere.longitude = this.longitude;
  sphere.radius = this.radius;
  return sphere;
};
