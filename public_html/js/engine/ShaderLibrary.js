LEEWGL.ShaderLibrary = function() {
    this.vertex = {
        parameters: '',
        main: ''
    };
    this.fragment = {
        parameters: '',
        main: ''
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
                "precision mediump float;",
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
                LEEWGL.ShaderChunk['fragment_texture_light']
            ]
        }
    };

    this.chunks[LEEWGL.ShaderLibrary.PICKING] = {
        vertex: {
            parameters: [],
            main : []
        },
        fragment: {
            parameters: [
                LEEWGL.ShaderChunk['fragment_picking_para']
            ],
            main: [
                "if(uOffscreen == 1) {",
                LEEWGL.ShaderChunk['fragment_colormap'],
                "return;",
                "}",
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
            this.vertex.parameters += this.chunks[type].vertex.parameters.join("\n");
            this.vertex.main += this.chunks[type].vertex.main.join("\n");
            this.fragment.parameters += this.chunks[type].fragment.parameters.join("\n");
            this.fragment.main += this.chunks[type].fragment.main.join("\n");
    };

    this.out = function(type) {
        if (type === LEEWGL.Shader.VERTEX)
            return this.vertex.parameters + this.vertex.main + '}';
        else if (type === LEEWGL.Shader.FRAGMENT)
            return this.fragment.parameters + this.fragment.main + '}';
        else
            console.error('LEEWGL.ShaderLibrary.addParameterChunk: Wrong type given: ' + type + '!');
    };

    this.reset = function() {
        this.vertex = '';
        this.fragment = '';
    };
};

LEEWGL.ShaderLibrary.DEFAULT = 0;
LEEWGL.ShaderLibrary.COLOR = 1;
LEEWGL.ShaderLibrary.TEXTURE = 2;
LEEWGL.ShaderLibrary.DIRECTIONAL_AMBIENT = 3;
LEEWGL.ShaderLibrary.PICKING = 4;
