function APIRequest (url, method,  username,password) {
    this.url = url;
    this.method = method;
	this.user = {
        name : username,
        password : password
    }
	this.timestamp = new Date();
    this.id = this.timestamp.getTime();
    this.getUri = function() {
        return this.uri;
    };
}

