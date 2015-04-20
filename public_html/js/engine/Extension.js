LEEWGL.Extension = function() {
    this.vendorPrefixes = ["", "WEBKIT_", "MOZ_"];

    this.getExtension = function(gl, name) {
        var prefix, ext;
        for (prefix in this.vendorPrefixes) {
            ext = gl.getExtension(this.vendorPrefixes[prefix] + name);
            if (ext)
                return ext;
        }
        return null;
    }
};
