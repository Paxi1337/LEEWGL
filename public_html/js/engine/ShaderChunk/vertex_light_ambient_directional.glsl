highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

highp float directional = max(dot(transformedNormal.xyz, uLightDirection), 0.0);
vLighting = uAmbient + (uLightColor * directional);