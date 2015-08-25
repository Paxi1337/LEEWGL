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
