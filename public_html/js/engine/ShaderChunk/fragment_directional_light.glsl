vec3 light = calculateLight(vVertexNormal, uSpecular);
finalColor.rgb += color.rgb * light;
gl_FragColor = finalColor;
