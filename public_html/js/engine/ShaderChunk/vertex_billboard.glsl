vec3 vertexPositionWorldspace = uBillboardPosition + uCameraRight * aVertexPosition.x * uBillboardSize.x + uCameraUp * aVertexPosition.y * uBillboardSize.y;
gl_Position = uVP * vec4(vertexPositionWorldspace, 1.0);
vTextureCoord = aVertexPosition.xy + vec2(0.5, 0.5);
