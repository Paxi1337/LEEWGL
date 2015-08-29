function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload)
        oldonload();
      func();
    };
  }
}

function extend(dest, src) {
  for (var s in src) {
    if (src.hasOwnProperty(s)) {
      dest[s] = src[s];
    }
  }
  return dest;
}

function functionFromString(str) {
  var arr = str.split(".");
  var fn = window;
  for (var i = 0; i < arr.length; ++i) {
    fn = fn[arr[i]];
  }

  return fn;
}

function setEditables(editables) {
  for (var attribute in editables) {
    editables[attribute]['alias'] = attribute;
  }

  editables.set = function(that, key, value, index) {
    if (typeof index !== 'undefined') {
      this[key].value[index] = value;
      that[this[key]['alias']][index] = value;
    } else {
      this[key].value = value;
      that[this[key]['alias']] = value;
    }
  };
}

function addEditables(destination, source) {
  for (var attribute in source) {
    destination[attribute] = source[attribute];
    destination[attribute]['alias'] = attribute;
  }
}
