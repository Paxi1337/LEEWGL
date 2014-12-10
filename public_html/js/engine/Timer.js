LEEWGL.Timer = function(auto) {
    this.auto = auto !== undefined ? auto : true;
    
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    
    this.running = false;
};

LEEWGL.Timer.prototype = {
    constructor : LEEWGL.Timer,
    
    start : function() {
        this.startTime = self.performance !== undefined && self.performance.now !== undefined ? self.performance.now() : Date.now();
        this.oldTime = this.starTime;
        this.running = true;
    },
    
    stop : function() {
        this.getElapsedTime();
        this.running = false;
    },
    
    getElapsedTime : function() {
        this.getDeltaTime();
        return this.elapsedTime;
    },
    
    getDeltaTime : function() {
        if(this.auto && this.running === false)
            this.start();
        
        var diff = 0;
        
        if(this.running === true) {
            var newTime = self.performance !== undefined && self.performance.now !== undefined ? self.performance.now() : Date.now();
            diff = 0.001 * (newTime - this.oldTime);
            this.oldTime = newTime;
            this.elapsedTime += diff;
        }
        
        return diff;
    }
};
