  LEEWGL.REQUIRES.push('ShaderChunk');

  var init = function() {
    /** @constructor */
    LEEWGL.ShaderChunk = {};
    var ajax = new LEEWGL.AsynchRequest();
    var files = ajax.send('POST', LEEWGL.ROOT + 'php/list_directory_content.php', false, null, LEEWGL.AsynchRequest.JSON).response.responseJSON;
    var path = LEEWGL.ROOT + 'js/engine/ShaderChunk/';

    for (var i = 0; i < files.length; ++i) {
      var file = files[i];
      if (file.indexOf('.glsl') === -1)
        continue;

      var name = file.substr(0, file.indexOf('.glsl'));
      LEEWGL.ShaderChunk[name] = ajax.send('GET', path + file, false, null).response.responseText;
    }
  };

  addLoadEvent(init);
