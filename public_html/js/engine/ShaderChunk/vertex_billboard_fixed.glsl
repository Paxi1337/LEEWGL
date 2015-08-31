vec3 vertexPositionWorldspace = uBillboardPosition;
gl_Position = (uVP * uModel) * vec4(vertexPositionWorldspace, 1.0);
gl_Position /= gl_Position.w;
gl_Position.xy += aVertexPosition.xy * vec2(0.2, 0.2);
vTextureCoord = aVertexPosition.xy + vec2(0.5, 0.5);
