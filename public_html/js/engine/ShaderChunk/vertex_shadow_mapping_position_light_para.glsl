uniform mat4 uLightProj;
uniform mat4 uLightView;

const mat4 cDepthScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
varying vec4 vShadowPosition;

void initShadow(vec4 positionWorld) {
  vShadowPosition = cDepthScaleMatrix * uLightProj * uLightView * positionWorld;
}
