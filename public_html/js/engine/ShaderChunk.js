var ajax = new LEEWGL.AsynchRequest();

LEEWGL.ShaderChunk = {
    'fragment_color' : ajax.send('GET', '../js/engine/ShaderChunk/fragment_color.glsl', false, null).response.responseText,
    'fragment_color_para' : ajax.send('GET', '../js/engine/ShaderChunk/fragment_color_para.glsl', false, null).response.responseText,
    'fragment_colormap' : ajax.send('GET', '../js/engine/ShaderChunk/fragment_colormap.glsl', false, null).response.responseText,
    'fragment_picking_para' : ajax.send('GET', '../js/engine/ShaderChunk/fragment_picking_para.glsl', false, null).response.responseText,
    'vertex_color' : ajax.send('GET', '../js/engine/ShaderChunk/vertex_color.glsl', false, null).response.responseText,
    'vertex_color_para' : ajax.send('GET', '../js/engine/ShaderChunk/vertex_color_para.glsl', false, null).response.responseText,
    'vertex_default' : ajax.send('GET', '../js/engine/ShaderChunk/vertex_default.glsl', false, null).response.responseText,
    'vertex_default_para' : ajax.send('GET', '../js/engine/ShaderChunk/vertex_default_para.glsl', false, null).response.responseText
};

