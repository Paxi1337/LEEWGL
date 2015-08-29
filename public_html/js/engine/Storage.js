/**
 * @constructor
 */
LEEWGL.LocalStorage = function() {
  LEEWGL.REQUIRES.push('Storage');
  this.data = {};

  this.setValue = function(key, val) {
    localStorage.setItem(key, val);
  };

  this.setValues = function(key, values) {
    localStorage.setItem(key, JSON.stringify(values));
  };

  this.getValue = function(key) {
    return localStorage.getItem(key);
  };

  this.getValues = function(key) {
    return JSON.parse(localStorage.getItem(key));
  };

  this.all = function() {
    for (var i = 0, key, value; i < localStorage.length; ++i) {

      key = localStorage.key(i);
      value = localStorage.getItem(key);

      this.data[key] = value;
    }

    return this.data;
  };

  this.remove = function(key) {
    localStorage.removeItem(key);
  };

  this.clear = function() {
    localStorage.clear();
  };
};
