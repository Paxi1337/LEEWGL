varying vec4 vShadowPosition;

uniform sampler2D uShadowMap;

float calculateShadow() {
    vec3 depth = vShadowPosition.xyz / vShadowPosition.w;
    float shadow = texture2D(uShadowMap, depth.xy).r;
    depth.z *= 0.999;
    if(shadow < depth.z) {
        return 0.0;
    }

    return 1.0;
}
