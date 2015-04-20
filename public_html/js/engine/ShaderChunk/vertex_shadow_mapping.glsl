void initShadow(vec4 positionWorld) {
    vShadowPosition = cDepthScaleMatrix * uLightProjectionMatrix * uLightViewMatrix * positionWorld;
}

initShadow(positionWorld);
