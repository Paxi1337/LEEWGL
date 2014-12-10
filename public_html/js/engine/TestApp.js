
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
};

LEEWGL.TestApp.prototype.onMouseMove = function (event) {
};

LEEWGL.TestApp.prototype.onMouseUp = function (event) {
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