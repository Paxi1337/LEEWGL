
LEEWGL.TestApp = function (options) {
    LEEWGL.App.call(this, options);

    this.triangleBuffer = new LEEWGL.Buffer();
    this.colorBuffer = new LEEWGL.Buffer();
    this.triangleIndexBuffer = new LEEWGL.IndexBuffer();
    this.textureBuffer = new LEEWGL.Buffer();

    this.frameBuffer = new LEEWGL.FrameBuffer();

    this.matrix = mat4.create();
    this.proj = mat4.create();

    this.camera = new LEEWGL.PerspectiveCamera(90, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 1, 1000);

    this.triangle = new LEEWGL.Geometry.Triangle();
    this.texture = new LEEWGL.Texture();

    this.lastCapturedColorMap = new Uint8Array(4);

    this.activeKeys = [];
};


LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function () {
    this.core.setSize(512, 512);


    this.triangle.name = 'Triangle';

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

    var colors = [
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0, // red
    ];

    this.colorBuffer.setData(this.gl, colors, new LEEWGL.BufferInformation.VertexTypePos4());

//    this.triangle.addEventListener('mousedown', function () {
//        var translation = vec3.create();
//        vec3.set(translation, -0.5, 0.0, 0.0);
//        this.translate(translation);
//    });

    this.camera.offsetPosition(vec3.fromValues(0.0, 0.0, 10.0));

    this.shader.init(this.gl, 'canvas');

    this.triangleBuffer.setData(this.gl, this.triangle.vertices, new LEEWGL.BufferInformation.VertexTypePos3());
    this.triangleIndexBuffer.setData(this.gl, this.triangle.indices);
    this.textureBuffer.setData(this.gl, textureCoordinates, new LEEWGL.BufferInformation.VertexTypePos2());

    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.core.initTexture(this.texture, '../texture/texture1.jpg');
    this.initPicking();
};

LEEWGL.TestApp.prototype.initPicking = function (width, height) {
    width = typeof width !== 'undefined' ? width : this.canvas.width;
    height = typeof height !== 'undefined' ? height : this.canvas.height;

    this.gl.enable(this.gl.DEPTH_TEST);

    this.frameBuffer.init(this.gl, width, height);
    this.frameBuffer.bind(this.gl);

    var texture = new LEEWGL.Texture();
    texture.create(this.gl);
    texture.bind(this.gl);
    texture.setParameteri(this.gl, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    texture.setParameteri(this.gl, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
    texture.generateMipmap(this.gl);

    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);


    var depthBuffer = new LEEWGL.RenderBuffer();
    depthBuffer.create(this.gl);
    depthBuffer.bind(this.gl);

    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture.webglTexture, 0);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthBuffer.getBuffer());


    if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
        alert("this combination of attachments does not work");
        return;
    }

    texture.unbind(this.gl);
    depthBuffer.unbind(this.gl);
    this.frameBuffer.unbind(this.gl);
};

LEEWGL.TestApp.prototype.onMouseDown = function (event) {

    /// right click
    if (event.which === 3 || event.button === 2) {
        return;
    }

    this.triangle.dispatchEvent(event);

    this.frameBuffer.bind(this.gl);

    var pixelColor = new Uint8Array(4);

    var mouseCords = this.core.getRelativeMouseCoordinates(event);

    this.gl.readPixels(mouseCords.x, mouseCords.y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.lastCapturedColorMap);

    console.log(pixelColor);
    console.log(mouseCords);

    this.frameBuffer.unbind(this.gl);
};

LEEWGL.TestApp.prototype.onMouseMove = function (event) {
    if (event.which === 3 || event.button === 2) {
        var movementX = event.movementX * 0.001;
        var movementY = event.movementY * 0.001;

        this.camera.rotate(movementX, vec3.fromValues(0, 1, 0));
        this.camera.rotate(movementY, vec3.fromValues(1, 0, 0));
        console.log(event.movementX);
    }

    var size = this.core.getRenderSize();
    vec3.set(this.mouseVector, event.clientX, event.clientY, 0);

    var x = this.mouseVector[0];
    var y = size.height - this.mouseVector[1];
};

