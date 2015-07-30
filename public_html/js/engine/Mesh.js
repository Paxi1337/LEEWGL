LEEWGL.REQUIRES.push('Mesh');

LEEWGL.Mesh = function() {
  Object.defineProperty(this, 'id', {
    value: LEEWGL.MeshCount++
  });

  this.type = 'Mesh';

  this.vertices = [];
  this.color = [];

  this.faces = [];

  this.boundingBox = null;
  this.boundingSphere = null;
};

LEEWGL.Mesh.prototype = {
  constructor: LEEWGL.Mesh,

  //    applyMatrix : function(mat) {
  //        var normalMat = mat3.normalFromMat4(normalMat, mat);
  //        for(var i = 0; i < this.vertices.length; ++i) {
  //            var vertex = this.vertices[i];
  //            vec4.transformMat4()
  //        }
  //    }
};
