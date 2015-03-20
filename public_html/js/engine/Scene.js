LEEWGL.Scene = function() {
    LEEWGL.Object3D.call(this);

    this.type = 'Scene';

    this.autoUpdate = true;
};

LEEWGL.Scene.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Scene.prototype.clone = function(object) {
    if(object === undefined)
        object = new LEEWGL.Scene();

    LEEWGL.Object3D.prototype.clone.call(this, object);

    object.autoUpdate = this.autoUpdate;

    return object;
};
