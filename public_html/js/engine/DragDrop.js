/**
 * LEEWGL.DragDrop
 *
 * Class to handle drag and drop of dom-elements
 */
LEEWGL.DragDrop = function() {
    /**
     * drag()
     *
     * @param {dom element} obj - the object which shall be dragged
     * @param {dom event} event [optional]
     */
    this.drag = function(obj, event) {
        event = (event !== 'undefined') ? event : document.event;

        var startX = event.clientX;
        var startY = event.clientY;

        var pos = obj.position();

        // / obj to drag needs to be absolutely positioned
        // / offset parent is body
        var origX = pos.x;
        var origY = pos.y;

        var deltaX = startX - origX;
        var deltaY = startY - origY;

        // / events
        var moveHandler = function(e) {
            if (obj.getStyle('position') !== LEEWGL.UI.FIXED)
                obj.setStyle('position', LEEWGL.UI.FIXED);

            obj.setStyle('left', (e.clientX - deltaX) + 'px');
            obj.setStyle('top', (e.clientY - deltaY) + 'px');
            e.stopPropagation();
        };

        var upHandler = function(e) {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', this);
            e.stopPropagation();
        };

        // register events
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);

        // / prevent other use of event
        event.stopPropagation();
        event.preventDefault();
    };

    /**
     *  restore()
     *
     *  @param {dom element} obj - the object which was given drag()
     *  @param {dom event} event [optional]
     */
    this.restore = function(obj, event) {
        event = (event !== 'undefined') ? event : document.event;

        if (obj.getStyle('position') === LEEWGL.UI.FIXED)
            obj.setStyle('position', LEEWGL.UI.STATIC);

        obj.setStyles({
            'left': '',
            'top': ''
        });

        event.stopPropagation();
        event.preventDefault();
    };
};
