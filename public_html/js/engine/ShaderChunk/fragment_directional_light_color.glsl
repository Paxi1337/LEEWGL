vec3 light = calculateLight(vVertexNormal, 1.0);
finalColor += vec4(color.rgb * light, finalColor.a);
gl_FragColor = finalColor;
