LEEWGL.UI = function(options) {
	var outline = [];
	var inspector;
	var update = false;

	this.activeElement = null;
	this.storage = new LEEWGL.LocalStorage();
	this.playing = false;

	this.drag = new LEEWGL.DragDrop();

	Object.defineProperties(this, {
		outline : {
			enumerable : true,
			value : outline
		}
	});

	this.setInspector = function(container) {
		this.inspector = (typeof container === 'string') ? document.querySelector(container) : container;
	};

	this.addObjToOutline = function(obj) {
		this.outline[obj.id] = obj;
		this.update = true;
	};

	this.removeObjFromOutline = function(index) {
		this.outline.splice(index, 1);
		this.update = true;
	};

	this.getRelativeMouseCoordinates = function(event, start) {
		var x, y, top = 0, left = 0, obj = start;

		while(obj && obj.tagName !== 'BODY') {
			top += obj.offsetTop;
			left += obj.offsetLeft;
			obj = obj.offsetParent;
		}

		left += window.pageXOffset;
		top -= window.pageYOffset;

		x = event.clientX - left;
		y = event.clientY - top;

		return {
			'x' : x,
			'y' : y
		};
	};

	this.outlineToHTML = function(container) {
		if(this.update === false)
			return;

		container = (typeof container === 'string') ? document.querySelector(container) : container;

		container.innerHTML = '';

		var list = document.createElement('ul');

		for(var i = 1; i < this.outline.length; ++i) {
			var item = document.createElement('li');
			var element = document.createElement('a');
			element.setAttribute('href', '#');
			element.innerHTML = this.outline[i].name;

			item.appendChild(element);
			list.appendChild(item);

			var that = this;
			(function(index) {
				item.addEventListener('click', function() {
					// / FIXME: add active class
					// if(this.getAttribute('class') !== 'active')
					// this.setAttribute('class', 'active');
					// else
					// this.setAttribute('class', '');

					that.setInspectorContent(index);
				});
			})(i);
		}

		container.appendChild(list);

		this.update = false;
	};

	this.createTable = function(header, content) {
		var table = document.createElement('table');
		var thead = document.createElement('thead');
		var tbody = document.createElement('tbody');
		var tr;
		var td;

		tr = document.createElement('tr');
		// / headers
		for(var i = 0; i < header.length; ++i) {
			td = document.createElement('th');
			td.innerHTML = header[i];

			tr.appendChild(td);
			thead.appendChild(tr);
		}

		table.appendChild(thead);

		tr = document.createElement('tr');
		// / content
		for(var i = 0; i < content.length; ++i) {
			td = document.createElement('td');
			td.setAttribute('contenteditable', true);
			td.setAttribute('num', i);

			if(typeof content[i] === 'number')
				td.innerHTML = content[i].toPrecision(LEEWGL.Settings.Precision);
			else
				td.innerHTML = content[i];

			// / html5 feature - gets called when dom elements with contenteditable = true get edited
			td.addEventListener('keydown', function(event) {
				if(event.keyCode === LEEWGL.KEYS.ENTER) {
					var num = this.getAttribute('num');
					content[num] = this.innerText;
					event.preventDefault();
					event.stopPropagation();
				}
			});

			tr.appendChild(td);
			tbody.appendChild(tr);
		}

		table.appendChild(tbody);
		return table;
	};

	this.componentsToHTML = function(activeElement) {
		var container;
		var title;

		var that = this;

		for( var compName in activeElement.components) {
			if(!activeElement.components.hasOwnProperty(compName))
				continue;

			container = document.createElement('div');
			title = document.createElement('h3');
			title.innerHTML = 'Type: ' + compName;
			container.appendChild(title);

			var comp = activeElement.components[compName];
			var hr = document.createElement('hr');

			// / LEEWGL.TransformComponent
			if(compName === LEEWGL.Component.TransformComponent) {
				container.setAttribute('class', 'table-container');
				var pos = document.createElement('h4');
				pos.setAttribute('class', 'fleft mright10');
				pos.innerHTML = 'Position: ';

				var trans = document.createElement('h4');
				trans.setAttribute('class', 'fleft mright10');
				trans.innerHTML = 'Translation: ';

				var rot = document.createElement('h4');
				rot.setAttribute('class', 'fleft mright10');
				rot.innerHTML = 'Rotation: ';

				var scale = document.createElement('h4');
				scale.setAttribute('class', 'fleft mright10');
				scale.innerHTML = 'Scale: ';

				// / position
				container.appendChild(pos);
				container.appendChild(this.createTable([ 'x', 'y', 'z' ], comp.position));
				// / translation
				container.appendChild(trans);
				container.appendChild(this.createTable([ 'x', 'y', 'z' ], comp.transVec));
				// / rotation
				container.appendChild(rot);
				container.appendChild(this.createTable([ 'x', 'y', 'z' ], comp.rotVec));
				// / scale
				container.appendChild(scale);
				container.appendChild(this.createTable([ 'x', 'y', 'z' ], comp.scaleVec));

				container.appendChild(hr);
			} else if(compName === LEEWGL.Component.CustomScriptComponent) {
				container.setAttribute('id', 'custom-script-container');

				var textfield = document.createElement('textarea');
				textfield.setAttribute('rows', 5);
				textfield.setAttribute('cols', 30);
				textfield.setAttribute('placeholder', comp.code);

				textfield.value = that.storage.getValue('customScript' + activeElement.id);

				textfield.addEventListener('keyup', function(event) {
					if(event.keyCode === LEEWGL.KEYS.ENTER) {
						that.addScript(activeElement.id, this.value);
						event.stopPropagation();
					}
				});

				container.appendChild(textfield);
				container.appendChild(hr);
			} else if(compName === LEEWGL.Component.LightComponent) {
				container.setAttribute('class', 'table-container');
				var direction = document.createElement('h4');
				direction.setAttribute('class', 'fleft mright10');
				direction.innerHTML = 'Direction: ';

				var color = document.createElement('h4');
				color.setAttribute('class', 'fleft mright10');
				color.innerHTML = 'Color: ';

				// / direction
				container.appendChild(direction);
				container.appendChild(this.createTable([ 'x', 'y', 'z' ], comp.direction));
				// / color
				container.appendChild(color);
				container.appendChild(this.createTable([ 'r', 'g', 'b' ], comp.color));
			}

			this.inspector.appendChild(container);
		}
	};

	this.setInspectorContent = function(index) {
		if(typeof this.inspector === 'undefined') {
			console.error('LEEWGL.UI: No inspector container set. Please use setInspector() first!');
			return;
		}

		this.inspector.innerHTML = '';

		var activeElement = this.outline[index];

		this.activeElement = activeElement;
		window.activeElement = activeElement;

		var name = document.createElement('h3');
		name.innerHTML = 'Name: ' + activeElement.name;

		this.inspector.appendChild(name);
		this.componentsToHTML(activeElement);
	};

	this.dynamicContainers = function(classname_toggle, classname_container, movable_container) {
		var that = this;
		var toggle = document.querySelectorAll(classname_toggle);
		var container = document.querySelectorAll(classname_container);

		for(var i = 0; i < toggle.length; ++i) {
			(function(index) {
				toggle[index].addEventListener('mousedown', function(event) {
					var c = container[index];
					c.addEventListener('click', that.drag.drag(c, event));
				});
			})(i);
		}
	};

	this.addScript = function(id, src) {
		var script;
		if((script = document.querySelector('#customScript' + id)) !== null) {
			document.body.removeChild(script);
		}
		this.storage.setValue('customScript' + id, src);

		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.id = 'customScript' + id;

		var code = 'UI.outline[' + id + '].addEventListener("custom", function() { if(UI.playing === true) {' + src + '}});';

		newScript.appendChild(document.createTextNode(code));
		document.body.appendChild(newScript);
	};

	this.play = function() {
		this.playing = true;

		for(var i = 0; i < this.outline.length; ++i) {
			this.outline[i].dispatchEvent({
				'type' : 'custom'
			});
		}

	};

	this.stop = function() {
		this.playing = false;
	};

	this.popup = function(pos, center, file) {
		var popupContainer = document.createElement('div');
		popupContainer.setAttribute('class', 'popup-container');
		popupContainer.style.top = '10px';

		var width = document.body.clientWidth;
		var height = document.body.clientHeight;

		if(center === true) {
			// / FIXME: hardcoded value
			popupContainer.style.top = height / 2 - 200 + 'px';
			popupContainer.style.left = (width / 2) - 200 + 'px';
		} else {
			popupContainer.style.top = pos.top + 'px';
			popupContainer.style.left = pos.left + 'px';
		}

		var ajax = new LEEWGL.AsynchRequest();
		popupContainer.innerHTML = ajax.send('GET', LEEWGL.ROOT + 'html/' + file, false, null).response.responseText;
		document.body.appendChild(popupContainer);

	};
};

var UI = new LEEWGL.UI();

LEEWGL.UI.STATIC = 'static';
LEEWGL.UI.ABSOLUTE = 'absolute';