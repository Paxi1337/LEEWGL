vec3 normal = uModelView3x3 * normalize(aVertexNormal);
vec3 tangent = uModelView3x3 * normalize(aTangent);
vec3 bitangent = uModelView3x3 * normalize(aBitangent);

mat3 TBN = transpose(mat3(
    tangent,
    bitangent,
    normal
  ));

vLightToPoint = TBN * vLightToPoint;
vEyeToPoint = TBN * vEyeToPoint;
vNormalCoord = aNormalCoord;
