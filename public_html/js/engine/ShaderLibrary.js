LEEWGL.ShaderLibrary = function() {
    this.vertex = {
        parameters: [],
        main: []
    };
    this.fragment = {
        parameters: [],
        main: []
    };

    this.chunks = {};
    this.chunks[LEEWGL.ShaderLibrary.DEFAULT] = {
        vertex: {
            parameters: [
                LEEWGL.ShaderChunk['vertex_default_para'],
            ],
            main: [
                "void main() {",
                LEEWGL.ShaderChunk['vertex_default'],
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
                LEEWGL.ShaderChunk['fragment_color_light']
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
                LEEWGL.ShaderChunk['fragment_texture_light']
            ]
        }
    };

    this.chunks[LEEWGL.ShaderLibrary.PICKING] = {
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

    this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL_AMBIENT] = {
        vertex: {
            parameters: [
                LEEWGL.ShaderChunk['vertex_light_para'],
                LEEWGL.ShaderChunk['vertex_normal_para']
            ],
            main: [
                LEEWGL.ShaderChunk['vertex_light_ambient_directional']
            ]
        },
        fragment: {
            parameters: [
                LEEWGL.ShaderChunk['fragment_light_para']
            ],
            main: [

            ]
        }
    };

    this.addParameterChunk = function(type) {
        this.vertex.parameters = this.vertex.parameters.concat(this.chunks[type].vertex.parameters);
        this.vertex.main = this.vertex.main.concat(this.chunks[type].vertex.main);
        this.fragment.parameters = this.fragment.parameters.concat(this.chunks[type].fragment.parameters);
        this.fragment.main = this.fragment.main.concat(this.chunks[type].fragment.main);
    };

    this.getParameterNames = function() {
        var uniforms = [];
        var attributes = [];

        var fModel = (function(model, shader) {
            return that.transform.matrix;
        });
        var fVertexPosition = (function(that) {
            return that.buffers.vertex;
        });
        var fVertexNormal = (function(that) {
            var normalMatrix = mat4.create();
            mat4.invert(normalMatrix, that.transform.matrix());
            mat4.transpose(normalMatrix, normalMatrix);
            return normalMatrix;
        });
        var fVertexColor = (function(that) {
            return that.buffers.color;
        });
        var fTextureCoord = (function(that) {
            return that.buffers.texture;
        });
        var fColorMap = (function(that) {
            return new Float32Array(that.buffers.vertex.colorMapColor);
        });
        var fAmbient = (function(light, shader) {
            shader.uniforms['uAmbient']([0.5, 0.5, 0.5]);
        });
        var fLightDirection = (function(light, shader) {
            shader.uniforms['uLightDirection'](light.components['Light'].direction);
        });
        var fLightColor = (function(light, shader) {
            shader.uniforms['uLightColor'](light.components['Light'].color);
        });

        for (var i = 0; i < this.vertex.parameters.length; ++i) {
            var fullName = this.vertex.parameters[i];
            var names = fullName.split(';');

            for (var j = 0; j < names.length; ++j) {
                if (names[j] === '\n') {
                    names.splice(j, 1);
                    continue;
                }
                /// uniform
                if (names[j].indexOf('uniform') !== -1) {
                    var uniformName = names[j].substr(names[j].lastIndexOf(' ') + 1, names[j].length);

                    uniforms[uniformName] = '';

                    if (uniformName.indexOf('Model') !== -1) {
                        uniforms[uniformName] = fModel;
                    } else if (uniformName.indexOf('LightColor') !== -1) {
                        uniforms[uniformName] = fLightColor;
                    } else if (uniformName.indexOf('Ambient') !== -1) {
                        uniforms[uniformName] = fAmbient;
                    } else if (uniformName.indexOf('LightDirection') !== -1) {
                        uniforms[uniformName] = fLightDirection;
                    } else if (uniformName.indexOf('Normal') !== -1) {
                        uniforms[uniformName] = fVertexNormal;
                    }
                }
                /// attributes
                else if (names[j].indexOf('attribute') !== -1) {
                    var attributeName = names[j].substr(names[j].lastIndexOf(' ') + 1, names[j].length);

                    attributes[attributeName] = '';

                    if (attributeName.indexOf('VertexPosition') !== -1) {
                        attributes[attributeName] = fVertexPosition;
                    } else if (attributeName.indexOf('VertexNormal') !== -1) {
                        attributes[attributeName] = fVertexNormal;
                    } else if (attributeName.indexOf('VertexColor') !== -1) {
                        attributes[attributeName] = fVertexColor;
                    } else if (attributeName.indexOf('TextureCoord') !== -1) {
                        attributes[attributeName] = fTextureCoord;
                    }
                }
            }
        }

        for (var i = 0; i < this.fragment.parameters.length; ++i) {
            var fullName = this.fragment.parameters[i];
        }

        // console.log(vertexNames);
        // console.log(fragmentNames);

        return {
            'uniforms' : uniforms,
            'attributes' : attributes
        }

    };

    this.out = function(type) {
        if (type === LEEWGL.Shader.VERTEX)
            return this.vertex.parameters.join('\n') + this.vertex.main.join('\n') + '}';
        else if (type === LEEWGL.Shader.FRAGMENT)
            return this.fragment.parameters.join('\n') + this.fragment.main.join('\n') + '}';
        else
            console.error('LEEWGL.ShaderLibrary.addParameterChunk: Wrong type given: ' + type + '!');
    };

    this.reset = function() {
        this.vertex.parameters = [];
        this.vertex.main = [];
        this.fragment.parameters = [];
        this.fragment.main = [];
    };
};

LEEWGL.ShaderLibrary.DEFAULT = 0;
LEEWGL.ShaderLibrary.COLOR = 1;
LEEWGL.ShaderLibrary.TEXTURE = 2;
LEEWGL.ShaderLibrary.DIRECTIONAL_AMBIENT = 3;
LEEWGL.ShaderLibrary.PICKING = 4;
