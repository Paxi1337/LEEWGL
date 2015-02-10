LEEWGL.AsynchRequest = function() {
    this.request;
    this.response = {};

    if(window.XMLHttpRequest) {
        this.request = new XMLHttpRequest();
    } else if(window.ActiveXObject) {
        this.request = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        console.error('LEEWGL.AsynchRequest: Cannot create a XMLHTTP Request.');
        return false;
    }

    this.request.onreadystatechange = this.onReadyStateChange.bind(this);
};

LEEWGL.AsynchRequest.UNINITIALIZED = 0;
LEEWGL.AsynchRequest.LOADING = 1;
LEEWGL.AsynchRequest.LOADED = 2;
LEEWGL.AsynchRequest.INTERACTIVE = 3;
LEEWGL.AsynchRequest.COMPLETE = 4;

LEEWGL.AsynchRequest.HTTPSTATUS_COMPLETE = 200;

LEEWGL.AsynchRequest.prototype = {
    constructor : LEEWGL.AsynchRequest,
    onRequest : function() {
    },
    onSuccess : function() {

    },
    onReadyStateChange : function() {
        if(this.request.readyState === LEEWGL.AsynchRequest.LOADING) {
            this.onRequest();
        } else if(this.request.readyState === LEEWGL.AsynchRequest.COMPLETE) {
            if(this.request.status === LEEWGL.AsynchRequest.HTTPSTATUS_COMPLETE) {
                this.response['response'] = this.request.response;
                this.response['responseText'] = this.request.responseText;
                this.response['responseHTML'] = this.request.responseHTML;

                this.onSuccess();
            }
        }
    },
    send : function(method, loc, asynch, data) {
        this.request.open(method.toUpperCase(), loc, asynch);
        this.request.send(data);

        return this;
    }
};

