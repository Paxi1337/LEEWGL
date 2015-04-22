uniform vec3 uLightDirection;

varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;

void initLight(vec3 positionWorld) {
    vLightToPoint = uLightDirection;
    vEyeToPoint = -positionWorld;
}
