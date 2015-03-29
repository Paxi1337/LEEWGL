LEEWGL.TestApp = function(options) {
    LEEWGL.App.call(this, options);

    this.textureBuffer = new LEEWGL.Buffer();
    this.frameBuffer = new LEEWGL.FrameBuffer();

    this.matrix = mat4.create();
    this.proj = mat4.create();

    this.camera = new LEEWGL.PerspectiveCamera({
        'name': 'EditorCamera',
        'fov': 90,
        'aspect': this.canvas.width / this.canvas.height,
        'near': 1,
        'far': 1000,
        'inOutline': false
    });
    this.gameCamera = new LEEWGL.PerspectiveCamera({
        'name': 'GameCamera',
        'fov': 90,
        'aspect': this.canvas.width / this.canvas.height,
        'near': 1,
        'far': 1000
    });

    this.cameraGizmo = new LEEWGL.Geometry.Sphere();

    this.triangle = new LEEWGL.Geometry.Triangle();
    this.cube = new LEEWGL.Geometry.Cube();
    this.grid = new LEEWGL.Geometry.Grid();
    this.texture = new LEEWGL.Texture();

    this.picker = new LEEWGL.Picker();

    this.light = new LEEWGL.DirectionalLight();

    this.movement = {
        'x': 0,
        'y': 0
    };

    this.activeKeys = [];

    this.picking = (typeof options !== 'undefined' && typeof options.picking !== 'undefined') ? options.picking : true;

    this.translationSpeed = {
        'x': ((typeof options !== 'undefined' && typeof options.translationSpeedX !== 'undefined') ? options.translationSpeedX : 0.1),
        'y': ((typeof options !== 'undefined' && typeof options.translationSpeedY !== 'undefined') ? options.translationSpeedY : 0.1)
    };
    this.rotationSpeed = {
        'x': ((typeof options !== 'undefined' && typeof options.rotationSpeedX !== 'undefined') ? options.rotationSpeedX : 0.1),
        'y': ((typeof options !== 'undefined' && typeof options.rotationSpeedY !== 'undefined') ? options.rotationSpeedY : 0.1)
    };

    this.scene = new LEEWGL.Scene();

    this.activeElement = null;
};

LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function() {
    this.core.setSize(512, 512);
    this.triangle.name = 'Triangle';
    this.cube.name = 'Cube';
    this.grid.name = 'Grid';
    this.light.name = 'DirectionalLight';

    var textureCoordinates = [
        // Front
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ];

    this.camera.transform.setPosition([0.0, 0.0, 10.0]);
    this.camera.setLookAt([0.0, 0.0, -1.0]);

    this.gameCamera.transform.setPosition([10.0, 0.0, 10.0]);
    this.gameCamera.setLookAt([0.0, 0.0, -1.0]);
    this.cameraGizmo.transform.setPosition([10.0, 0.0, 10.0]);

    this.shader.createShaderFromLibrary(this.gl, LEEWGL.Shader.VERTEX, LEEWGL.ShaderLibrary.picking_directional_ambient.vertexShader);
    this.shader.createShaderFromLibrary(this.gl, LEEWGL.Shader.FRAGMENT, LEEWGL.ShaderLibrary.picking_directional_ambient.fragmentShader);
    this.shader.linkShader(this.gl);
    this.shader.use(this.gl);

    this.shader.createUniformSetters(this.gl);
    this.shader.createAttributeSetters(this.gl);

    this.cameraGizmo.setBuffer(this.gl);
    this.cameraGizmo.addColor(this.gl);

    this.triangle.setBuffer(this.gl);
    this.triangle.addColor(this.gl);

    this.cube.setBuffer(this.gl);
    this.cube.addColor(this.gl);
    this.cube.transform.setPosition(5, 0, 0);

    this.cube.addComponent(new LEEWGL.Component.CustomScript());

    this.grid.generateGrid(10, 10, {
        'x': 10.0,
        'z': 10.0
    });
    this.grid.setBuffer(this.gl);
    this.grid.setColorBuffer(this.gl);
    this.grid.transform.translate([0.0, -5.0, 0.0]);

    this.textureBuffer.setData(this.gl, textureCoordinates, new LEEWGL.BufferInformation.VertexTypePos2());

    if (this.picking === true)
        this.picker.initPicking(this.gl, this.canvas.width, this.canvas.height);

    this.scene.add(this.camera, this.gameCamera, this.triangle, this.cube, this.cameraGizmo);


    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.core.initTexture(this.texture, 'texture/texture1.jpg');

    // / test load collada file
    var ajax = new LEEWGL.AsynchRequest();
    var ColladaImporter = new LEEWGL.Importer();

    // ColladaImporter.parseCollada(ajax.send('GET', LEEWGL.ROOT + 'models/Man_Mp_Iphone.DAE', false).response.responseXML);

    UI.setGL(this.gl);
    UI.setScene(this.scene);
};

LEEWGL.TestApp.prototype.updatePickingList = function() {
    if (this.picking === true) {
        for (var i = 0; i < this.scene.children.length; ++i) {
            var element = this.scene.children[i];
            if (typeof element.vertexBuffer !== 'undefined')
                this.picker.addToList(element);
        }
        this.picker.initPicking(this.gl, this.canvas.width, this.canvas.height);
    }
};

