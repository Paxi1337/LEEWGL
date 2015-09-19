LEEWGL.Collider = function() {
  LEEWGL.REQUIRES.push('Collider');

  extend(LEEWGL.Collider.prototype, LEEWGL.Options.prototype);
};

LEEWGL.Collider.Sphere = function(options) {
  LEEWGL.Collider.call(this);

  this.options = {
    'center': vec3.create(),
    'radius': 10
  };

  this.setOptions(options);

  Object.defineProperties(this, {
    'center': {
      value: this.options['center'],
      enumerable: true,
      writable: true
    },
    'radius': {
      value: this.options['radius'],
      enumerable: true,
      writable: true
    }
  });
};

LEEWGL.Collider.Sphere.prototype = Object.create(LEEWGL.Collider.prototype);

LEEWGL.Collider.Sphere.prototype.create = function(obj) {
  var vectors = obj.vectors;
  var min = vec3.create(),
    max = vec3.create(),
    i = 0,
    p = null;

  for (i = 0; i < vectors.length; ++i) {
    p = vec3.transformMat4(vec3.create(), vectors[i], obj.transform.matrix());
    vec3.min(min, min, p);
    vec3.max(max, max, p);
  }

  this.center = vec3.fromValues(0.5 * (min[0] + max[0]), 0.5 * (min[1] + max[1]), 0.5 * (min[2] + max[2]));

  var maxDistance = 0;
  for (i = 0; i < vectors.length; ++i) {
    p = vec3.transformMat4(vec3.create(), vectors[i], obj.transform.matrix());
    var fromCenter = vec3.subtract(vec3.create(), p, this.center);
    maxDistance = Math.max(maxDistance, vec3.squaredLength(this.center));
  }

  this.radius = Math.sqrt(maxDistance);
};

LEEWGL.Collider.Sphere.prototype.overlaps = function(other) {
  var distanceSquared = vec3.squaredDistance(this.center, other.center);
  return (distanceSquared <= (this.radius + other.radius));
};

LEEWGL.Collider.Sphere.prototype.clone = function(coll) {
  if (typeof coll === 'undefined')
    coll = new LEEWGL.Collider.Sphere(this.options);

  coll.center = vec3.clone(this.center);
  coll.radius = this.radius;
  return coll;
};
