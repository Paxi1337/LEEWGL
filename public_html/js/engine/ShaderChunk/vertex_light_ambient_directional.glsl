lowp vec3 ambient = vec3(0.6, 0.6, 0.6);
lowp vec3 directionalColor = vec3(0.5, 0.5, 0.75);
lowp vec3 directionalVector = vec3(0.85, 0.8, 0.75);

lowp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

lowp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
vLighting = ambient + (directionalColor * directional);