varying vec4 vShadowPosition;
uniform sampler2D uShadowMap;

float calcShadow() {
	vec3 depth = vShadowPosition.xyz / vShadowPosition.w;
	float shadowValue = texture2D(uShadowMap, depth.xy).r;
	depth.z *= 0.999;
	if(shadowValue < depth.z)
		return 0.0;
	return 1.0;
}
