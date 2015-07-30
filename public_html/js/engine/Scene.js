LEEWGL.REQUIRES.push('Scene');

LEEWGL.Scene = function() {
  LEEWGL.Object3D.call(this);
  this.name = 'LEEWGL.Scene';
  this.type = 'Scene';
  this.shaders = {};
  this.activeShader;
};

LEEWGL.Scene.prototype = Object.create(LEEWGL.Object3D.prototype);

LEEWGL.Scene.prototype.addShader = function(name, shader) {
  this.shaders[name] = shader;
};

LEEWGL.Scene.prototype.setActiveShader = function(name) {
  this.activeShader = this.shaders[name];
};

LEEWGL.Scene.prototype.clone = function(scene) {
  if (typeof scene === 'undefined')
    scene = new LEEWGL.Scene();

  LEEWGL.Object3D.prototype.clone.call(this, scene);

  for (var name in this.shaders) {
    if (this.shaders.hasOwnProperty(name)) {
      scene.shaders[name] = this.shaders[name];
    }
  }
  return scene;
};
