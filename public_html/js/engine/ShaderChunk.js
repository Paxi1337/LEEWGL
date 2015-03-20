var ajax = new LEEWGL.AsynchRequest();

LEEWGL.ShaderChunk = {
    'fragment_color': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_color.glsl', false, null).response.responseText,
    'fragment_color_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_color_para.glsl', false, null).response.responseText,
    'fragment_color_light': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_color_light.glsl', false, null).response.responseText,
    'fragment_colormap': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_colormap.glsl', false, null).response.responseText,
    'fragment_picking_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_picking_para.glsl', false, null).response.responseText,
    'fragment_light_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_light_para.glsl', false, null).response.responseText,
    'fragment_texture_light': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_texture_light.glsl', false, null).response.responseText,
    'fragment_texture_sampler': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_texture_sampler.glsl', false, null).response.responseText,
    'fragment_texture_sampler_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/fragment_texture_sampler_para.glsl', false, null).response.responseText,
    'vertex_color': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_color.glsl', false, null).response.responseText,
    'vertex_color_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_color_para.glsl', false, null).response.responseText,
    'vertex_default': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_default.glsl', false, null).response.responseText,
    'vertex_default_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_default_para.glsl', false, null).response.responseText,
    'vertex_light_ambient_directional': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_light_ambient_directional.glsl', false, null).response.responseText,
    'vertex_light_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_light_para.glsl', false, null).response.responseText,
    'vertex_normal_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_normal_para.glsl', false, null).response.responseText,
    'vertex_texture': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_texture.glsl', false, null).response.responseText,
    'vertex_texture_para': ajax.send('GET', LEEWGL.ROOT + 'js/engine/ShaderChunk/vertex_texture_para.glsl', false, null).response.responseText
};
