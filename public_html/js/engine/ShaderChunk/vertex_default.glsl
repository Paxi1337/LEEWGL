vec4 position = (uView * uModel) * vec4(aVertexPosition, 1.0);
gl_Position = uProjection * position;
