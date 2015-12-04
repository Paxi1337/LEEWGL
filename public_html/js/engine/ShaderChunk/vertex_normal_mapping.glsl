vec3 n = (vec4(aVertexNormal, 1.0)).xyz;
vec3 t = (vec4(aTangent, 1.0)).xyz;
vec3 b = (vec4(cross(n, t), 1.0)).xyz;

mat3 tbnMatrix = transpose(mat3(t, b, n));

vEyeToPoint = tbnMatrix * vEyeToPoint;
vLightToPoint = tbnMatrix * vLightToPoint;
