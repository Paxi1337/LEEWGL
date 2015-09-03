LEEWGL.REQUIRES.push('Scene');

/**
 *
 * @constructor
 * @augments LEEWGL.GameObject
 * @param {object} options
 */
LEEWGL.Scene = function(options) {
  LEEWGL.GameObject.call(this, options);
  this.type = 'Scene';

  Object.defineProperties(this, {
    'shaders': {
      value: {},
      enumerable: true,
      writable: true
    },
    'activeShader': {
      value: null,
      enumerable: false,
      writable: true
    }
  });
};

LEEWGL.Scene.prototype = Object.create(LEEWGL.GameObject.prototype);

LEEWGL.Scene.prototype.setShader = function(name, shader) {
  this.shaders[name] = shader;
};

LEEWGL.Scene.prototype.setActiveShader = function(name) {
  this.activeShader = this.shaders[name];
};

LEEWGL.Scene.prototype.clone = function(scene, cloneID, recursive, addToAlias) {
  if (typeof scene === 'undefined')
    scene = new LEEWGL.Scene();

  LEEWGL.GameObject.prototype.clone.call(this, scene, cloneID, recursive, addToAlias);

  for (var name in this.shaders) {
    if (this.shaders.hasOwnProperty(name)) {
      scene.shaders[name] = this.shaders[name].clone();
    }
  }
  return scene;
};

LEEWGL.Scene.prototype.import = function(gl, stringified_json) {
  var json = JSON.parse(stringified_json);
  var className, child;

  var scene = new LEEWGL.Scene(json);
  scene.shaders = json.shaders;

  var createChildren = function(jsonElement, element) {
    if (jsonElement.children.length > 0) {
      for (var i = 0; i < jsonElement.children.length; ++i) {
        var child = jsonElement.children[i];
        className = functionFromString('LEEWGL.' + child.type);
        element.add(new className(child.options));

        for (var name in child.components) {
          var component = element.children[i].components[name];
          className = functionFromString('LEEWGL.Component.' + name);
          component = new className(component);
        }

        element.children[i].transform.dispatchEvent({
          'type': 'update-all',
          'data': {
            'position': child.transform.position,
            'translation': child.transform.transVec,
            'rotation': child.transform.rotVec,
            'scale': child.transform.scaleVec,
          }
        });

        if (typeof element.children[i].components['Texture'] !== 'undefined') {
          element.children[i].components['Texture'].dispatchEvent({
            'type': 'init',
            'data': {
              'gl': gl,
              'src': child.components['Texture'].src
            }
          });
        }
        createChildren(child, element.children[i]);
      }
    }
  };

  for (var i = 0; i < json.children.length; ++i) {
    child = json.children[i];
    className = functionFromString('LEEWGL.' + child.type);
    scene.add(new className(child.options));
    createChildren(child, scene.children[i]);
    scene.children[i].transform.dispatchEvent({
      'type': 'update-all',
      'data': {
        'position': child.transform.position,
        'translation': child.transform.transVec,
        'rotation': child.transform.rotVec,
        'scale': child.transform.scaleVec,
      }
    });
    scene.children[i].parent = scene;
  }

  // var validateParent = function() {
  //   this.parent = scene;
  // };

  // scene.traverse(validateParent);

  return scene;
};
