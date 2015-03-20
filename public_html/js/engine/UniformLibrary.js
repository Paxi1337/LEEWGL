LEEWGL.UniformLibrary = {
    common: {
        'diffuse': {
            type: 'c',
            value: []
        },
        'model': {
            type: 'm',
            value: mat4.create()
        },
        'viewProjection': {
            type: 'm',
            value: mat4.create()
        }
    },
    lights: {
        'ambientColor': {
            type: 'fv',
            value: []
        },
        'directionalDirection': {
            type: 'fv',
            value: []
        },
        'directionalColor': {
            type: 'fv',
            value: []
        },
        'pointColor': {
            type: 'fv',
            value: []
        },
        'pointPosition': {
            type: 'fv',
            value: []
        },
        'pointDistance': {
            type: 'fv',
            value: []
        },
        'spotColor': {
            type: 'fv',
            value: []
        },
        'spotPosition': {
            type: 'fv',
            value: []
        },
        'spotDirection': {
            type: 'fv',
            value: []
        },
        'spotDistance': {
            type: 'fv1',
            value: []
        },
        'spotAngle': {
            type: 'fv1',
            value: []
        },
        'spotExponent': {
            type: 'fv1',
            value: []
        }
    },
    picking: {
        'offscreen': {
            type: 'iv1',
            value: []
        },
        'colormap': {
            type: 'c',
            value: []
        }
    },
    merge: function(uniforms) {
        var merged = {};

        for (var u = 0; u < uniforms.length; u++) {
            var tmp = this.clone(uniforms[u]);
            for (var p in tmp) {
                merged[p] = tmp[p];
            }
        }
        //        console.log(merged);
        return merged;

    },
    clone: function(uniforms_src) {
        var uniforms_dst = {};

        for (var u in uniforms_src) {
            uniforms_dst[u] = {};

            for (var p in uniforms_src[u]) {
                var parameter_src = uniforms_src[u][p];

                if (parameter_src instanceof Array) {
                    uniforms_dst[u][p] = parameter_src.slice();
                } else {
                    uniforms_dst[u][p] = parameter_src;
                }
            }
        }
        return uniforms_dst;
    }
};
