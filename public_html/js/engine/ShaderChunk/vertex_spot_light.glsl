void initLight(vec3 positionWorld) {
    vLightToPoint = uLightPosition - positionWorld;
    vEyeToPoint = -positionWorld;
}

vec4 positionWorld = uModel * vec4(aVertexPosition, 1.0);
initLight(positionWorld.xyz);
