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
    this.chunks['basic'] = {
        vertex: {
            parameters: [
                LEEWGL.ShaderChunk['vertex_default_para'],
                LEEWGL.ShaderChunk['vertex_color_para']
            ],
            main: [
                "void main() {",
                LEEWGL.ShaderChunk['vertex_default'],
                LEEWGL.ShaderChunk['vertex_color']
            ]
        },
        fragment: {
            parameters: [
                "precision mediump float;",
                LEEWGL.ShaderChunk['fragment_color_para']
            ],
            main: [
                "void main() {",
                LEEWGL.ShaderChunk['fragment_color']
            ]
        }
    };

    this.chunks.picking = {
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

    this.chunks.light = {};
    this.chunks.light_ambient_directional = {
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
                LEEWGL.ShaderChunk['fragment_color_light']
            ]
        }
    };

    this.addParameterChunk = function(type, name) {
        if (type === LEEWGL.Shader.VERTEX) {
            this.vertex.parameters += this.chunks[name].vertex.parameters.join("\n");
            this.vertex.main += this.chunks[name].vertex.main.join("\n");
        } else if (type === LEEWGL.Shader.FRAGMENT) {
            this.fragment.parameters += this.chunks[name].fragment.parameters.join("\n");
            this.fragment.main += this.chunks[name].fragment.main.join("\n");
        } else {
            console.error('LEEWGL.ShaderLibrary.addParameterChunk: Wrong type given: ' + type + '!');
        }
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
