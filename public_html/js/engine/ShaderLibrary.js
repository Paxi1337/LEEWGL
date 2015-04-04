LEEWGL.ShaderLibrary = function() {
    this.vertex = {
        parameters: [],
        main: []
    };
    this.fragment = {
        parameters: [],
        main: []
    };

    this.usesColor = false;
    this.usesTexture = false;

    this.chunks = {};

    this.initializeChunks = function() {
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

        this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL] = {
            vertex: {
                parameters: [
                    LEEWGL.ShaderChunk['vertex_directional_light_para'],
                    LEEWGL.ShaderChunk['vertex_normal_para']
                ],
                main: [
                    LEEWGL.ShaderChunk['vertex_directional_light']
                ]
            },
            fragment: {
                parameters: [
                    LEEWGL.ShaderChunk['fragment_directional_light_para']
                ],
                main: [
                    LEEWGL.ShaderChunk['fragment_directional_light']
                ],
                fragColor: {
                    'texture': [
                        LEEWGL.ShaderChunk['fragment_directional_light_texture']
                    ],
                    'color': [
                        LEEWGL.ShaderChunk['fragment_directional_light_color']
                    ]
                }
            }
        };
    };

    this.addParameterChunk = function(type) {
        if (type === LEEWGL.ShaderLibrary.COLOR) {
            this.usesColor = true;
            this.usesTexture = false;
        } else if (type === LEEWGL.ShaderLibrary.TEXTURE) {
            this.usesTexture = true;
            this.usesColor = false;
        } else if (type === LEEWGL.ShaderLibrary.DIRECTIONAL) {
            if (this.usesColor === true) {
                this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL].fragment.main = this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL].fragment.main.concat(this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL].fragment.fragColor.color);
            } else if (this.usesTexture === true) {
                this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL].fragment.main = this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL].fragment.main.concat(this.chunks[LEEWGL.ShaderLibrary.DIRECTIONAL].fragment.fragColor.texture);
            }
        }

        this.vertex.parameters = this.vertex.parameters.concat(this.chunks[type].vertex.parameters);
        this.vertex.main = this.vertex.main.concat(this.chunks[type].vertex.main);
        this.fragment.parameters = this.fragment.parameters.concat(this.chunks[type].fragment.parameters);
        this.fragment.main = this.fragment.main.concat(this.chunks[type].fragment.main);
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

        this.usesColor = false;
        this.usesTexture = false;

        this.initializeChunks();

    };

    this.initializeChunks();
};

LEEWGL.ShaderLibrary.DEFAULT = 0;
LEEWGL.ShaderLibrary.COLOR = 1;
LEEWGL.ShaderLibrary.TEXTURE = 2;
LEEWGL.ShaderLibrary.PICKING = 3;
LEEWGL.ShaderLibrary.DIRECTIONAL = 4;
