vec4 positionWorld = uModel * vec4(aVertexPosition, 1.0);
initLight(positionWorld.xyz);
