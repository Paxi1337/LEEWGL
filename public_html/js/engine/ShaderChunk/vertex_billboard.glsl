vTextureCoord = aVertexPosition.xy + vec2(0.5, 0.5);
vec3 vertexPositionWorldspace = uBillboardPosition + uCameraRight * aVertexPosition.x * uBillboardSize.x + uCameraUp * aVertexPosition.y * uBillboardSize.y;
vec4 position = (uView * uModel) * vec4(vertexPositionWorldspace, 1.0);
gl_Position = uProjection * position;
