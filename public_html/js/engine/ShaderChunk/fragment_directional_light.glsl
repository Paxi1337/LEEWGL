vec3 light = calculateLight(vVertexNormal, uSpecular);
finalColor = vec4(color.rgb * light, color.a);
gl_FragColor = finalColor;
