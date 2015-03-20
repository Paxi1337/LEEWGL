LEEWGL.DirectionalLight = function() {
    LEEWGL.Object3D.call(this);

    this.type = 'DirectionalLight';

    this.addComponent(new LEEWGL.Component.Light());
};

LEEWGL.DirectionalLight.prototype = Object.create(LEEWGL.Object3D.prototype);
