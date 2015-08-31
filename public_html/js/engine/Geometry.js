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
      },
      enumerable: false,
      writable: true
    }
  });

  this.boundingBox = null;
  this.boundingSphere = null;

  this.facesNum = 1;
  this.faces = [];
  this.vectors = [];

  this.usesTexture = false;
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
 * Sets this.usesTexture
 * @param  {LEEWGL.Texture} texture
 */
LEEWGL.Geometry.prototype.setTexture = function(texture) {
  this.usesTexture = true;
};

/**
 * Calculates tangents and saves them in this.tangents
 */
LEEWGL.Geometry.prototype.calculateTangents = function() {
  for (var i = 0; i < this.vertices.position.length; ++i) {
    this.tangents[i] = 0.0;
  }
};

/**
 * Sets geometry own shader attributes and uniforms and renders the geometry
 * @param  {webGLContext} gl
 * @param  {LEEWGL.Shader} shader
 * @param  {webGLDrawMode} drawMode [description]
 * @param  {bool} indices  - if geometry makes use of indices buffer
 */
LEEWGL.Geometry.prototype.draw = function(gl, shader, drawMode, indices) {
  indices = (typeof indices !== 'undefined') ? indices : true;

  shader.use(gl);

  shader.attributes['aVertexPosition'](this.buffers.position);
  shader.attributes['aVertexNormal'](this.buffers.normal);

  if (this.usesTexture === true) {
    shader.attributes['aTextureCoord'](this.buffers.texture);
    this.components['Texture'].texture.bind(gl);
    this.components['Texture'].texture.setActive(gl, 1);
    shader.uniforms['uSampler'](1);
  } else {
    shader.attributes['aVertexColor'](this.buffers.color);
  }

  var normalMatrix = mat4.create();
  mat4.invert(normalMatrix, this.transform.matrix());
  mat4.transpose(normalMatrix, normalMatrix);

  shader.uniforms['uColorMapColor'](new Float32Array(this.buffers.position.colorMapColor));
  shader.uniforms['uNormalMatrix'](normalMatrix);
  shader.uniforms['uModel'](this.transform.matrix());

  var draw = drawMode;

  if (this.options['wireframe'] === true)
    draw = gl.LINES;

  if (indices === true) {
    this.buffers.indices.bind(gl);
    gl.drawElements(draw, this.indices.length, gl.UNSIGNED_SHORT, 0);
  } else {
    gl.drawArrays(draw, 0, this.vertices.position.length);
  }

  if (this.usesTexture === true)
    this.components['Texture'].texture.unbind(gl, 1);
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
  var faces = this.faces;

  geometry.facesNum = this.facesNum;
  geometry.usesTexture = this.usesTexture;

  geometry.vertices.position = [];
  geometry.vertices.normal = [];
  geometry.vertices.color = [];
  geometry.vertices.uv = [];
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
  for (i = 0; i < this.facesNum; ++i) {
    geometry.faces.push(faces[i]);
  }

  LEEWGL.Buffer.prototype.clone.call(this.buffers.position, geometry.buffers.position);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.normal, geometry.buffers.normal);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.indices, geometry.buffers.indices);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.color, geometry.buffers.color);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.texture, geometry.buffers.texture);

  return geometry;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry
 * @param  {object} options
 */
LEEWGL.Geometry3D = function(options) {
  LEEWGL.Geometry.call(this, options);

  this.options['up'] = vec3.clone(LEEWGL.VECTOR3D.UP);
};

LEEWGL.Geometry3D.prototype = Object.create(LEEWGL.Geometry.prototype);

/**
 * Calculates faces and saves them in this.faces
 * Gets called in constructor of derived classes of Geometry
 */
