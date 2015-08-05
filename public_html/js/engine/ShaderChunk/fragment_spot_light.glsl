vec3 light = calculateLight(vVertexNormal, uSpecular);
color = vec4(color.rgb * light, color.a);
finalColor = color;
gl_FragColor = finalColor;
