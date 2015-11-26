vec3 vertexPositionWorldspace = uBillboardPosition;
vTextureCoord = aVertexPosition.xy + vec2(0.5, 0.5);

vec4 position = (uView * uModel) * vec4(vertexPositionWorldspace, 1.0);
gl_Position = uProjection * position;
gl_Position /= gl_Position.w;
gl_Position.xy += aVertexPosition.xy * vec2(0.2, 0.2);
