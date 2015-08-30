vec4 texColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
gl_FragColor = texColor;
