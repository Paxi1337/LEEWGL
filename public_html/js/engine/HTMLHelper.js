LEEWGL.HTMLHelper = function() {
    this.getSize = function(element, inserted) {
        if (inserted === false)
            document.body.appendChild(element);

        var size = {
            'width': element.offsetWidth,
            'height': element.offsetHeight,
            'display-width': element.clientWidth,
            'display-height': element.clientHeight,
            'scroll-width': element.scrollWidth,
            'scroll-height': element.scrollHeight
        }

        if (inserted === false)
            document.body.removeChild(element);
        return size;
    };
};

var htmlHelper = new LEEWGL.HTMLHelper();
