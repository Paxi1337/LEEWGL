float shadow = calcShadow();
gl_FragColor = vec4(finalColor.rgb * shadow, finalColor.a);
