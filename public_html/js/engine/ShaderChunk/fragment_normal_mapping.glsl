vec3 normalTangentSpace = normalize(texture2D(uNormalSampler, vec2(vNormalCoord.x, -vNormalCoord.y)).rgb * 2.0 - 1.0);
light = calculateLight(normalTangentSpace, uSpecular);
finalColor = vec4(color.rgb * light, color.a);
gl_FragColor = finalColor;
