LEEWGL.REQUIRES.push('DOMAnimator');

LEEWGL.DOM.Animator = function() {
  this.fade = function(type, element, duration, adjacentFunction, steps) {
    if (type === 'in') {
      this.fadeIn(element, duration, adjacentFunction, steps);
    } else if (type === 'out') {
      this.fadeOut(element, duration, adjacentFunction, steps);
    } else if (type === 'toggle') {
      if (parseInt(element.getStyle('opacity')) === 0)
        this.fadeIn(element, duration, adjacentFunction, steps);
      else
        this.fadeOut(element, duration, adjacentFunction, steps);
    }
  };

  this.fadeIn = function(element, duration, adjacentFunction, steps) {
    this.animate(element, {
      'opacity': 1
    }, duration, adjacentFunction, steps);
  };

  this.fadeOut = function(element, duration, adjacentFunction, steps) {
    this.animate(element, {
      'opacity': 0
    }, duration, adjacentFunction, steps);
  };

  this.animate = function(element, properties, duration, adjacentFunction, steps) {
    if (typeof adjacentFunction === 'undefined')
      adjacentFunction = (function() {});

    if (typeof element.animation === 'undefined')
      element.animation = {};

    steps = (typeof steps !== 'undefined') ? steps : 10;

    var that = this;
    var invert = false;
    var pixel = false;

    for (var property in properties) {
      element.animation[property] = {};
      element.animation[property].start = (element.get(property) !== null) ? parseFloat(element.get(property)) : 0;
      element.animation[property].end = parseFloat(properties[property]);

      if (typeof element.get(property) === 'string') {
        if (element.get(property).indexOf('px') !== -1)
          pixel = true;
      }

      if (element.animation[property].start > element.animation[property].end) {
        invert = true;
        element.animation[property].increment = (element.animation[property].start - element.animation[property].end) / steps;
      } else {
        element.animation[property].increment = (element.animation[property].end - element.animation[property].start) / steps;
      }

      element.animation[property].function = window.setInterval(function() {
        element.animation.running = true;
        if (invert === true) {
          element.animation[property].start -= element.animation[property].increment;
          element.animation[property].start = Math.round(element.animation[property].start * 100) / 100;

          if (element.animation[property].start >= element.animation[property].end) {
            if (pixel === true)
              element.setStyle(property, element.animation[property].start + 'px');
            else
              element.setStyle(property, element.animation[property].start);
          } else {
            window.clearInterval(element.animation[property].function);
            element.animation.running = false;
            adjacentFunction();
          }
        } else {
          element.animation[property].start += element.animation[property].increment;
          element.animation[property].start = Math.round(element.animation[property].start * 100) / 100;

          if (element.animation[property].start <= element.animation[property].end) {
            if (pixel === true)
              element.setStyle(property, element.animation[property].start + 'px');
            else
              element.setStyle(property, element.animation[property].start);
          } else {
            window.clearInterval(element.animation[property].function);
            element.animation.running = false;
            adjacentFunction();
          }
        }

      }, (duration * 1000) / steps);
    }
  };

  this.isRunning = function(element) {
    if (typeof element.animation === 'undefined')
      return false;

    return element.animation.running;
  };
};
