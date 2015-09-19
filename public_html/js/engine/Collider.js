/**
 * @constructor
 */
LEEWGL.Collider = function() {
  LEEWGL.REQUIRES.push('Collider');
};

/**
 * @constructor
 * @augments LEEWGL.Collider
 */
LEEWGL.Collider.Sphere = function() {
  LEEWGL.Collider.call(this);

  Object.defineProperties(this, {
    'center': {
      value: vec3.create(),
      enumerable: true,
      writable: true
    },
    'centerTrans' : {
      value: vec3.create(),
      enumerable: true,
      writable: true
    },
    'radius': {
      value: 0,
      enumerable: true,
      writable: true
    },
    'radiusTrans': {
      value: 0,
      enumerable: true,
      writable: true
    }
  });
};

LEEWGL.Collider.Sphere.prototype = Object.create(LEEWGL.Collider.prototype);

/**
 * Creates a bounding sphere centered at the balance point of the obj
 * @param  {LEEWGL.Geometry3D} obj
 */
LEEWGL.Collider.Sphere.prototype.create = function(obj) {
  this.calculateCenter(obj);
  this.calculateRadius(obj);
};

/**
 * Calculate the center point of the bounding sphere
 * @param  {LEEWGl.Geometry3D} obj
 */
LEEWGL.Collider.Sphere.prototype.calculateCenter = function(obj) {
  var vectors = obj.vectors;
  var min = vec3.create(),
    max = vec3.create();
  var n = vectors.length;
  for (var i = 0; i < n; ++i) {
    var p = vectors[i];
    vec3.min(min, min, p);
    vec3.max(max, max, p);
  }

  this.center = vec3.fromValues(0.5 * (min[0] + max[0]), 0.5 * (min[1] + max[1]), 0.5 * (min[2] + max[2]));
  this.transformCenter(obj);
};

/**
 * Calculate the radius of the bounding sphere
 * @param  {LEEWGl.Geometry3D} obj
 */
LEEWGL.Collider.Sphere.prototype.calculateRadius = function(obj) {
  var vectors = obj.vectors;
  var n = vectors.length;
  var maxDistance = 0;
  for (var i = 0; i < n; ++i) {
    var p = vectors[i];
    maxDistance = Math.max(maxDistance, vec3.squaredDistance(p, this.center));
  }

  this.radius = Math.sqrt(maxDistance);
  this.transformRadius(obj);
};

/**
 * Transform the center point
 * @param  {LEEWGl.Geometry3D} obj
 */
LEEWGL.Collider.Sphere.prototype.transformCenter = function(obj) {
  vec3.transformMat4(this.centerTrans, this.center, obj.transform.matrix());
};

/**
 * Transform the radius
 * @param  {LEEWGl.Geometry3D} obj
 */
LEEWGL.Collider.Sphere.prototype.transformRadius = function(obj) {
  var max = 0, scale = obj.transform.scaleVec;

  for(var i = 0; i < scale.length; ++i) {
    max = Math.max(max, scale[i]);
  }

  /// multiply radius with max scale - not considering axis
  this.radiusTrans = this.radius * max;
};

/**
 * Updates the bounding sphere
 * @param  {LEEWGL.Geometry3D} obj
 */
LEEWGL.Collider.Sphere.prototype.update = function(obj) {
  this.transformCenter(obj);
  this.transformRadius(obj);
};

/**
 * Tests if this bounding sphere overlaps with given other bounding sphere
 * @param  {LEEWGL.Collider.Sphere} other
 * @return {bool}
 */
LEEWGL.Collider.Sphere.prototype.overlaps = function(other) {
  var distanceSquared = vec3.squaredDistance(this.centerTrans, other.centerTrans);
  return (distanceSquared <= (this.radiusTrans + other.radiusTrans));
};

/**
 * Clones the bounding sphere object
 * @param  {LEEWGL.Collider.Sphere} coll
 * @return {LEEWGL.Collider.Sphere} coll
 */
LEEWGL.Collider.Sphere.prototype.clone = function(coll) {
  if (typeof coll === 'undefined')
    coll = new LEEWGL.Collider.Sphere(this.options);

  coll.center = vec3.clone(this.center);
  coll.centerTrans = vec3.clone(this.centerTrans);
  coll.radius = this.radius;
  coll.radiusTrans = this.radiusTrans;
  return coll;
};
