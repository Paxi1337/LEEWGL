LEEWGL.Scene = function() {
    // call Object3D constructor
    LEEWGL.Object3D.call(this);
    
    this.type = 'Scene';
    
    this.autoUpdate = true; 
};

LEEWGL.Scene.prototype = Object.create(LEEWGL.Object3D.prototype);

// extend prototype

LEEWGL.Scene.prototype.clone = function(object) {
    if(object === undefined) 
        object = new LEEWGL.Scene();
    
    LEEWGL.Object3D.prototype.clone.call(this, object);
    
    object.autoUpdate = this.autoUpdate;
    
    return object;
};

LEEWGL.Scene.prototype.pickIndicesRegional = function(x1, x2, y1, y2, arr) {
    var width = Math.abs(x2 -x1);
    var height = Math.abs(y2 - y1);
    
    if(arr)
        arr.clear();
    else
        arr = [];
    
    if(object === undefined) 
        object = new LEEWGL.Scene();
    
    LEEWGL.Object3D.prototype.clone.call(this, object);
    
    object.autoUpdate = this.autoUpdate;
    
    return object;
};

