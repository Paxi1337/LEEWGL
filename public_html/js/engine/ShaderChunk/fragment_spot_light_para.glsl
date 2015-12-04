uniform float uSpecular;
uniform float uLightRadius;
uniform float uShininess;
uniform float uSpotInnerAngle;
uniform float uSpotOuterAngle;
uniform vec3 uLightColor;
uniform vec3 uMaterialDiffuseColor;
uniform vec3 uMaterialSpecularColor;
uniform vec3 uLightPosition;
uniform vec3 uSpotDirection;

varying vec3 vVertexNormal;
varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;
varying vec3 vPositionWorldSpace;

vec3 calculateLight(vec3 normal) {
    vec3 n = normalize(normal);
    vec3 l = normalize(vLightToPoint);
    vec3 e = normalize(vEyeToPoint);

    float lightDistance = length(uLightPosition - vPositionWorldSpace);
    float d = max(lightDistance - uLightRadius, 0.0) / uLightRadius + 1.0;
    float lightAttenuation = 1.0 / (d * d);

    float lambert = max(dot(n, l), 0.0);

    if(lambert < 0.0)
      return vec3(0.0, 0.0, 0.0);

    vec3 h = normalize(l + e);
    float specularFactor = pow(max(dot(n, h), 0.0), uShininess) * uSpecular;

    vec3 spotDistance = normalize(uSpotDirection);
    float spotAngleDelta = uSpotInnerAngle - uSpotOuterAngle;
    float spotAngle = dot(-l, spotDistance);
    float spotAttenuation = clamp((spotAngle - uSpotOuterAngle) / spotAngleDelta, 0.0, 1.0);

    vec3 light = uLightColor * uMaterialDiffuseColor * lambert * lightAttenuation * spotAttenuation +
                 uMaterialSpecularColor * specularFactor;
    return light;
}
