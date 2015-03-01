
LEEWGL.TestApp = function(options) {
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

    this.picker = new LEEWGL.Picker();

    this.movement = {'x' : 0, 'y' : 0};

    this.activeKeys = [];

    this.picking = true;
    this.activeElement = null;
};


LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function() {
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
//        this.transform.translate(translation);
//    });

    this.camera.transform.setPosition([0.0, 0.0, 10.0]);
    this.camera.setLookAt([0.0, 0.0, -1.0]);

    this.shader.createShaderFromLibrary(this.gl, LEEWGL.Shader.VERTEX, LEEWGL.ShaderLibrary.picking_directional_ambient.vertexShader);
    this.shader.createShaderFromLibrary(this.gl, LEEWGL.Shader.FRAGMENT, LEEWGL.ShaderLibrary.picking_directional_ambient.fragmentShader);
    this.shader.linkShader(this.gl);
    this.shader.use(this.gl);

    this.shader.createUniformSetters(this.gl);
    this.shader.createAttributeSetters(this.gl);

    this.triangle.setBuffer(this.gl);
    this.triangle.addColor(this.gl, undefined, this.triangle.faces);
    this.triangle.addComponent(new LEEWGL.Component.CustomScript());
    
    this.cube.setBuffer(this.gl);
    this.cube.addColor(this.gl, undefined, this.cube.faces);
    this.cube.transform.setPosition(5, 0, 0);

    this.cube.addComponent(new LEEWGL.Component.CustomScript());

    this.grid.generateGrid(10, 10, {'x' : 10.0, 'z' : 10.0});
    this.grid.setBuffer(this.gl);
    this.grid.setColorBuffer(this.gl);
    this.grid.transform.translate([0.0, -5.0, 0.0]);

    this.textureBuffer.setData(this.gl, textureCoordinates, new LEEWGL.BufferInformation.VertexTypePos2());

    this.picker.addToList(this.triangle.vertexBuffer.colorMapIndex, this.triangle);
    this.picker.addToList(this.cube.vertexBuffer.colorMapIndex, this.cube);

    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.core.initTexture(this.texture, 'texture/texture1.jpg');
    this.picker.initPicking(this.gl, this.canvas.width, this.canvas.height);
    
    /// test load collada file
    var ajax = new LEEWGL.AsynchRequest();
    var ColladaImporter = new LEEWGL.Importer();
    
    ColladaImporter.parseCollada(ajax.send('GET', LEEWGL.ROOT + 'models/Man_Mp_Iphone.DAE', false).response.responseXML);
};

LEEWGL.TestApp.prototype.onMouseDown = function(event) {
    var mouseCords = UI.getRelativeMouseCoordinates(event, this.canvas);
    this.picker.bind(this.gl);
    var obj = this.picker.pick(this.gl, mouseCords.x, mouseCords.y);

    if(this.picking && obj !== null) {
        this.activeElement = obj;
        this.movement.x = 0;
        this.movement.y = 0;

        UI.setInspectorContent(obj.id);
    }
    this.picker.unbind(this.gl);
};

LEEWGL.TestApp.prototype.onMouseMove = function(event) {
    var movement = {'x' : 0, 'y' : 0};

    this.movement.x += event.movementX;
    this.movement.y += event.movementY;

    if(event.which === 3 || event.button === 2) {
        movement.x = (0.1 * event.movementX);
        movement.y = (0.1 * event.movementY);

        this.camera.offsetOrientation(movement.y, movement.x);
    } else if((event.which === 1 || event.button === 1) && this.activeElement !== null) {

        movement.x = event.movementX * 0.01;
        movement.y = event.movementY * 0.01;

        if(event.ctrlKey)
            this.activeElement.transform.scale([this.movement.x * 0.01, this.movement.y * 0.01, 1.0]);
        else
            this.activeElement.transform.translate([movement.x, -movement.y, 0.0]);
        UI.setInspectorContent(this.activeElement.id);
    }
    event.preventDefault();
    event.stopPropagation();
};

