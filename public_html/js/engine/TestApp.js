
LEEWGL.TestApp = function (options) {
    LEEWGL.App.call(this, options);

    this.triangleBuffer = new LEEWGL.Buffer();

    this.matrix = mat4.create();
    this.proj = mat4.create();

    this.camera = new LEEWGL.PerspectiveCamera(75, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 1, 1000);

    this.triangle = new LEEWGL.Geometry();
};


LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function () {
    this.triangle.name = 'Triangle';

    this.triangle.setVertices([
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0
    ]);


    this.triangle.addEventListener('mousedown', function () {
        var translation = vec3.create();
        vec3.set(translation, -0.5, 0.0, 0.0);
        this.translate(translation);
    });

    this.camera.position.z = 1000;
    this.shader.init(this.gl, 'canvas');

    this.triangleBuffer.setData(this.gl, this.triangle.vertices, new LEEWGL.BufferInformation.VertexTypePos3());

    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
};

LEEWGL.TestApp.prototype.onMouseDown = function (event) {
    this.triangle.dispatchEvent(event);
    
     this.castRay();
};

LEEWGL.TestApp.prototype.onMouseMove = function (event) {
    var size = this.core.getRenderSize();
    /// get mousevec to range [-1, 1] in both axes
//    vec3.set(this.mouseVector, 2 * (event.clientX / size.width) - 1, 1 - 2 * (event.clientY / size.height), 0);
    vec3.set(this.mouseVector,event.clientX, event.clientY, 0);
    
    var x = this.mouseVector[0];
    var y = size.height - this.mouseVector[1];
    
    var vec = vec2.fromValues(x, y);
};

LEEWGL.TestApp.prototype.castRay = function() {
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

LEEWGL.TestApp.prototype.onKeyPressed = function(event) {
    
};

LEEWGL.TestApp.prototype.onRender = function () {
    var _shaderProgram = this.shader.getProgram();
    mat4.identity(this.matrix);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleBuffer.getBuffer());
    this.gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, this.triangleBuffer.getBuffer().itemSize, this.gl.FLOAT, false, 0, 0);

    this.shader.setMatrixUniform(this.gl, _shaderProgram.projection, this.camera.projMatrix);
    this.shader.setMatrixUniform(this.gl, _shaderProgram.mvp, this.triangle.matrix);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleBuffer.getBuffer().numItems);
};