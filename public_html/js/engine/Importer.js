LEEWGL.REQUIRES.push('Importer');

LEEWGL.Importer = function() {
  var ajax = new LEEWGL.AsynchRequest();

  this.parseCollada = function(xml) {

    var getInput = function(sem, par) {
      var el = xml.querySelectorAll("input[semantic=" + sem + "]", par)[0];
      return xml.querySelectorAll(el.getAttribute("source"), mesh)[0];
    };
    var parseVals = function(el) {
      var strvals = el.textContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
      return strvals.split(/\s+/).map(parseFloat);
    };

    var mesh = xml.querySelectorAll("geometry > mesh")[0];
    var triangles = xml.querySelectorAll("triangles")[0];
    var polylist = xml.querySelectorAll("polylist")[0];

    var vrtInput = getInput("VERTEX", polylist);
    var posInput = getInput("POSITION", vrtInput);
    var nrmInput = getInput("NORMAL", polylist);
    var nrmList = parseVals(xml.querySelectorAll("float_array", nrmInput)[0]);
    var idxList = parseVals(xml.querySelectorAll("p", polylist)[0]);

    var vertices = parseVals(xml.querySelectorAll("float_array", posInput)[0]);

    console.log(vertices);

    console.log(xml.querySelectorAll('asset'));
    console.log(xml.querySelectorAll('library_images image'));
    console.log(xml.querySelectorAll('library_materials material'));
    console.log(xml.querySelectorAll('library_effects effect'));
    console.log(xml.querySelectorAll('library_geometries geometry'));
    console.log(xml.querySelectorAll('library_cameras camera'));
    console.log(xml.querySelectorAll('library_lights light'));
    console.log(xml.querySelectorAll('library_controllers controller'));
    console.log(xml.querySelectorAll('library_animations animation'));
    console.log(xml.querySelectorAll('library_visual_scenes visual_scene'));
    console.log(xml.querySelectorAll('library_kinematics_models kinematics_model'));
  };

  this.import = function(path, gl) {
    var geometry = new LEEWGL.Geometry3D();
    var s = ajax.send('GET', LEEWGL.ROOT + path, false).response.responseText;

    if (path.toLowerCase().indexOf('.obj') !== -1) {
      var vertices = [],
        normals = [],
        textures = [],
        result = {};

      result.vertices = [];
      result.normals = [];
      result.textures = [];
      result.hashIndices = {};
      result.indices = [];
      result.index = 0;

      var lines = s.split('\n');

      /**
       * Testing conditions for string
       * @type {RegExp}
       */
      var VERTEX_REGEX = /^v\s/;
      var NORMAL_REGEX = /^vn\s/;
      var TEXTURE_REGEX = /^vt\s/;
      var FACE_REGEX = /^f\s/;
      var WHITESPACE_REGEX = /\s+/;

      for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].trim();
        var elements = line.split(WHITESPACE_REGEX);
        elements.shift();

        if (VERTEX_REGEX.test(line)) {
          vertices.push.apply(vertices, elements);
        } else if (NORMAL_REGEX.test(line)) {
          normals.push.apply(normals, elements);
        } else if (TEXTURE_REGEX.test(line)) {
          textures.push.apply(textures, elements);
        } else if (FACE_REGEX.test(line)) {
          var quad = false;
          for (var j = 0; j < elements.length; ++j) {
            if (!quad && j === 3) {
              quad = true;
              j = 2;
            }

            if (elements[j] in result.hashIndices) {
              result.indices.push(result.hashIndices[elements[j]]);
            } else {
              var vertex = elements[j].split('/');

              result.vertices.push(+vertices[(vertex[0] - 1) * 3 + 0]);
              result.vertices.push(+vertices[(vertex[0] - 1) * 3 + 1]);
              result.vertices.push(+vertices[(vertex[0] - 1) * 3 + 2]);

              if (textures.length) {
                result.textures.push(+textures[(vertex[1] - 1) * 2 + 0]);
                result.textures.push(+textures[(vertex[1] - 1) * 2 + 1]);
              }

              result.normals.push(+normals[(vertex[2] - 1) * 3 + 0]);
              result.normals.push(+normals[(vertex[2] - 1) * 3 + 1]);
              result.normals.push(+normals[(vertex[2] - 1) * 3 + 2]);

              result.hashIndices[elements[j]] = result.index;
              result.indices.push(result.index);

              result.index++;
            }
            if (j === 3 && quad) {
              // add v0/t0/vn0 onto the second triangle
              result.indices.push(result.hashIndices[elements[0]]);
            }
          }
        }
      }

      geometry.alias = 'Imported Model ' + geometry.id;
      geometry.vertices.position = result.vertices;
      geometry.indices = result.indices;
      geometry.vertices.normal = result.normals;
      geometry.vertices.uv = result.textures;
      geometry.facesNum = result.index;

      geometry.setBuffer(gl);
      geometry.addColor(gl, ColorHelper.getUniqueColor());
      geometry.setColorBuffer(gl);

      return geometry;
    }
  };
};
