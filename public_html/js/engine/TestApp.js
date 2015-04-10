LEEWGL.TestApp = function(options) {
    LEEWGL.App.call(this, options);

    this.camera = new LEEWGL.PerspectiveCamera({
        'name': 'EditorCamera',
        'fov': 90,
        'aspect': 512 / 512,
        'near': 1,
        'far': 1000,
        'inOutline': false
    });
    this.gameCamera = new LEEWGL.PerspectiveCamera({
        'name': 'GameCamera',
        'fov': 90,
        'aspect': 512 / 512,
        'near': 1,
        'far': 1000
    });

    this.cameraGizmo = new LEEWGL.Geometry.Sphere();

    this.triangle = new LEEWGL.Geometry.Triangle();
    this.cube = new LEEWGL.Geometry.Cube();
    this.grid = new LEEWGL.Geometry.Grid();

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

    this.colorShader = new LEEWGL.Shader();
    this.textureShader = new LEEWGL.Shader();
    this.activeShader = null;

    this.testModel = new LEEWGL.Geometry.Triangle();
};

LEEWGL.TestApp.prototype = Object.create(LEEWGL.App.prototype);

LEEWGL.TestApp.prototype.onCreate = function() {
    var that = this;

    this.core.setViewport(0, 0, 512, 512);
    this.core.setSize(512, 512);

    this.triangle.name = 'Triangle';
    this.cube.name = 'Cube';
    this.grid.name = 'Grid';
    this.light.name = 'DirectionalLight';

    this.camera.transform.setPosition([0.0, 0.0, 10.0]);
    this.camera.setLookAt([0.0, 0.0, -1.0]);

    this.gameCamera.transform.setPosition([10.0, 0.0, 10.0]);
    this.gameCamera.setLookAt([0.0, 0.0, -1.0]);
    this.cameraGizmo.transform.setPosition([10.0, 0.0, 10.0]);

    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.DEFAULT);
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.PICKING);
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.COLOR);
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.DIRECTIONAL);

    this.colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, this.shaderLibrary.out(LEEWGL.Shader.VERTEX));
    this.colorShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, this.shaderLibrary.out(LEEWGL.Shader.FRAGMENT));
    this.colorShader.linkShader(this.gl);
    this.colorShader.use(this.gl);

    this.colorShader.createUniformSetters(this.gl);
    this.colorShader.createAttributeSetters(this.gl); +

    this.shaderLibrary.reset();

    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.DEFAULT);
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.PICKING);
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.TEXTURE);
    this.shaderLibrary.addParameterChunk(LEEWGL.ShaderLibrary.DIRECTIONAL);

    this.textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.VERTEX, this.shaderLibrary.out(LEEWGL.Shader.VERTEX));
    this.textureShader.createShaderFromCode(this.gl, LEEWGL.Shader.FRAGMENT, this.shaderLibrary.out(LEEWGL.Shader.FRAGMENT));
    this.textureShader.linkShader(this.gl);
    this.textureShader.use(this.gl);

    this.textureShader.createUniformSetters(this.gl);
    this.textureShader.createAttributeSetters(this.gl);

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

    // / test load collada file
    var Importer = new LEEWGL.Importer();

    // var model = Importer.import('models/cup.obj', this.gl);

    this.scene.add(this.camera, this.gameCamera, this.triangle, this.cube, this.cameraGizmo);

    UI.addObjToOutline(this.scene.children);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    UI.setGL(this.gl);
    UI.setScene(this.scene);

    this.activeShader = this.colorShader;

    if (this.picking === true)
        this.picker.initPicking(this.gl, this.canvas.width, this.canvas.height);
};

LEEWGL.TestApp.prototype.updatePickingList = function() {
    if (this.picking === true) {
        for (var i = 0; i < this.scene.children.length; ++i) {
            var element = this.scene.children[i];
            if (typeof element.buffers !== 'undefined')
                this.picker.addToList(element);
        }
        this.picker.initPicking(this.gl, this.canvas.width, this.canvas.height);
    }
};

