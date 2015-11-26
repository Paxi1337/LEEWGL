vec4 normalTexture = texture2D(uNormalSampler, vTextureCoord.st);

vec3 normal = normalize(vVertexNormal);
vec3 tangent = normalize(vTangent);
vec3 bitangent = normalize(vBitangent);
vec3 nN = normalize(normal + bitangent + tangent);
vec3 normalTangentSpace = normalize(normalTexture.xyz * nN);

light = calculateLight(normalTangentSpace, uSpecular);
finalColor = vec4(color.rgb * light, finalColor.a);
gl_FragColor = finalColor;