LEEWGL.TestApp.prototype.onMouseUp = function(event) {
    this.activeElement = null;
};

LEEWGL.TestApp.prototype.onKeyUp = function(event) {
    this.activeKeys[event.keyCode] = false;
};

LEEWGL.TestApp.prototype.onKeyDown = function(event) {
    this.activeKeys[event.keyCode] = true;
};

LEEWGL.TestApp.prototype.onUpdate = function() {
    this.camera.update();
    this.handleKeyInput();
};

LEEWGL.TestApp.prototype.handleKeyInput = function() {
    if(this.activeKeys[LEEWGL.KEYS.PAGE_UP]) {
        this.camera.transform.offsetPosition(vec3.negate(vec3.create(), this.camera.down()));
    } else if(this.activeKeys[LEEWGL.KEYS.PAGE_DOWN]) {
        this.camera.transform.offsetPosition(this.camera.down());
    }

    if(this.activeKeys[LEEWGL.KEYS.LEFT_CURSOR]) {
        this.camera.transform.offsetPosition(vec3.negate(vec3.create(), this.camera.right()));
    } else if(this.activeKeys[LEEWGL.KEYS.RIGHT_CURSOR]) {
        this.camera.transform.offsetPosition(this.camera.right());
    }

    if(this.activeKeys[LEEWGL.KEYS.UP_CURSOR]) {
        this.camera.transform.offsetPosition(this.camera.forward());
    } else if(this.activeKeys[LEEWGL.KEYS.DOWN_CURSOR]) {
        this.camera.transform.offsetPosition(vec3.negate(vec3.create(), this.camera.forward()));
    }
};

LEEWGL.TestApp.prototype.onRender = function() {
    if(this.picking) {
        this.picker.bind(this.gl);
        this.shader.uniforms['uOffscreen'](1);
        this.draw();
    }

    this.picker.unbind(this.gl);

    this.shader.uniforms['uOffscreen'](0);
    this.draw();
};

LEEWGL.TestApp.prototype.draw = function() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    /// triangle
    this.shader.uniforms['uVP'](this.camera.viewProjMatrix);
    this.shader.uniforms['uModel'](this.triangle.transform.matrix());
    this.shader.uniforms['uColorMapColor'](new Float32Array(this.triangle.vertexBuffer.colorMapColor));

    this.shader.attributes['aVertexPosition'](this.triangle.vertexBuffer);
    this.shader.attributes['aVertexColor'](this.triangle.colorBuffer);
    
    this.shader.attributes['aVertexNormal'](this.triangle.normalBuffer);

    this.triangle.indexBuffer.bind(this.gl);
    this.gl.drawElements(this.gl.TRIANGLES, this.triangle.indices.length, this.gl.UNSIGNED_SHORT, 0);

    /// cube
    this.shader.attributes['aVertexPosition'](this.cube.vertexBuffer);
    this.shader.attributes['aVertexColor'](this.cube.colorBuffer);
    this.shader.attributes['aVertexNormal'](this.cube.normalBuffer);
    this.shader.uniforms['uColorMapColor'](new Float32Array(this.cube.vertexBuffer.colorMapColor));
    this.shader.uniforms['uModel'](this.cube.transform.matrix());

    this.cube.indexBuffer.bind(this.gl);
    this.gl.drawElements(this.gl.TRIANGLES, this.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);

    /// grid
//    this.shader.attributes['aVertexPosition'](this.grid.vertexBuffer);
//    this.shader.attributes['aVertexColor'](this.grid.colorBuffer);
//    this.shader.uniforms['uColorMapColor'](new Float32Array(this.grid.vertexBuffer.colorMapColor));
//    this.shader.uniforms['uModel'](this.grid.transform.matrix());
//
//    this.grid.indexBuffer.bind(this.gl);
//    this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.grid.indices.length, this.gl.UNSIGNED_SHORT, 0);
};