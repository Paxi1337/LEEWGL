LEEWGL.Importer = function() {
    this.parseCollada = function(xml) {

        var getInput = function(sem, par) {
            var el = xml.querySelectorAll("input[semantic=" + sem + "]", par)[0];
            return xml.querySelectorAll(el.getAttribute("source"), mesh)[0];
        };
        var parseVals = function(el) {
            var strvals = el.textContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
            return strvals.split(/\s+/).map(parseFloat);
        };

        var mesh = xml.querySelectorAll("geometry > mesh")[0];
        var triangles = xml.querySelectorAll("triangles")[0];
        var polylist = xml.querySelectorAll("polylist")[0];
        
        var vrtInput = getInput("VERTEX", polylist);
        var posInput = getInput("POSITION", vrtInput);
		var nrmInput = getInput("NORMAL", polylist);
		var nrmList = parseVals(xml.querySelectorAll("float_array", nrmInput)[0]);
		var idxList = parseVals(xml.querySelectorAll("p", polylist)[0]);

		var vertices = parseVals(xml.querySelectorAll("float_array", posInput)[0]);
        
        console.log(vertices);

        console.log(xml.querySelectorAll('asset'));
        console.log(xml.querySelectorAll('library_images image'));
        console.log(xml.querySelectorAll('library_materials material'));
        console.log(xml.querySelectorAll('library_effects effect'));
        console.log(xml.querySelectorAll('library_geometries geometry'));
        console.log(xml.querySelectorAll('library_cameras camera'));
        console.log(xml.querySelectorAll('library_lights light'));
        console.log(xml.querySelectorAll('library_controllers controller'));
        console.log(xml.querySelectorAll('library_animations animation'));
        console.log(xml.querySelectorAll('library_visual_scenes visual_scene'));
        console.log(xml.querySelectorAll('library_kinematics_models kinematics_model'));
    };

    this.parseLib = function() {

    }
}

