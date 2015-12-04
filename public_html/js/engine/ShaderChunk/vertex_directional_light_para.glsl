uniform vec3 uLightDirection;
uniform mat4 uLightView;

varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;

void initLight(vec3 position) {
    vEyeToPoint = -position;
    vLightToPoint = uLightDirection;
}