LEEWGL.Geometry3D.prototype.calculateFaces = function() {
  this.vectors = [];

  var i = 0;

  /// this.vectors saves vector representation of this.vertices.position
  for (i = 0; i < this.vertices.position.length; i += 3) {
    var x = this.vertices.position[i];
    var y = this.vertices.position[i + 1];
    var z = this.vertices.position[i + 2];

    this.vectors.push([x, y, z]);
  }

  for (i = 0; i < this.indices.length; i += 3) {
    var i0 = this.indices[i];
    var i1 = this.indices[i + 1];
    var i2 = this.indices[i + 2];

    var c0 = this.vectors[i0];
    var c1 = this.vectors[i1];
    var c2 = this.vectors[i2];

    this.faces.push([c0, c1, c2]);
  }

  this.facesNum = this.faces.length;
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

  this.lines = this.options['lines'];
  this.dimension = this.options['dimension'];

  this.generate();
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

  this.calculateFaces();
  this.calculateNormals();
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

  this.type = 'Geometry.Triangle';

  var position = [
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    0.0, 1.0, 0.0
  ];

  var uv = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    1.0, 0.0,
    0.5, 0.75
  ];

  var indices = [
    0, 2, 1,
    1, 2, 3,
    0, 1, 4,
    1, 3, 4,
    3, 2, 4,
    2, 0, 4
  ];

  this.setVerticesByType('position', position);
  this.setVerticesByType('uv', uv);
  this.setIndices(indices);

  this.calculateFaces();
  this.calculateNormals();
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

  this.type = 'Geometry.Cube';

  var position = [
    // Front face
    -1.0, -1.0, 1.0, // 0
    1.0, -1.0, 1.0, // 1
    1.0, 1.0, 1.0, // 2
    -1.0, 1.0, 1.0, // 3
    // Back face
    -1.0, -1.0, -1.0, // 4
    -1.0, 1.0, -1.0, // 5
    1.0, 1.0, -1.0, // 6
    1.0, -1.0, -1.0, // 7
    // Top face
    -1.0, 1.0, -1.0, // 8 = 5
    -1.0, 1.0, 1.0, // 9 = 3
    1.0, 1.0, 1.0, // 10 = 2
    1.0, 1.0, -1.0, // 11 = 6
    // Bottom face
    -1.0, -1.0, -1.0, // 12 = 4
    1.0, -1.0, -1.0, // 13 = 7
    1.0, -1.0, 1.0, // 14 = 1
    -1.0, -1.0, 1.0, // 15 = 0
    // Right face
    1.0, -1.0, -1.0, // 16 = 7
    1.0, 1.0, -1.0, // 17 = 6
    1.0, 1.0, 1.0, // 18 = 2
    1.0, -1.0, 1.0, // 19 = 1
    // Left face
    -1.0, -1.0, -1.0, // 20 = 4
    -1.0, -1.0, 1.0, // 21 = 0
    -1.0, 1.0, 1.0, // 22 = 3
     -1.0, 1.0, -1.0  // 23 = 5
  ];

  var uv = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ];

  var indices = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23 // left
  ];

  this.setVerticesByType('position', position);
  this.setVerticesByType('uv', uv);
  this.setIndices(indices);

  this.calculateFaces();
  this.calculateNormals();
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

  this.type = 'Geometry.Sphere';

  var ext_options = {
    'latitude': 10,
    'longitude': 10,
    'radius': 1
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  this.latitude = this.options['latitude'];
  this.longitude = this.options['longitude'];
  this.radius = this.options['radius'];

  this.generate();
  this.calculateFaces();
};

LEEWGL.Geometry3D.Sphere.prototype = Object.create(LEEWGL.Geometry3D.prototype);

LEEWGL.Geometry3D.Sphere.prototype.generate = function() {
  var latNumber, longNumber = 0;

  for (latNumber = 0; latNumber <= this.latitude; latNumber++) {
    var theta = latNumber * Math.PI / this.latitude;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (longNumber = 0; longNumber <= this.longitude; longNumber++) {
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

  for (latNumber = 0; latNumber < this.latitude; latNumber++) {
    for (longNumber = 0; longNumber < this.longitude; longNumber++) {
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
