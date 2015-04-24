float shadow = calculateShadow();
finalColor = vec4(color.rgb * light * shadow, color.a);
gl_FragColor = finalColor;
