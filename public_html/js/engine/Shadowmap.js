LEEWGL.Shadowmap = function() {
    this.frameBuffer = new LEEWGL.FrameBuffer();
    this.renderBuffer = new LEEWGL.RenderBuffer();
    this.colorTexture = new LEEWGL.Texture();
    this.depthTexture = new LEEWGL.Texture();

    this.shader = new LEEWGL.Shader();
    this.shaderLibrary = new LEEWGL.ShaderLibrary();

    this.size = {
        'x' : 512,
        'y' : 512
    };

    this.init = function(gl, width, height) {
        this.size.x = (typeof width !== 'undefined') ? width : this.size.x;
        this.size.y = (typeof height !== 'undefined') ? height : this.size.y;

        gl.enable(gl.CULL_FACE);
        gl.clearDepth(1.0);

        var depthExtension = __extensionLoader.getExtension(gl, 'WEBGL_depth_texture');

        this.colorTexture.create(gl);
        this.colorTexture.bind(gl);
        this.colorTexture.setFrameBuffer(gl, this.size.x, this.size.y);

        this.depthTexture.create(gl);
        this.depthTexture.bind(gl);
        this.depthTexture.setDepthBuffer(gl, this.size.x, this.size.y);

        this.frameBuffer.create(gl, this.size.x, this.size.y);
        this.frameBuffer.bind(gl);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture.webglTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture.webglTexture, 0);

        this.colorTexture.unbind(gl);
        this.depthTexture.unbind(gl);
        this.frameBuffer.unbind(gl);
    };

    this.bind = function(gl, shader) {
        this.frameBuffer.bind(gl);

        gl.viewport(0, 0, this.size.x, this.size.y);
        gl.colorMask(false, false, false, false);
        gl.cullFace(gl.FRONT);
        gl.clear(gl.DEPTH_BUFFER_BIT);
    };

    this.unbind = function(gl, shader) {
        this.frameBuffer.unbind(gl);
        this.depthTexture.unbind(gl, 1);
        shader.uniforms['uShadowMap'](null);
        gl.cullFace(gl.BACK);
    };

    this.draw = function(gl, shader, light) {
        this.depthTexture.setActive(gl, 1);
        this.depthTexture.bind(gl);

        shader.uniforms['uLightProjectionMatrix'](light.getProjection());
        shader.uniforms['uLightViewMatrix'](light.getView([0, 0, 0]));
        shader.uniforms['uShadowMap'](1);
    };
};
