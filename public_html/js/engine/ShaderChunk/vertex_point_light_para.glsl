uniform vec3 uLightPosition;

varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;

void initLight(vec3 positionWorld) {
    vLightToPoint = uLightPosition - positionWorld;
    vEyeToPoint = -positionWorld;
}
