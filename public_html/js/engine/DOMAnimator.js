LEEWGL.DOM.Animator = function() {
    this.fadeIn = function(element, duration, adjacentFunction) {
        if (typeof adjacentFunction === 'undefined')
            adjacentFunction = (function() {});

        if (typeof element.animation === 'undefined')
            element.animation = {};

        element.animation.value = 0;
        element.setStyle('display', 'block');

        element.animation.fadeIn = window.setInterval(function() {
            element.animation.running = true;
            if (element.animation.value < 100) {
                element.animation.value++;
                element.setStyle('opacity', element.animation.value / 100);
            } else {
                window.clearInterval(element.animation.fadeIn);
                element.animation.running = false;
                adjacentFunction();
            }
        }, duration);
    };

    this.fadeOut = function(element, duration, adjacentFunction) {
        if (typeof adjacentFunction === 'undefined')
            adjacentFunction = (function() {});

        if (typeof element.animation === 'undefined')
            element.animation = {};

        element.animation.value = 100;

        element.animation.fadeOut = window.setInterval(function() {
            element.animation.running = true;
            element.animation.value--;
            if (element.animation.value > 0) {
                element.setStyle('opacity', element.animation.value / 100);
            } else {
                window.clearInterval(element.animation.fadeOut);
                element.setStyle('display', 'none');
                element.animation.running = false;
                adjacentFunction();
            }
        }, duration);
    };

    this.isRunning = function(element) {
        if (typeof element.animation.running === 'undefined')
            return false;

        return element.animation.running;
    };
};
