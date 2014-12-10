/// Lightweight Editor Environment Web GL

var LEEWGL = {version: '0.1'};

/// node.js compatibility
if (typeof module === 'object') {
    module.exports = LEEWGL;
}

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.button
LEEWGL.MOUSE = {left: 0, middle: 1, right: 2};


LEEWGL.Core = function (options) {
    var _canvas = options.canvas !== undefined ? options.canvas : document.createElement('canvas'),
            _context = options.context !== undefined ? options.context : null;

    var _app = null;

    // public properties
    this.canvas = _canvas;
    this.context = null;

    var _this = this,
            _programs = [],
            _currentProgram = null,
            _currentFramebuffer = null,
            _currentCamera = null,
            _viewportX = 0,
            _viewportY = 0,
            _viewportWidth = _canvas.width,
            _viewportHeight = _canvas.height,
            _quit = false;

    // initialize webGL
    var _gl;

    var _lastTS = null;

    // execution block
    try {
        _gl = _context || _canvas.getContext('webgl') || _canvas.getContext('experimental-webgl');
        if (_gl === null) {
            if (_canvas.getContext('webgl') === null) {
                throw 'Error creating WebGL context with selected attributes.';
            } else {
                throw 'Error creating WebGL context.';
            }
        }
    } catch (error) {
        console.error(error);
    }

    this.context = _gl;

    this.getContext = function () {
        return _gl;
    };

    this.setSize = function (width, height, updateStyle) {
        _canvas.width = width;
        _canvas.height = height;

        if (updateStyle === true) {
            _canvas.style.width = width + 'px';
            _canvas.style.height = height + 'px';
        }
    };

    this.setViewport = function (x, y, width, height) {
        _viewportX = x;
        _viewportY = y;

        _viewportWidth = width;
        _viewportHeight = height;

        _gl.viewport(_viewportX, _viewportY, _viewportWidth, _viewportHeight);
    };

    this.attachApp = function (app) {
        _app = app;
    };

    this.initMouse = function () {
        if (_app === null) {
            console.error("LEEWGL.Core initMouse: No app attached.");
            return null;
        }
        _canvas.onmousedown = _app.onMouseDown.bind(_app);
        document.onmouseup = _app.onMouseUp.bind(_app);
        document.onmousemove = _app.onMouseMove.bind(_app);
    };

    this.init = function () {
        this.initMouse();

        this.setViewport(0, 0, 500, 500);
        this.setSize(500, 500, true);

        if (_app !== null)
            _app.onCreate();
    };

    this.run = function (now) {
        window.requestAnimationFrame(_this.run);
        if (!_lastTS)
            _lastTS = now;

        var requiredElapsed = 100 / 30; // 30 fps
        var elapsedTime = now - _lastTS;

        if (elapsedTime > requiredElapsed) {
            _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
            if (_app !== null) {
                _app.onUpdate();
                _app.onRender();
            }

            _lastTS = now;
        }
    };
};


