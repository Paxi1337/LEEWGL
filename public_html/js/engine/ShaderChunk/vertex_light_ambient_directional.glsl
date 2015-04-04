vec4 transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));
float directional = max(dot(transformedNormal.xyz, uLightDirection), 0.0);
vLighting = uAmbient + (uLightColor * directional);
