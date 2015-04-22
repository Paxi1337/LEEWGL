vVertexNormal = aVertexNormal;
vec4 worldPosition = uModel * vec4(aVertexPosition, 1.0);
initLight(worldPosition.xyz);
