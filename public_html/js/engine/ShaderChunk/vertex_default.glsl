vec4 positionWorldSpace = (uModel) * vec4(aVertexPosition, 1.0);
vec4 positionCameraSpace = (uView * uModel) * vec4(aVertexPosition, 1.0);
gl_Position = uProjection * positionCameraSpace;
