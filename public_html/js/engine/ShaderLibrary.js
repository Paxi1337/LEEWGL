/**
 * Class to add the various shader chunks together and output them in string representation
 * @constructor
 */
LEEWGL.ShaderLibrary = function() {
  LEEWGL.REQUIRES.push('ShaderLibrary');
  /** @inner {object} */
  this.vertex = {};
  /** @inner {object} */
  this.fragment = {};
  /** @inner {object} */
  this.chunks = {};

  this.initializeChunks = function() {
    this.chunks[LEEWGL.ShaderLibrary.INIT] = {
      vertex: {
        parameters: [],
        main: [
          "void main() {",
        ]
      },
      fragment: {
        parameters: [
          "precision highp float;",
        ],
        main: [
          "void main() {",
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.DEFAULT] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_default_para'],
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_default'],
        ]
      },
      fragment: {
        parameters: [],
        main: []
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.COLOR] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_color_para']
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_color']
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_color_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_color']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.TEXTURE] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_texture_para']
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_texture']
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_texture_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_texture_sampler'],
          LEEWGL.ShaderChunk['fragment_texture']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.PICKING] = {
      attributes: [],
      vertex: {
        parameters: [],
        main: []
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_picking_para']
        ],
        main: [
          "if(uOffscreen == 1) {",
          LEEWGL.ShaderChunk['fragment_colormap'],
          "return;",
          "}"
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.AMBIENT] = {
      attributes: [],
      vertex: {
        parameters: [],
        main: []
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_ambient_light_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_ambient_light']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_normal_para'],
          LEEWGL.ShaderChunk['vertex_directional_light_para']
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_normal'],
          LEEWGL.ShaderChunk['vertex_directional_light']
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_directional_light_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_directional_light']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.SPOT] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_normal_para'],
          LEEWGL.ShaderChunk['vertex_spot_light_para']
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_normal'],
          LEEWGL.ShaderChunk['vertex_spot_light']
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_spot_light_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_spot_light']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.POINT] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_normal_para'],
          LEEWGL.ShaderChunk['vertex_point_light_para']
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_normal'],
          LEEWGL.ShaderChunk['vertex_point_light']
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_point_light_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_point_light']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.DEPTH] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_depth_para'],
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_depth'],
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_depth_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_depth']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.SHADOW_MAPPING_POSITIONAL_LIGHT] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_shadow_mapping_position_light_para'],
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_shadow_mapping_position_light'],
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_shadow_mapping_position_light_para'],
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_shadow_mapping_position_light']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.BILLBOARD] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_billboard_para'],
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_billboard'],
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_billboard_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_billboard']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.BILLBOARD_FIXED] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_billboard_fixed_para'],
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_billboard_fixed'],
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_billboard_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_billboard']
        ]
      }
    };

    this.chunks[LEEWGL.ShaderLibrary.BUMPMAP] = {
      vertex: {
        parameters: [
          LEEWGL.ShaderChunk['vertex_normal_mapping_para'],
        ],
        main: [
          LEEWGL.ShaderChunk['vertex_normal_mapping'],
        ]
      },
      fragment: {
        parameters: [
          LEEWGL.ShaderChunk['fragment_normal_mapping_para']
        ],
        main: [
          LEEWGL.ShaderChunk['fragment_normal_mapping']
        ]
      }
    };
  };

  this.addParameterChunk = function(type) {
    this.vertex[type] = {};
    this.vertex[type].main = [];
    this.vertex[type].parameters = [];
    this.fragment[type] = {};
    this.fragment[type].main = [];
    this.fragment[type].parameters = [];

    this.vertex[type].parameters = this.vertex[type].parameters.concat(this.chunks[type].vertex.parameters);
    this.vertex[type].main = this.vertex[type].main.concat(this.chunks[type].vertex.main);
    this.fragment[type].parameters = this.fragment[type].parameters.concat(this.chunks[type].fragment.parameters);
    this.fragment[type].main = this.fragment[type].main.concat(this.chunks[type].fragment.main);
  };

  this.removeParameterChunk = function(type) {
    delete this.vertex[type];
    delete this.fragment[type];
  };

  this.addParameterChunks = function(types) {
    for (var i = 0; i < types.length; ++i) {
      this.addParameterChunk(types[i]);
    }
  };

  this.out = function(type) {
    var outPara = '';
    var outMain = '';
    var arr = this.vertex;

    if (type === LEEWGL.Shader.FRAGMENT)
      arr = this.fragment;

    for (var index in arr) {
      if (arr.hasOwnProperty(index)) {
        outPara += arr[index].parameters.join('\n');
        outMain += arr[index].main.join('\n');
      }
    }
    outMain += '}';
    return outPara + outMain;
  };

  this.reset = function() {
    this.vertex = {};
    this.fragment = {};
  };

  this.initializeChunks();
};

LEEWGL.ShaderLibrary.INIT = 0;
LEEWGL.ShaderLibrary.DEFAULT = 1;
LEEWGL.ShaderLibrary.COLOR = 2;
LEEWGL.ShaderLibrary.TEXTURE = 3;
LEEWGL.ShaderLibrary.PICKING = 4;
LEEWGL.ShaderLibrary.AMBIENT = 5;
LEEWGL.ShaderLibrary.DIRECTIONAL = 6;
LEEWGL.ShaderLibrary.SPOT = 7;
LEEWGL.ShaderLibrary.POINT = 8;
LEEWGL.ShaderLibrary.BUMPMAP = 9;
LEEWGL.ShaderLibrary.SHADOW_MAPPING_POSITIONAL_LIGHT = 10;
LEEWGL.ShaderLibrary.BILLBOARD = 11;
LEEWGL.ShaderLibrary.BILLBOARD_FIXED = 12;

/**
 * window load event to set global
 */
var init = function() {
  var shaderLibrary = new LEEWGL.ShaderLibrary();
  /** @global */
  window.SHADER_LIBRARY = shaderLibrary;
};

addEventToWindow('onload', init);
