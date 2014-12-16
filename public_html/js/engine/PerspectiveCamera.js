LEEWGL.PerspectiveCamera = function (fov, aspect, near, far) {
    LEEWGL.Camera.call(this);

    this.type = 'PerspectiveCamera';

    this.fov = fov !== undefined ? fov : 50;
    this.aspect = aspect !== undefined ? aspect : 1;
    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 1000;

    this._horizontalAngle = 0.0;
    this._verticalAngle = 0.0;

    this.orientMat = mat4.create();
};

LEEWGL.PerspectiveCamera.prototype = Object.create(LEEWGL.Camera.prototype);

LEEWGL.PerspectiveCamera.prototype.orientation = function () {
    var orientation = mat4.create();
    mat4.rotate(orientation, orientation, this._verticalAngle, vec3.set(vec3.create(), 1.0, 0.0, 0.0));
    mat4.rotate(orientation, orientation, this._horizontalAngle, vec3.set(vec3.create(), 0.0, 1.0, 0.0));
    return orientation;
};

LEEWGL.PerspectiveCamera.prototype.offsetOrientation = function (upAngle, rightAngle) {
    this._horizontalAngle += rightAngle;
    this._verticalAngle += upAngle;
    this.normalizeAngles();
};

LEEWGL.PerspectiveCamera.prototype.view = function () {
    this.viewMatrix = mat4.multiply(this.viewMatrix, this.orientation(), mat4.translate(mat4.create(), mat4.create(), vec3.negate(vec3.create(), this.position)));
};

LEEWGL.PerspectiveCamera.prototype.projection = function () {
    mat4.perspective(this.projMatrix, this.fov, this.aspect, this.near, this.far);
};

LEEWGL.PerspectiveCamera.prototype.normalizeAngles = function () {
    this._horizontalAngle = this._horizontalAngle % 360.0;
    if (this._horizontalAngle < 0.0)
        this._horizontalAngle += 360.0;

    if (this._verticalAngle > 85.0)
        this._verticalAngle = 85.0;
    else if (this._verticalAngle < -85.0)
        this._verticalAngle = -85.0;
};

LEEWGL.PerspectiveCamera.prototype.update = function () {
//    console.log(this.position);
    this.view();
    this.projection();
    this.viewProjMatrix = mat4.multiply(mat4.create(), this.projMatrix, this.viewMatrix);
};

LEEWGL.PerspectiveCamera.prototype.clone = function () {
    var camera = new LEEWGL.PerspectiveCamera();
    LEEWGL.Camera.prototype.clone.call(this, camera);

    camera.fov = this.fov;
    camera.aspect = this.aspect;
    camera.near = this.near;
    camera.far = this.far;

    return camera;
};
