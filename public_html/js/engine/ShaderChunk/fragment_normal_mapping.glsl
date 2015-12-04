vec3 normalTexture = texture2D(uNormalSampler, vTextureCoord).rgb * 2.0 - 1.0;
light = calculateLight(normalTexture);
finalColor = vec4(color.rgb * light, finalColor.a);
gl_FragColor = finalColor;
