LEEWGL.Geometry = function(options) {
	LEEWGL.Object3D.call(this, options);

	this.type = 'Geometry';

	this.vertices = {
		'position' : [],
		'normal' : [],
		'color' : [],
		'uv' : []
	};
	this.indices = [];
	this.boundingBox = null;
	this.boundingSphere = null;

	this.vertexBuffer = new LEEWGL.Buffer({
		'picking' : (typeof options !== 'undefined' && typeof options.picking !== 'undefined') ? options.picking : true
	});
	this.normalBuffer = new LEEWGL.Buffer();
	this.indexBuffer = new LEEWGL.IndexBuffer();
	this.colorBuffer = new LEEWGL.Buffer();
	this.textureBuffer = new LEEWGL.Buffer();
	this.colors = [];
	this.faces = 1;

	this.normal = vec3.fromValues(0.0, LEEWGL.up, 0.0);

	this.setBuffer = function(gl) {
		this.vertexBuffer.setData(gl, this.vertices.position, new LEEWGL.BufferInformation.VertexTypePos3());
		this.normalBuffer.setData(gl, this.vertices.normal, new LEEWGL.BufferInformation.VertexTypePos3());
		this.textureBuffer.setData(gl, this.vertices.uv, new LEEWGL.BufferInformation.VertexTypePos2());
		this.indexBuffer.setData(gl, this.indices);
	};

	this.setColorBuffer = function(gl) {
		if(this.vertices.color[0].length % 4 !== 0) {
			console.error('LEEWGL.Geometry.addColor(): Color array must be multiple of 4!');
			return false;
		}

		this.colorBuffer.setData(gl, this.vertices.color, new LEEWGL.BufferInformation.VertexTypePos4());
	};

	this.addColor = function(gl, colors, length) {
		if(colors !== undefined && colors.length === length) {
			this.colors = colors;
			this.setColorBuffer(gl);
		} else {
			this.colors = [];
			for(var i = 0; i < length; ++i) {
				this.vertices.color.push([ 1.0, 0.0, 1.0, 1.0 ]);
			}

			this.setColorBuffer(gl);
		}
	};

	this.render = function(gl, shader, drawMode, indices) {
		indices = (typeof indices !== 'undefined') ? indices : true;

		shader.attributes['aVertexPosition'](this.vertexBuffer);
		shader.attributes['aVertexColor'](this.colorBuffer);
		shader.attributes['aVertexNormal'](this.normalBuffer);

		var normalMatrix = mat4.create();
		mat4.invert(normalMatrix, this.transform.matrix());
		mat4.transpose(normalMatrix, normalMatrix);

		shader.uniforms['uNormalMatrix'](normalMatrix);
		shader.uniforms['uModel'](this.transform.matrix());
		shader.uniforms['uColorMapColor'](new Float32Array(this.vertexBuffer.colorMapColor));

		if(indices === true) {
			this.indexBuffer.bind(gl);
			gl.drawElements(drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(drawMode, this.vertices.position.length, 0);
		}
	};
};

LEEWGL.Geometry.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Geometry.prototype.setVertices = function(vertices) {
	for(var i = 0; i < vertices.length; ++i) {
		this.vertices.push(vertices[i]);
	}
};

LEEWGL.Geometry.prototype.clone = function() {
	var geometry = new LEEWGL.Geometry();
	var vertices = this.vertices;

	for(var i = 0; i < vertices.length; ++i) {
		geometry.vertices.push(vertices[i].clone());
	}

	LEEWGL.Object3D.prototype.clone.call(this, geometry);

	return geometry;
};

LEEWGL.Geometry.Plane = function() {
	LEEWGL.Geometry.call(this);

	this.distance = 0.0;
};

LEEWGL.Geometry.Plane.prototype = Object.create(LEEWGL.Geometry.prototype);

// / FIXME: not working [indices]
LEEWGL.Geometry.Grid = function() {
	LEEWGL.Geometry.call(this);

	this.faces = 4;

	this.generateGrid = function(width, height, margin) {
		for(var z = 0; z < height; ++z) {
			for(var x = 0; x < width; ++x) {
				this.vertices.position.push([ x * margin.x, 0.0, z * margin.z ]);
				this.vertices.color.push([ 1.0, 1.0, 1.0, 1.0 ]);
			}
		}

		for(var z = 0; z < height - 1; ++z) {
			// / even row
			if((z & 1) === 0) {
				for(var x = 0; x < width; ++x) {
					this.indices.push(x + (z * width));
					this.indices.push(x + (z * width) + width);
				}
				// / degenerate triangle
				if(z !== height - 2)
					this.indices.push((x - 1) + (z * width));
				// / odd row
			} else {
				for(var x = width - 1; x >= 0; --x) {
					this.indices.push(x + (z * width));
					this.indices.push(x + (z * width) + width);
				}
				// / degenerate triangle
				if(z !== height - 2)
					this.indices.push((x + 1) + (z * width));

			}
		}
	};
};

LEEWGL.Geometry.Grid.prototype = Object.create(LEEWGL.Geometry.prototype);

/**
 * 
 * @param vec3
 *            origin
 * @returns {undefined}
 */
LEEWGL.Geometry.Plane.prototype.distance = function(origin) {
	return vec3.dot(this.normal, origin) + this.distance;
};

LEEWGL.Geometry.Triangle = function() {
	LEEWGL.Geometry.call(this);

	this.faces = 4;

	this.vertices.position = [ -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0 ];

	this.vertices.normal = [ 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0 ];

	this.indices = [ 0, 1, 2, 3, 4, 2, 4, 1, 2, 3, 2, 0, 3, 4, 1 ];
};

LEEWGL.Geometry.Triangle.prototype = Object.create(LEEWGL.Geometry.prototype);

LEEWGL.Geometry.Triangle.prototype.intersectRay = function(origin, direction, collision, distance, segmentationMax) {
	var plane = new LEEWGL.Geometry.Plane();
	vec3.set(plane.x, this.x);
	vec3.set(plane.y, this.y);
	vec3.set(plane.z, this.z);

	var denom = vec3.dot(plane.normal, direction);
	if(Math.abs(denom) < Math.EPSILON)
		return false;

	var t = -(plane.distance + vec3.dot(plane.normal, origin)) / denom;
	if(t <= 0)
		return false;

	if(segmentationMax !== undefined && t > segmentationMax)
		return false;

	vec3.set(collision, direction);
	vec3.scale(collision, collision, t);
	vec3.add(collision, origin, collision);

	if(this.pointInTriangle(collision)) {
		collision[3] = t;
		return true;
	}

	return false;
};

LEEWGL.Geometry.Cube = function() {
	LEEWGL.Geometry.call(this);

	this.faces = 6;

	this.vertices.position = [
	// Front face
	-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
	// Back face
	-1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
	// Top face
	-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
	// Bottom face
	-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
	// Right face
	1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
	// Left face
	-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0 ];

	this.vertices.normal = [
	// Front
	0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
	// Back
	0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
	// Top
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
	// Bottom
	0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
	// Right
	1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
	// Left
	-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0 ];

	this.indices = [ 0, 1, 2, 0, 2, 3, // front
	4, 5, 6, 4, 6, 7, // back
	8, 9, 10, 8, 10, 11, // top
	12, 13, 14, 12, 14, 15, // bottom
	16, 17, 18, 16, 18, 19, // right
	20, 21, 22, 20, 22, 23 // left
	];
};

LEEWGL.Geometry.Cube.prototype = Object.create(LEEWGL.Geometry.prototype);

LEEWGL.Geometry.Sphere = function(options) {
	LEEWGL.Geometry.call(this, options);

	var latitudeBands = 10;
	var longitudeBands = 10;
	var radius = 1;

	for(var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for(var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (longNumber / longitudeBands);
			var v = 1 - (latNumber / latitudeBands);

			this.vertices.normal.push(x);
			this.vertices.normal.push(y);
			this.vertices.normal.push(z);
			this.vertices.uv.push(u);
			this.vertices.uv.push(v);
			this.vertices.position.push(radius * x);
			this.vertices.position.push(radius * y);
			this.vertices.position.push(radius * z);
		}
	}

	for(var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for(var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;

			this.indices.push(first);
			this.indices.push(second);
			this.indices.push(first + 1);

			this.indices.push(second);
			this.indices.push(second + 1);
			this.indices.push(first + 1);
			this.faces++;
		}
	}

};

LEEWGL.Geometry.Sphere.prototype = Object.create(LEEWGL.Geometry.prototype);
