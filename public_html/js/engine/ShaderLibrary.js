LEEWGL.ShaderLibrary = {
    'basic' : {
        uniforms : LEEWGL.UniformLibrary.merge([
            LEEWGL.UniformLibrary['common']
        ]),
        
        vertexShader : [
            LEEWGL.ShaderChunk['vertex_default_para'],
            LEEWGL.ShaderChunk['vertex_color_para'],
            
            "void main() {",
                LEEWGL.ShaderChunk['vertex_default'],
                LEEWGL.ShaderChunk['vertex_color'],
            "};"
        ].join("\n"),
        
        fragmentShader : [
            "precision mediump float;",
            LEEWGL.ShaderChunk['fragment_color_para'],
            
            "void main() {",
                LEEWGL.ShaderChunk['fragment_color'],
            "};"
        ].join("\n")
    },
    'picking' : {
        uniforms : LEEWGL.UniformLibrary.merge([
            LEEWGL.UniformLibrary['common'],
            LEEWGL.UniformLibrary['picking']
        ]),
        
        vertexShader : [
            LEEWGL.ShaderChunk['vertex_default_para'],
            LEEWGL.ShaderChunk['vertex_color_para'],
            
            "void main() {",
                LEEWGL.ShaderChunk['vertex_default'],
                LEEWGL.ShaderChunk['vertex_color'],
            "}"
        ].join("\n"),
        
        fragmentShader : [
            "precision mediump float;",
            LEEWGL.ShaderChunk['fragment_color_para'],
            LEEWGL.ShaderChunk['fragment_picking_para'],
            
            "void main() {",
                "if(uOffscreen == 1) {",
                    LEEWGL.ShaderChunk['fragment_colormap'],
                "return;",
                "}",
                LEEWGL.ShaderChunk['fragment_color'],
            "}"
        ].join("\n")
    }
};
