/**
 * Geometry ecapsulates various basic shapes to render.
 * @constructor
 * @augments LEEWGL.Object3D
 * @param  {object} options.vertices
 * @param  {array} options.vertices.position
 * @param  {array} options.vertices.normal
 * @param  {array} options.vertices.color
 * @param  {array} options.vertices.uv
 * @param  {array} options.indices
 * @param  {array} options.tangents
 * @param  {bool} options.wireframe
 */
LEEWGL.Geometry = function(options) {
  LEEWGL.REQUIRES.push('Geometry');
  LEEWGL.Object3D.call(this, options);

  this.type = 'Geometry';
  var ext_options = {
    'vertices': {
      'position': [],
      'normal': [],
      'color': [],
      'uv': []
    },
    'indices': [],
    'tangents': [],
    'wireframe': false
  };

  this.addOptions(ext_options);
  this.setOptions(options);

  Object.defineProperties(this, {
    'vertices': {
      value: this.options.vertices,
      enumerable: true,
      writable: true
    },
    'indices': {
      value: this.options.indices,
      enumerable: true,
      writable: true
    },
    'buffers': {
      value: {
        'vertex': new LEEWGL.Buffer({
          'picking': this.options.picking
        }),
        'normal': new LEEWGL.Buffer(),
        'index': new LEEWGL.IndexBuffer(),
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

  this.texture = undefined;
  this.usesTexture = false;
};

LEEWGL.Geometry.prototype = Object.create(LEEWGL.Object3D.prototype);

/**
 * @param  {array} vertices
 */
LEEWGL.Geometry.prototype.setVertices = function(vertices) {
  for (var i = 0; i < vertices.length; ++i) {
    this.vertices.push(vertices[i]);
  }
};

/**
 * Calculates faces and saves them in this.faces
 * Gets called in constructor of derived classes of Geometry
 */
LEEWGL.Geometry.prototype.calculateFaces = function() {
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
LEEWGL.Geometry.prototype.calculateNormals = function() {
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
 * Calculates tangents and saves them in this.tangents
 */
LEEWGL.Geometry.prototype.calculateTangents = function() {
  for (var i = 0; i < this.vertices.position.length; ++i) {
    this.tangents[i] = 0.0;
  }
};

/**
 * Calls setData method for all buffers except color buffer
 * @param  {webGLContent} gl
 */
LEEWGL.Geometry.prototype.setBuffer = function(gl) {
  this.buffers.vertex.setData(gl, this.vertices.position, new LEEWGL.BufferInformation.VertexTypePos3());
  this.buffers.normal.setData(gl, this.vertices.normal, new LEEWGL.BufferInformation.VertexTypePos3());
  this.buffers.texture.setData(gl, this.vertices.uv, new LEEWGL.BufferInformation.VertexTypePos2());
  this.buffers.index.setData(gl, this.indices);
};

/**
 * Calls setData method of color buffer
 * @param  {webGLContent} gl
 */
LEEWGL.Geometry.prototype.setColorBuffer = function(gl) {
  this.buffers.color.setData(gl, this.vertices.color, new LEEWGL.BufferInformation.VertexTypePos4());
};

/**
 *
 * Pushes given colors into this.vertices.color and calls setColorBuffer
 * @param  {webGLContent} gl
 * @param  {array} colors
 * @param  {number} length - number of faces
 */
LEEWGL.Geometry.prototype.addColor = function(gl, colors, length) {
  length = (typeof length !== 'undefined') ? length : this.facesNum;
  this.vertices.color = [];
  for (var i = 0, j = 0; i < length; ++i, j += 4) {
    this.vertices.color.push([colors[(j + 0) % colors.length], colors[(j + 1) % colors.length], colors[(j + 2) % colors.length], colors[(j + 3) % colors.length]]);
  }
  this.setColorBuffer(gl);
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
 * Sets this.usesTexture and this.texture to given texture
 * @param  {LEEWGL.Texture} texture
 */
LEEWGL.Geometry.prototype.setTexture = function(texture) {
  this.texture = texture;
  this.usesTexture = true;
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

  shader.attributes['aVertexPosition'](this.buffers.vertex);
  shader.attributes['aVertexNormal'](this.buffers.normal);

  if (this.usesTexture === true) {
    shader.attributes['aTextureCoord'](this.buffers.texture);
    this.components['Texture'].texture.setActive(gl, 0);
    this.components['Texture'].texture.bind(gl);
    shader.uniforms['uSampler'](0);
  } else {
    shader.attributes['aVertexColor'](this.buffers.color);
  }

  var normalMatrix = mat4.create();
  mat4.invert(normalMatrix, this.transform.matrix());
  mat4.transpose(normalMatrix, normalMatrix);

  shader.uniforms['uColorMapColor'](new Float32Array(this.buffers.vertex.colorMapColor));
  shader.uniforms['uNormalMatrix'](normalMatrix);
  shader.uniforms['uModel'](this.transform.matrix());

  var draw = drawMode;

  if (this.options['wireframe'] === true)
    draw = gl.LINES;

  if (indices === true) {
    this.buffers.index.bind(gl);
    gl.drawElements(draw, this.indices.length, gl.UNSIGNED_SHORT, 0);
  } else {
    gl.drawArrays(draw, this.vertices.position.length, 0);
  }

  if (this.usesTexture === true)
    this.components['Texture'].texture.unbind(gl, 0);
};

/**
 * Derived method from LEEWGL.Object3D
 * Calls LEEWGL.Object3D.clone and performs deep copy of this object
 * @param  {LEEWGL.Geometry} geometry
 * @param  {bool} cloneID
 * @param  {bool} addToAlias
 * @return {LEEWGL.Geometry}
 */
LEEWGL.Geometry.prototype.clone = function(geometry, cloneID, recursive, addToAlias) {
  if (typeof geometry === 'undefined') {
    geometry = new LEEWGL.Geometry();
  }
  LEEWGL.Object3D.prototype.clone.call(this, geometry, cloneID, recursive, addToAlias);

  geometry.facesNum = this.facesNum;

  var position = this.vertices.position;
  var normal = this.vertices.normal;
  var color = this.vertices.color;
  var uv = this.vertices.uv;
  var faces = this.faces;

  geometry.facesNum = this.facesNum;

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

  LEEWGL.Buffer.prototype.clone.call(this.buffers.vertex, geometry.buffers.vertex);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.normal, geometry.buffers.normal);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.index, geometry.buffers.index);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.color, geometry.buffers.color);
  LEEWGL.Buffer.prototype.clone.call(this.buffers.texture, geometry.buffers.texture);

  return geometry;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry
 * @param  {number} options.lines
 * @param  {dimension} options.dimension
 */
LEEWGL.Geometry.Grid = function(options) {
  LEEWGL.Geometry.call(this, options);

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

LEEWGL.Geometry.Grid.prototype = Object.create(LEEWGL.Geometry.prototype);

/**
 * Gets called in constructor
 * Fills this.vertices.position and this.indices
 * Calls this.calculateFaces and this.calculateNormals to deliver a renderable object
 */
LEEWGL.Geometry.Grid.prototype.generate = function() {
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
 * Derived from LEEWGL.Geometry
 * @param  {LEEWGL.Geometry.Grid} grid
 * @param  {bool} cloneID
 * @param  {bool} addToAlias
 * @return {LEEWGL.Geometry.Grid}
 */
LEEWGL.Geometry.Grid.prototype.clone = function(grid, cloneID, recursive, addToAlias) {
  if (typeof grid === 'undefined')
    grid = new LEEWGL.Geometry.Grid();

  LEEWGL.Geometry.prototype.clone.call(this, grid, cloneID, recursive, addToAlias);

  grid.lines = this.lines;
  grid.dimension = this.dimension;

  return grid;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry
 * @param  {object} options
 */
LEEWGL.Geometry.Triangle = function(options) {
  LEEWGL.Geometry.call(this, options);

  this.type = 'Geometry.Triangle';

  this.vertices.position = [
    0.0, 1.0, 0.0, -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0
  ];

  this.vertices.uv = [
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0
  ];

  this.indices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 1
  ];

  this.calculateFaces();
  this.calculateNormals();
};

LEEWGL.Geometry.Triangle.prototype = Object.create(LEEWGL.Geometry.prototype);

LEEWGL.Geometry.Triangle.prototype.intersectRay = function(origin, direction, collision, distance, segmentationMax) {
  var plane = new LEEWGL.Geometry.Plane();
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

LEEWGL.Geometry.Triangle.prototype.import = function(stringified_json) {
  var json = JSON.parse(stringified_json);
  var triangle = new LEEWGL.Geometry.Triangle(json);

  return triangle;
};

/**
 * Derived from LEEWGL.Geometry
 * @param  {LEEWGL.Geometry.Triangle} triangle
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.Geometry.Triangle}
 */
LEEWGL.Geometry.Triangle.prototype.clone = function(triangle, cloneID, recursive, addToAlias) {
  if (typeof triangle === 'undefined')
    triangle = new LEEWGL.Geometry.Triangle();

  LEEWGL.Geometry.prototype.clone.call(this, triangle, cloneID, recursive, addToAlias);

  return triangle;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry
 * @param  {object} options
 */
LEEWGL.Geometry.Cube = function(options) {
  LEEWGL.Geometry.call(this, options);

  this.type = 'Geometry.Cube';

  this.vertices.position = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
  ];

  this.vertices.uv = [
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

  this.indices = [0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23 // left
  ];


  this.calculateFaces();
  this.calculateNormals();
};

LEEWGL.Geometry.Cube.prototype = Object.create(LEEWGL.Geometry.prototype);

/**
 * Derived from LEEWGL.Geometry
 * @param  {LEEWGL.Geometry.Cube} cube
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.Geometry.Cube}
 */
LEEWGL.Geometry.Cube.prototype.clone = function(cube, cloneID, recursive, addToAlias) {
  if (typeof cube === 'undefined')
    cube = new LEEWGL.Geometry.Cube();
  LEEWGL.Geometry.prototype.clone.call(this, cube, cloneID, recursive, addToAlias);
  return cube;
};

/**
 * @constructor
 * @augments LEEWGL.Geometry
 * @param  {number} options.latitude
 * @param  {number} options.longitude
 * @param  {number} options.radius
 */
LEEWGL.Geometry.Sphere = function(options) {
  LEEWGL.Geometry.call(this, options);

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
  this.calculateNormals();
};

LEEWGL.Geometry.Sphere.prototype = Object.create(LEEWGL.Geometry.prototype);

LEEWGL.Geometry.Sphere.prototype.generate = function() {
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
 * Derived from LEEWGL.Geometry
 * @param  {LEEWGL.Geometry.Sphere} sphere
 * @param  {bool} cloneID
 * @param  {bool|string} addToAlias
 * @return {LEEWGL.Geometry.Sphere}
 */
LEEWGL.Geometry.Sphere.prototype.clone = function(sphere, cloneID, recursive, addToAlias) {
  if (typeof sphere === 'undefined')
    sphere = new LEEWGL.Geometry.Sphere();

  LEEWGL.Geometry.prototype.clone.call(this, sphere, cloneID, recursive, addToAlias);

  sphere.latitude = this.latitude;
  sphere.longitude = this.longitude;
  sphere.radius = this.radius;
  return sphere;
};