LEEWGL.TestApp.prototype.onMouseDown = function(event) {
    var mouseCords = UI.getRelativeMouseCoordinates(event, this.canvas);

    var obj = null;

    if (this.picking === true) {
        this.picker.bind(this.gl);
        obj = this.picker.pick(this.gl, mouseCords.x, mouseCords.y);
    }

    if (this.picking === true && obj !== null) {
        this.activeElement = obj;
        this.movement.x = 0;
        this.movement.y = 0;

        UI.setInspectorContent(obj.id);

        this.picker.unbind(this.gl);
    }
};

LEEWGL.TestApp.prototype.onMouseMove = function(event) {
    var movement = {
        'x': 0,
        'y': 0
    };

    this.movement.x += event.movementX;
    this.movement.y += event.movementY;

    if (event.which === 3 || event.button === LEEWGL.MOUSE.RIGHT) {
        movement.x = (this.rotationSpeed.x * event.movementX);
        movement.y = (this.rotationSpeed.y * event.movementY);

        this.camera.offsetOrientation(movement.y, movement.x);
    } else if ((event.which === 1 || event.button === LEEWGL.MOUSE.LEFT) && this.activeElement !== null) {

        var forward = this.camera.forward();

        movement.x = event.movementX * this.translationSpeed.x;
        movement.y = event.movementY * this.translationSpeed.y;


        var trans = [movement.x, -movement.y, 0.0];
        vec3.transformMat4(trans, trans, this.camera.orientation());
        console.log(trans);

        if (event.ctrlKey)
            this.activeElement.transform.scale([this.movement.x * 0.01, this.movement.y * 0.01, 1.0]);
        else
            this.activeElement.transform.translate(trans);
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
    this.gameCamera.update();
    this.handleKeyInput();

    if (this.scene.needsUpdate === true) {
        this.updatePickingList();
        this.scene.needsUpdate = false;
    }
};

LEEWGL.TestApp.prototype.handleKeyInput = function() {
    if (typeof UI !== 'undefined' && UI.playing === true)
        return;

    if (this.activeKeys[LEEWGL.KEYS.PAGE_UP]) {
        this.camera.transform.offsetPosition(vec3.negate(vec3.create(), this.camera.down()));
    } else if (this.activeKeys[LEEWGL.KEYS.PAGE_DOWN]) {
        this.camera.transform.offsetPosition(this.camera.down());
    }

    if (this.activeKeys[LEEWGL.KEYS.LEFT_CURSOR]) {
        this.camera.transform.offsetPosition(vec3.negate(vec3.create(), this.camera.right()));
    } else if (this.activeKeys[LEEWGL.KEYS.RIGHT_CURSOR]) {
        this.camera.transform.offsetPosition(this.camera.right());
    }

    if (this.activeKeys[LEEWGL.KEYS.UP_CURSOR]) {
        this.camera.transform.offsetPosition(this.camera.forward());
    } else if (this.activeKeys[LEEWGL.KEYS.DOWN_CURSOR]) {
        this.camera.transform.offsetPosition(vec3.negate(vec3.create(), this.camera.forward()));
    }
};

LEEWGL.TestApp.prototype.onRender = function() {
    if (this.picking === true) {
        this.picker.bind(this.gl);
        this.shader.uniforms['uOffscreen'](1);
        this.draw();
        this.picker.unbind(this.gl);
    }

    this.shader.uniforms['uOffscreen'](0);
    this.draw();
};

LEEWGL.TestApp.prototype.draw = function() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(LEEWGL.Settings.BackgroundColor.r, LEEWGL.Settings.BackgroundColor.g, LEEWGL.Settings.BackgroundColor.b, LEEWGL.Settings.BackgroundColor.a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // / light
    this.shader.uniforms['uAmbient']([0.5, 0.5, 0.5]);
    this.shader.uniforms['uLightDirection'](this.light.components['Light'].direction);
    this.shader.uniforms['uLightColor'](this.light.components['Light'].color);

    if (typeof UI !== 'undefined' && UI.playing === true)
        this.shader.uniforms['uVP'](this.gameCamera.viewProjMatrix);
    else
        this.shader.uniforms['uVP'](this.camera.viewProjMatrix);

    for (var i = 0; i < this.scene.children.length; ++i) {
        if (this.scene.children[i].render)
            this.scene.children[i].render(this.gl, this.shader, this.gl.TRIANGLES);
    }

    // / grid
    // this.shader.attributes['aVertexPosition'](this.grid.vertexBuffer);
    // this.shader.attributes['aVertexColor'](this.grid.colorBuffer);
    // this.shader.uniforms['uColorMapColor'](new Float32Array(this.grid.vertexBuffer.colorMapColor));
    // this.shader.uniforms['uModel'](this.grid.transform.matrix());
    //
    // this.grid.indexBuffer.bind(this.gl);
    // this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.grid.indices.length, this.gl.UNSIGNED_SHORT, 0);
};
