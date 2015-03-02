LEEWGL.DirectionalLight = function() {
    LEEWGL.Object3D.call(this);
    
    this.direction = [0.0, 0.0, 0.0];   
    /// MATERIAL??
    this.color = [0.0, 0.0, 0.0];
};

LEEWGL.DirectionalLight.prototype = Object.create(LEEWGL.Object3D.prototype);

