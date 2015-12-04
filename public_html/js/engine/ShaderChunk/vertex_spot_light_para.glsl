uniform vec3 uLightPosition;
uniform mat4 uLightView;

varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;
varying vec3 vPositionWorldSpace;

void initLight(vec3 position, vec3 lightPosition) {
    vEyeToPoint = -position;
    vLightToPoint = lightPosition - position;
}
