uniform vec3 uLightColor;

varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;
varying vec3 vVertexNormal;

vec3 calculateLight(in vec3 normal, in float specular) {
    vec3 l = normalize(vLightToPoint);
    vec3 n = normalize(normal);
    float lambert = max(dot(n, l), 0.0);

    if(lambert < 0.0) {
        return vec3(0.0, 0.0, 0.0);
    }

    vec3 light = uLightColor * lambert;

    vec3 e = normalize(vEyeToPoint);
    vec3 r = reflect(-l, n);
    float shininess = 8.0;
    float specularFactor = pow(clamp(dot(r, e), 0.0, 1.0), shininess) * specular;
    vec3 specularColor = uLightColor;

    light += specularColor * specularFactor;
    return light;
}
