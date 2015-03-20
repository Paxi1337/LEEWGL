LEEWGL.PerspectiveCamera = function(options) {
    LEEWGL.Camera.call(this, options);

    this.type = 'PerspectiveCamera';

    this.fov = (typeof options.fov !== undefined) ? options.fov : 50;
    this.aspect = (typeof options.aspect !== undefined) ? options.aspect : 1;
    this.near = (typeof options.near !== undefined) ? options.near : 0.1;
    this.far = (typeof options.far !== undefined) ? options.far : 1000;

    this._horizontalAngle = 0.0;
    this._verticalAngle = 0.0;

    this.invertY = (typeof options.invertY !== undefined) ? options.invertY : true;;
};

LEEWGL.PerspectiveCamera.prototype = Object.create(LEEWGL.Camera.prototype);

LEEWGL.PerspectiveCamera.prototype.orientation = function() {
    var orientation = mat4.create();
    mat4.rotate(orientation, orientation, LEEWGL.Math.degToRad(this._verticalAngle), [1.0, 0.0, 0.0]);
    mat4.rotate(orientation, orientation, LEEWGL.Math.degToRad(this._horizontalAngle), [0.0, 1.0, 0.0]);
    return orientation;
};

LEEWGL.PerspectiveCamera.prototype.offsetOrientation = function(up, right) {
    this._horizontalAngle += right;
    this._verticalAngle += up;
    this.normalizeAngles();
};

LEEWGL.PerspectiveCamera.prototype.setLookAt = function(lookAt) {
    var direction = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), lookAt, this.transform.position));
    this._verticalAngle = LEEWGL.Math.degToRad(Math.asin(-direction[1]));
    this._horizontalAngle = LEEWGL.Math.degToRad(Math.atan(-direction[0]));
    this.normalizeAngles();
};

LEEWGL.PerspectiveCamera.prototype.view = function() {
    return mat4.multiply(this.viewMatrix, this.orientation(), mat4.translate(mat4.create(), mat4.create(), vec3.negate(vec3.create(), this.transform.position)));
};

LEEWGL.PerspectiveCamera.prototype.projection = function() {
    mat4.perspective(this.projMatrix, LEEWGL.Math.degToRad(this.fov), this.aspect, this.near, this.far);
    return this.projMatrix;
};

LEEWGL.PerspectiveCamera.prototype.normalizeAngles = function() {
    this._horizontalAngle = this._horizontalAngle % 360.0;

    if (this._horizontalAngle < 0.0)
        this._horizontalAngle += 360.0;

    if (this._verticalAngle > LEEWGL.Camera.MaxVerticalAngle)
        this._verticalAngle = LEEWGL.Camera.MaxVerticalAngle;
    else if (this._verticalAngle < -LEEWGL.Camera.MaxVerticalAngle)
        this._verticalAngle = -LEEWGL.Camera.MaxVerticalAngle;
};

LEEWGL.PerspectiveCamera.prototype.update = function() {
    this.projection();
    this.view();
    mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
};

LEEWGL.PerspectiveCamera.prototype.forward = function() {
    var forward = vec4.transformMat4(vec4.create(), [0, 0, -1, 1], mat4.invert(mat4.create(), this.orientation()));
    return [forward[0], forward[1], forward[2]];
};

LEEWGL.PerspectiveCamera.prototype.right = function() {
    var right = vec4.transformMat4(vec4.create(), [1, 0, 0, 1], mat4.invert(mat4.create(), this.orientation()));
    return [right[0], right[1], right[2]];
};

LEEWGL.PerspectiveCamera.prototype.down = function() {
    var down = vec4.transformMat4(vec4.create(), [0, -1, 0, 1], mat4.invert(mat4.create(), this.orientation()));
    return [down[0], down[1], down[2]];
};

LEEWGL.PerspectiveCamera.prototype.clone = function() {
    var camera = new LEEWGL.PerspectiveCamera();
    LEEWGL.Camera.prototype.clone.call(this, camera);

    camera.fov = this.fov;
    camera.aspect = this.aspect;
    camera.near = this.near;
    camera.far = this.far;
    camera.invertY = this.invertY;

    camera._horizontalAngle = this._horizontalAngle;
    camera._verticalAngle = this._verticalAngle;

    return camera;
};
