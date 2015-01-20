
LEEWGL.TestApp = function (options) {
    LEEWGL.App.call(this, options);

    this.textureBuffer = new LEEWGL.Buffer();
    this.frameBuffer = new LEEWGL.FrameBuffer();

    this.matrix = mat4.create();
    this.proj = mat4.create();

    this.camera = new LEEWGL.PerspectiveCamera(90, this.canvas.width / this.canvas.height, 1, 1000);

    this.triangle = new LEEWGL.Geometry.Triangle();
    this.cube = new LEEWGL.Geometry.Cube();
    this.grid = new LEEWGL.Geometry.Grid();
    this.texture = new LEEWGL.Texture();

    this.lastCapturedColorMap = [];

    this.renderColorMap = false;

    this.activeKeys = [];

    this.picking = false;
    this.pickingList = {};

    this.activeElement = null;

    this.movement = {'x': 0, 'y': 0};
};


LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function () {
    this.core.setSize(512, 512);
    this.triangle.name = 'Triangle';
    this.cube.name = 'Cube';
    this.grid.name = 'Grid';

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

//    this.triangle.addEventListener('mousedown', function () {
//        var translation = vec3.create();
//        vec3.set(translation, -0.5, 0.0, 0.0);
//        this.translate(translation);
//    });

    this.camera.transform.setPosition([0.0, 0.0, 5.0]);
//    this.camera.transform.offsetPosition(vec3.fromValues(0.0, 0.0, 5.0));

    this.shader.init(this.gl, 'canvas');
    this.shader.createUniformSetters(this.gl);
    this.shader.createAttributeSetters(this.gl);

    console.log(this.shader.attributes);

    this.triangle.setBuffer(this.gl);
    this.triangle.addColor(this.gl, undefined, this.triangle.faces);

    this.cube.setBuffer(this.gl);
    this.cube.addColor(this.gl, undefined, this.cube.faces);
    this.cube.transform.translate([5.0, 0.0, 0.0]);

    this.grid.generateGrid(10, 10, {'x': 10.0, 'z': 10.0});
    this.grid.setBuffer(this.gl);
    this.grid.setColorBuffer(this.gl);
    this.grid.transform.translate([0.0, -5.0, 0.0]);

    console.log(this.grid.vertices);
    console.log(this.grid.indices);

    this.textureBuffer.setData(this.gl, textureCoordinates, new LEEWGL.BufferInformation.VertexTypePos2());

    this.pickingList[this.triangle.vertexBuffer.colorMapIndex] = this.triangle;
    this.pickingList[this.cube.vertexBuffer.colorMapIndex] = this.cube;

    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.core.initTexture(this.texture, '../texture/texture1.jpg');
    this.initPicking();
};

LEEWGL.TestApp.prototype.initPicking = function (width, height) {
    width = typeof width !== 'undefined' ? width : this.canvas.width;
    height = typeof height !== 'undefined' ? height : this.canvas.height;

    this.lastCapturedColorMap = new Uint8Array(this.canvas.width * this.canvas.height * 4);

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

    this.picking = true;
};

LEEWGL.TestApp.prototype.onMouseDown = function (event) {
    this.triangle.dispatchEvent(event);

    this.frameBuffer.bind(this.gl);

    var mouseCords = this.core.getRelativeMouseCoordinates(event);
    this.gl.readPixels(0, 0, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.lastCapturedColorMap);

    var color = this.getColorMapColor(mouseCords.x, mouseCords.y);
    var index = color[0] * 65536 + color[1] * 256 + color[2];

    if (this.picking && this.pickingList[index]) {
        console.log('selected element ' + this.pickingList[index].name);
        this.activeElement = this.pickingList[index];
    }
    this.frameBuffer.unbind(this.gl);
};

LEEWGL.TestApp.prototype.onMouseMove = function (event) {
    if (event.which === 3 || event.button === 2) {
        var movementX = (0.1 * event.movementX);
        var movementY = (0.1 * event.movementY);

        this.camera.rotate(movementY, movementX);
    } else if ((event.which === 1 || event.button === 1) && this.activeElement !== null) {
        this.movement.x += event.movementX * 0.01;
        this.movement.y -= event.movementY * 0.01;

        var mouseCords = this.core.getRelativeMouseCoordinates(event);
        var unprojectedCoords = vec3.unproject([mouseCords.x, mouseCords.y, 1.0], this.camera.viewMatrix, this.camera.projMatrix, [0, 0, this.canvas.width, this.canvas.height]);

        console.log(unprojectedCoords);

        this.activeElement.transform.translate(unprojectedCoords);
//        this.activeElement.transform.offsetPosition([10.0, 10.0, 0.0]);
    }
};

LEEWGL.TestApp.prototype.getColorMapColor = function (x, y) {
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


LEEWGL.TestApp.prototype.onMouseUp = function (event) {
    this.activeElement = null;
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
    if (this.picking) {
        this.renderColorMap = true;
        var _shaderProgram = this.shader.getProgram();
        this.frameBuffer.bind(this.gl);
        this.shader.uniforms['uOffscreen'](1);
//        this.shader.setIntegerUniform(this.gl, _shaderProgram.offscreen, true);
        this.draw();
    }

    this.renderColorMap = false;
    this.frameBuffer.unbind(this.gl);


    this.shader.uniforms['uOffscreen'](0);
//    this.shader.setIntegerUniform(this.gl, _shaderProgram.offscreen, false);
    this.draw();
};

LEEWGL.TestApp.prototype.draw = function () {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    var _shaderProgram = this.shader.getProgram();
    mat4.identity(this.matrix);

    /// triangle
    this.shader.uniforms['uMVP'](this.camera.viewProjMatrix);
    this.shader.uniforms['uModel'](this.triangle.transform.matrix());
    this.shader.uniforms['uColorMapColor'](new Float32Array(this.triangle.vertexBuffer.colorMapColor));

    this.shader.attributes['aVertexPosition'](this.triangle.vertexBuffer);
    this.shader.attributes['aVertexColor'](this.triangle.colorBuffer);

    this.triangle.indexBuffer.bind(this.gl);
    this.gl.drawElements(this.gl.TRIANGLES, this.triangle.indices.length, this.gl.UNSIGNED_SHORT, 0);

    /// cube
    this.shader.attributes['aVertexPosition'](this.cube.vertexBuffer);
    this.shader.attributes['aVertexColor'](this.cube.colorBuffer);
    this.shader.uniforms['uColorMapColor'](new Float32Array(this.cube.vertexBuffer.colorMapColor));
    this.shader.uniforms['uModel'](this.cube.transform.matrix());

    this.cube.indexBuffer.bind(this.gl);
    this.gl.drawElements(this.gl.TRIANGLES, this.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);

    /// grid
    this.shader.attributes['aVertexPosition'](this.grid.vertexBuffer);
    this.shader.attributes['aVertexColor'](this.grid.colorBuffer);
    this.shader.uniforms['uColorMapColor'](new Float32Array(this.grid.vertexBuffer.colorMapColor));
    this.shader.uniforms['uModel'](this.grid.transform.matrix());

    this.grid.indexBuffer.bind(this.gl);
    this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.grid.indices.length, this.gl.UNSIGNED_SHORT, 0);
};