LEEWGL.TestApp.prototype.onMouseDown = function(event) {
    var mouseCords = UI.getRelativeMouseCoordinates(event, this.canvas);

    event.target.focus();

    var obj = null;

    if (this.picking === true) {
        this.picker.bind(this.gl);
        obj = this.picker.pick(this.gl, mouseCords.x, mouseCords.y);

        if (obj !== null) {
            this.activeElement = obj;
            this.movement.x = 0;
            this.movement.y = 0;

            UI.setInspectorContent(obj.id);

            this.picker.unbind(this.gl);
        } else {
            UI.setInspectorContent(-1);
        }
    }
    event.preventDefault();
    event.stopPropagation();
};

LEEWGL.TestApp.prototype.onMouseMove = function(event) {
    var movement = {
        'x': 0,
        'y': 0
    };

    var button = null;

    /// Chrome
    if (typeof event.movementX !== 'undefined') {
        movement.x = event.movementX;
        movement.y += event.movementY;

        button = event.button;
    }
    /// FF
    else {
        movement.x += event.mozMovementX;
        movement.y += event.mozMovementY;

        button = event.buttons;
    }

    var rad = LEEWGL.Math.degToRad(10);

    if (event.which === 3 || button === LEEWGL.MOUSE.RIGHT) {
        movement.x = (this.rotationSpeed.x * movement.x);
        movement.y = (this.rotationSpeed.y * movement.y);
        this.camera.offsetOrientation(movement.y, movement.x);
    } else if ((event.which === 1 || button === LEEWGL.MOUSE.LEFT) && this.activeElement !== null) {
        var forward = this.camera.forward();

        this.movement.x = movement.x * this.translationSpeed.y;
        this.movement.y = movement.y * this.translationSpeed.y;

        var trans = [this.movement.x, -this.movement.y, 0.0];
        vec3.transformMat4(trans, trans, this.camera.orientation());

        if (event.ctrlKey)
            this.activeElement.transform.scale([this.movement.x * 0.01, this.movement.y * 0.01, 1.0]);
        else
            this.activeElement.transform.rotateY(rad);
        UI.setInspectorContent(this.activeElement.id);
    }
};

LEEWGL.TestApp.prototype.onMouseUp = function(event) {
    this.activeElement = null;
    event.preventDefault();
    event.stopPropagation();
};

LEEWGL.TestApp.prototype.onKeyUp = function(event) {
    this.activeKeys[event.keyCode] = false;
    event.preventDefault();
    event.stopPropagation();
};

LEEWGL.TestApp.prototype.onKeyDown = function(event) {
    this.activeKeys[event.keyCode] = true;
    event.preventDefault();
    event.stopPropagation();
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
    this.clear();
    for (var i = 0; i < this.scene.children.length; ++i) {
        var element = this.scene.children[i];

        if (element.usesTexture === true)
            this.activeShader = this.textureShader;
        else
            this.activeShader = this.colorShader;

        this.activeShader.use(this.gl);

        if (this.picking === true) {
            this.picker.bind(this.gl);

            this.activeShader.uniforms['uOffscreen'](1);

            this.draw(element);
            this.picker.unbind(this.gl);
        }

        this.activeShader.uniforms['uOffscreen'](0);
        this.draw(element);
    }
};

LEEWGL.TestApp.prototype.clear = function() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(LEEWGL.Settings.BackgroundColor.r, LEEWGL.Settings.BackgroundColor.g, LEEWGL.Settings.BackgroundColor.b, LEEWGL.Settings.BackgroundColor.a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};

LEEWGL.TestApp.prototype.draw = function(element) {
    if (element.render === true) {
        if (typeof UI !== 'undefined' && UI.playing === true)
            this.activeShader.uniforms['uVP'](this.gameCamera.viewProjMatrix);
        else
            this.activeShader.uniforms['uVP'](this.camera.viewProjMatrix);

        this.activeShader.uniforms['uAmbient']([0.2, 0.2, 0.2]);

        this.activeShader.uniforms['uLightDirection'](this.light.components['Light'].direction);
        this.activeShader.uniforms['uLightColor'](this.light.components['Light'].color);


        element.draw(this.gl, this.activeShader, this.gl.TRIANGLES);
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