LEEWGL.TestApp.getColorMapColor = function (x, y) {
    if (x >= this.canvas.width || y >= this.canvas.height || x < 0 || y < 0) {
        console.error('LEEWGL: Invalid color map pixel position');
        return;
    }
    if (!this.lastCapturedColorMap) {
        console.error('LEEWGL: Color map not captured');
        return;
    }

    var position = (this.canvas.height - 1 - y) * this.canvas.width * 4 + x * 4;
    return [this.lastCapturedColorMap[position],
        this.lastCapturedColorMap[position + 1],
        this.lastCapturedColorMap[position + 2]];
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

    var coordsObject = vec3.unproject(vec3.fromValues(x, y, pixels), this.camera.viewProjMatrix, this.camera.projMatrix, viewPort);

    ray.direction = coordsObject - ray.origin;
    ray.direction = vec3.normalize(vec3.create(), ray.direction);

//    console.log(pixels);
};

LEEWGL.TestApp.prototype.onMouseUp = function (event) {
};

LEEWGL.TestApp.prototype.onKeyUp = function (event) {
    this.activeKeys[event.keyCode] = false;
};

LEEWGL.TestApp.prototype.onKeyDown = function (event) {
    this.activeKeys[event.keyCode] = true;
};

LEEWGL.TestApp.prototype.onUpdate = function () {
    this.camera.update();
    this.handleKeyInput();
};

LEEWGL.TestApp.prototype.handleKeyInput = function () {
    var pitch = 0.0;

    if (this.activeKeys[LEEWGL.KEYS.PAGE_UP]) {
        this.camera.rotate(0.01, vec3.fromValues(1, 0, 0));
    } else if (this.activeKeys[LEEWGL.KEYS.PAGE_DOWN]) {
        this.camera.rotate(-0.01, vec3.fromValues(0, 1, 0));
    }

    if (this.activeKeys[LEEWGL.KEYS.LEFT_CURSOR]) {
        this.camera.move([-0.1, 0, 0]);
    } else if (this.activeKeys[LEEWGL.KEYS.RIGHT_CURSOR]) {
        this.camera.move([0.1, 0, 0]);
    }
    
    if (this.activeKeys[LEEWGL.KEYS.UP_CURSOR]) {
        this.camera.move([0, 0, -0.1]);
    } else if (this.activeKeys[LEEWGL.KEYS.DOWN_CURSOR]) {
        this.camera.move([0, 0, 0.1]);
    }
};

LEEWGL.TestApp.prototype.onRender = function () {
    var _shaderProgram = this.shader.getProgram();
    this.frameBuffer.bind(this.gl);
    this.shader.setIntegerUniform(this.gl, _shaderProgram.offscreen, true);
    this.draw();


    this.frameBuffer.unbind(this.gl);
    this.shader.setIntegerUniform(this.gl, _shaderProgram.offscreen, false);
    this.draw();
};

LEEWGL.TestApp.prototype.draw = function () {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    var _shaderProgram = this.shader.getProgram();
    mat4.identity(this.matrix);

    this.triangleBuffer.bind(this.gl);
    this.gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, this.triangleBuffer.getBuffer().itemSize, this.gl.FLOAT, false, 0, 0);

    this.colorBuffer.bind(this.gl);
    this.gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, this.colorBuffer.getBuffer().itemSize, this.gl.FLOAT, false, 0, 0);

    this.shader.setMatrixUniform(this.gl, _shaderProgram.projection, this.camera.viewProjMatrix);
    this.shader.setMatrixUniform(this.gl, _shaderProgram.mvp, this.triangle.matrix);

    this.triangleIndexBuffer.bind(this.gl);
    this.gl.drawElements(this.gl.TRIANGLES, this.triangle.indices.length, this.gl.UNSIGNED_SHORT, 0);
};