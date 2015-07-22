uniform vec3 uLightColor;
uniform float uSpecular;

uniform float uLightRadius;

varying vec3 vVertexNormal;
varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;
varying vec3 vPosition;

vec3 calculateLight(vec3 normal, float specular) {
    vec3 l = normalize(vLightToPoint);
    vec3 n = normalize(normal);
    float lambert = max(dot(n, l), 0.0);

    if(lambert < 0.0) {
        return vec3(0.0, 0.0, 0.0);
    }
    float lightDistance = length(vLightToPoint);
    float d = max(lightDistance - uLightRadius, 0.0) / uLightRadius + 1.0;
    float lightAttenuation = 1.0 / (d * d);

    vec3 light = uLightColor * lambert * lightAttenuation;

    vec3 e = normalize(vEyeToPoint);
    vec3 r = reflect(-l, n);
    float shininess = 8.0;
    float specularFactor = pow(clamp(dot(r, e), 0.0, 1.0), shininess) * specular;
    vec3 specularColor = uLightColor;

    light += specularColor * specularFactor;
    return light;
}
