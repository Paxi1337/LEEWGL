LEEWGL.Camera = function () {
    LEEWGL.Object3D.call(this);
    this.type = 'Camera';

    this.viewMatrix = mat4.create();
    this.projMatrix = mat4.create();
    this.viewProjMatrix = mat4.create();
};

LEEWGL.Camera.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Camera.prototype.clone = function (camera) {
    if(camera === undefined)
        camera = new LEEWGL.Camera();

    LEEWGL.Object3D.prototype.clone.call(this, camera);

    mat4.copy(camera.viewMatrix, this.viewMatrix);
    mat4.copy(camera.projMatrix, this.projMatrix);
    mat4.copy(camera.viewProjMatrix, this.viewProjMatrix);

    return camera;
};
