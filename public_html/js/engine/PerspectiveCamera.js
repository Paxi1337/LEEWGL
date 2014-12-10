LEEWGL.PerspectiveCamera = function(fov, aspect, near, far) {
    LEEWGL.Camera.call(this);
    
    this.type = 'PerspectiveCamera';
    
    this.fov = fov !== undefined ? fov : 50;
    this.aspect = aspect !== undefined ? aspect : 1;
    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 1000;
};

LEEWGL.PerspectiveCamera.prototype = Object.create(LEEWGL.Camera.prototype);

LEEWGL.PerspectiveCamera.prototype.perspective = function() {
    mat4.perspective(this.projMatrix, this.fov, this.aspect, this.near, this.far);
};

LEEWGL.PerspectiveCamera.prototype.clone = function() {
    var camera = new LEEWGL.PerspectiveCamera();
    LEEWGL.Camera.prototype.clone.call(this, camera);
    
    camera.fov = this.fov;
    camera.aspect = this.aspect;
    camera.near = this.near;
    camera.far = this.far;
    
    camera.proj.copy(camera.proj, this.proj);
    
    return camera;
};
