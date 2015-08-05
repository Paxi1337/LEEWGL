LEEWGL.REQUIRES.push('AsynchRequest');

LEEWGL.AsynchRequest = function() {
  this.request = {};
  this.response = {};
  this.type = LEEWGL.AsynchRequest.HTML;

  if (window.XMLHttpRequest) {
    this.request = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
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

LEEWGL.AsynchRequest.HTML = 100;
LEEWGL.AsynchRequest.JSON = 101;

LEEWGL.AsynchRequest.prototype = {
  constructor: LEEWGL.AsynchRequest,
  onRequest: function() {},
  onSuccess: function() {},
  onError: function() {

  },
  onReadyStateChange: function() {
    if (this.request.readyState === LEEWGL.AsynchRequest.LOADING) {
      this.onRequest();
    } else if (this.request.readyState === LEEWGL.AsynchRequest.COMPLETE) {
      if (this.request.status === LEEWGL.AsynchRequest.HTTPSTATUS_COMPLETE) {
        this.response['response'] = this.request.response;
        this.response['responseText'] = this.request.responseText;
        this.response['responseHTML'] = this.request.responseHTML;
        this.response['responseXML'] = this.request.responseXML;

        if (this.type === LEEWGL.AsynchRequest.JSON)
          this.response['responseJSON'] = JSON.parse(this.request.responseText);

        this.onSuccess();
      }
    } else {
      this.onError();
    }
  },
  send: function(method, loc, asynch, data, type) {
    this.type = (typeof type !== 'undefined') ? type : LEEWGL.AsynchRequest.HTML;
    data = (typeof data !== 'undefined') ? data : null;

    this.request.open(method.toUpperCase(), loc, asynch);

    if (data === null) {
      this.request.send();
    } else {
      this.request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      this.request.send(data);
    }

    return this;
  }
};
