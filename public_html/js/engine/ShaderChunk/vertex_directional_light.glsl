void initLight(vec3 positionWorld) {
    vLightToPoint = uLightDirection;
    vEyeToPoint = -positionWorld;
}
