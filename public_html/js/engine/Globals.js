function addEventToWindow(event, func) {
  var oldFunc = window[event];
  if (typeof window[event] != 'function') {
    window[event] = func;
  } else {
    window[event] = function() {
      if (oldFunc)
        oldFunc();
      func();
    };
  }
}

function getMouseInformation(event) {
  var movement = {
    'x': 0,
    'y': 0
  };
  var button = null;

  /// Chrome
  if (typeof event.movementX !== 'undefined') {
    movement.x = event.movementX;
    movement.y += event.movementY;
    button = event.button;
  }
  /// FF
  else {
    movement.x += event.mozMovementX;
    movement.y += event.mozMovementY;
    button = event.buttons;
  }

  return {
    'movement': movement,
    'button': button
  };
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

function addPropertyToAllJSON(arr, key) {
  for (var attribute in arr) {
    arr[attribute][key] = attribute;
  }
}

function addSetMethodToJSON(arr) {
  arr.set = function(that, key, value, index) {
    if (typeof index !== 'undefined') {
      this[key].value[index] = value;
      that[this[key]['alias']][index] = value;
    } else {
      this[key].value = value;
      that[this[key]['alias']] = value;
    }
  };
}

function addToJSON(destination, source) {
  for (var attribute in source) {
    destination[attribute] = source[attribute];
    destination[attribute]['alias'] = attribute;
  }
  return destination;
}

function mergeJSONArrays() {
  var ar = [];

  return ar.concat.apply(ar, arguments).sort(function(a, b) {
    console.log(a);
    console.log(b);
    var aName = a.NAME;
    var bName = b.NAME;
    if (aName < bName)
      return -1;
    else if (aName === bName)
      return 0;
    else
      return 1;
  });
}

/**
 * Returns number of digits in given number
 * @param  {number} x
 * @param  {bool} integer - defaults to false; if set to true treats number like integer
 * @return {number}
 */
function numDigits(x, integer) {
  integer = (typeof integer !== 'undefined') ? integer : false;
  if (integer === false)
    x = Number(String(x).replace(/[^0-9]/g, ''));

  return Math.max(Math.floor(Math.log10(Math.abs(x))), 0) + 1;
}
