
LEEWGL.TestApp = function (options) {
    LEEWGL.App.call(this, options);

    this.cubeBuffer = new LEEWGL.Buffer();
    this.cubeIndexBuffer = new LEEWGL.IndexBuffer();
    this.textureBuffer = new LEEWGL.Buffer();

    this.matrix = mat4.create();
    this.proj = mat4.create();

    this.camera = new LEEWGL.PerspectiveCamera(75, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 1, 1000);

    this.cube = new LEEWGL.Geometry();
    this.texture = new LEEWGL.Texture();
};


LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function () {
    this.cube.name = 'Cube';

    var vertices = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];

    this.cube.setVertices(vertices);

    var textureCoordinates = [
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

    var cubeVertexIndices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23    // left
    ];

    this.cube.addEventListener('mousedown', function () {
        var translation = vec3.create();
        vec3.set(translation, -0.5, 0.0, 0.0);
        this.translate(translation);
    });

    this.camera.position.z = 1000;
    this.shader.init(this.gl, 'canvas');
    
    this.cubeBuffer.setData(this.gl, this.cube.vertices, new LEEWGL.BufferInformation.VertexTypePos3());
    this.cubeIndexBuffer.setData(this.gl, cubeVertexIndices);
    this.textureBuffer.setData(this.gl, textureCoordinates, new LEEWGL.BufferInformation.VertexTypePos2());

    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    
    this.core.initTexture(this.texture, '../texture/texture1.jpg');
};

LEEWGL.TestApp.prototype.onMouseDown = function (event) {
    this.cube.dispatchEvent(event);

    this.castRay();
};

LEEWGL.TestApp.prototype.onMouseMove = function (event) {
    var size = this.core.getRenderSize();
    /// get mousevec to range [-1, 1] in both axes
//    vec3.set(this.mouseVector, 2 * (event.clientX / size.width) - 1, 1 - 2 * (event.clientY / size.height), 0);
    vec3.set(this.mouseVector, event.clientX, event.clientY, 0);

    var x = this.mouseVector[0];
    var y = size.height - this.mouseVector[1];

    var vec = vec2.fromValues(x, y);
};

LEEWGL.TestApp.prototype.castRay = function () {
    var size = this.core.getRenderSize();
    var ray = LEEWGL.Math.Ray;
    var mouse = this.mouseVector;

    var x = mouse[0];
    var y = size.height - mouse[1];

    var depth;

    var pixels = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

    var viewPort = vec4.fromValues(0.0, 0.0, size.width, size.height);

    var coordsObject = vec3.unproject(vec3.fromValues(x, y, pixels), this.camera.mvMatrix, this.camera.projMatrix, viewPort);

    ray.direction = coordsObject - ray.origin;
    ray.direction = vec3.normalize(vec3.create(), ray.direction);

    console.log(pixels);
};

LEEWGL.TestApp.prototype.onMouseUp = function (event) {
};

LEEWGL.TestApp.prototype.onKeyPressed = function (event) {

};

LEEWGL.TestApp.prototype.onRender = function () {
    var _shaderProgram = this.shader.getProgram();
    mat4.identity(this.matrix);

    this.cubeBuffer.bind(this.gl);
    this.gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, this.cubeBuffer.getBuffer().itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.textureBuffer.bind(this.gl);
    this.gl.vertexAttribPointer(_shaderProgram.textureCoordAttribute, this.textureBuffer.getBuffer().itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.shader.setMatrixUniform(this.gl, _shaderProgram.projection, this.camera.projMatrix);
    this.shader.setIntegerUniform(this.gl, _shaderProgram.sampler, 0);
    this.shader.setMatrixUniform(this.gl, _shaderProgram.mvp, this.cube.matrix);

    this.cubeIndexBuffer.bind(this.gl);
    this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);
};