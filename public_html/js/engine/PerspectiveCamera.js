LEEWGL.PerspectiveCamera = function (fov, aspect, near, far) {
    LEEWGL.Camera.call(this);

    this.type = 'PerspectiveCamera';

    this.fov = fov !== undefined ? fov : 50;
    this.aspect = aspect !== undefined ? aspect : 1;
    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 1000;

    this._horizontalAngle = 0.0;
    this._verticalAngle = 0.0;

    this.lookAt = vec3.fromValues(0.0, 0.0, -1.0);

    this.invertY = true;
};

LEEWGL.PerspectiveCamera.prototype = Object.create(LEEWGL.Camera.prototype);

LEEWGL.PerspectiveCamera.prototype.orientation = function () {
    var orientation = mat4.create();
    mat4.rotate(orientation, orientation, this._verticalAngle, [1.0, 0.0, 0.0]);
    mat4.rotate(orientation, orientation, this._horizontalAngle, [0.0, 1.0, 0.0]);
    return orientation;
};

LEEWGL.PerspectiveCamera.prototype.setLookAt = function (lookAt) {
    this.lookAt = lookAt;
};

LEEWGL.PerspectiveCamera.prototype.view = function () {
    var lookAt = mat4.create();
    mat4.lookAt(this.viewMatrix, this.transform.position, [this.transform.position[0] + this.lookAt[0], this.transform.position[1] + this.lookAt[1], this.transform.position[2] + this.lookAt[2]], this.up);
};

LEEWGL.PerspectiveCamera.prototype.projection = function () {
    mat4.perspective(this.projMatrix, this.fov, this.aspect, this.near, this.far);
    return this.projMatrix;
};

LEEWGL.PerspectiveCamera.prototype.normalizeAngles = function () {
    this._horizontalAngle = this._horizontalAngle % 360.0;

    if (this._verticalAngle > 85.0)
        this._verticalAngle = 85.0;
    else if (this._verticalAngle < -85.0)
        this._verticalAngle = -85.0;
};

LEEWGL.PerspectiveCamera.prototype.update = function () {
    this.projection();
    this.view();
    this.viewProjMatrix = mat4.multiply(mat4.create(), this.projMatrix, this.viewMatrix);
};

LEEWGL.PerspectiveCamera.prototype.move = function (vec) {
    var viewDist = vec3.length(this.lookAt);
    var lookAt = [vec[0] / viewDist, vec[1] / viewDist, vec[2] / viewDist];
    vec3.add(this.transform.position, this.transform.position, vec3.transformMat4(vec3.create(), lookAt, this.orientation()));
};

LEEWGL.PerspectiveCamera.prototype.rotate = function (upAngle, rightAngle) {
    if (this.invertY === true)
        this._verticalAngle += upAngle;
    else
        this._verticalAngle -= upAngle;

    this._horizontalAngle += rightAngle;

    this.normalizeAngles();

    var lookAt = vec3.create();
    
    var rotation = mat4.create();
    mat4.rotateX(rotation, mat4.create(), upAngle);
    mat4.rotateY(rotation, rotation, rightAngle);
     
    vec3.transformMat4(lookAt, vec3.fromValues(this.lookAt[0], this.lookAt[1], this.lookAt[2]), rotation);
    vec3.copy(this.lookAt, lookAt);
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
