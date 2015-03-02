LEEWGL.DirectionalLight = function() {
    LEEWGL.Object3D.call(this);
    
    this.direction = [-1.0, 1.0, -1.0];   
    /// MATERIAL??
    this.color = [1.0, 1.0, 1.0];
};

LEEWGL.DirectionalLight.prototype = Object.create(LEEWGL.Object3D.prototype);

