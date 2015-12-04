uniform float uSpecular;
uniform float uShininess;
uniform vec3 uLightColor;
uniform vec3 uMaterialDiffuseColor;
uniform vec3 uMaterialSpecularColor;

varying vec3 vVertexNormal;
varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;

vec3 calculateLight(vec3 normal) {
    vec3 n = normalize(normal);
    vec3 l = normalize(vLightToPoint);
    vec3 e = normalize(vEyeToPoint);

    float lambert = max(dot(n, l), 0.0);

    if(lambert < 0.0)
      return vec3(0.0, 0.0, 0.0);

    vec3 h = normalize(l + e);
    float specularFactor = pow(max(dot(n, h), 0.0), uShininess) * uSpecular;
    vec3 light = uLightColor * uMaterialDiffuseColor * lambert +
                 uMaterialSpecularColor * specularFactor;
    return light;
}
