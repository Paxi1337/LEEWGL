float shadow = calculateShadow();
finalColor = vec4(color.rgb * light * shadow, finalColor.a);
gl_FragColor = finalColor;
