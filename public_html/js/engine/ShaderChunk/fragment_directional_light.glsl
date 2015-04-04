vec3 viewDir = normalize(-vVertexPosition);
vec4 normal = vVertexNormal;
vec3 lightdir = uLightDirection;
vec3 reflectDir = reflect(-lightdir, normal.xyz);
float specular = max(dot(reflectDir, viewDir), 0.0);
float diffuse = max(dot(normal.xyz, lightdir), 0.0);

vec4 light = vec4(uAmbient + uLightColor * (diffuse + specular), 1.0);
