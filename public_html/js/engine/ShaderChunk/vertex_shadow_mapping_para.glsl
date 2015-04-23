uniform mat4 uLightViewMatrix;
uniform mat4 uLightProjectionMatrix;

varying vec4 vShadowPosition;

const mat4 cDepthScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

void initShadow(vec4 positionWorld) {
    vShadowPosition = cDepthScaleMatrix * uLightProjectionMatrix * uLightViewMatrix * positionWorld;
}
