vec3 light = calculateLight(vVertexNormal);
finalColor = vec4(color.rgb * light, color.a);
gl_FragColor = finalColor;
