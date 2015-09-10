function APIRequest(url, method, username, password, requestBody) {
    this.url = url;
    this.method = method;
    this.requestBody = requestBody;
    this.user = {
        name: username,
        password: password
    }
    this.timestamp = new Date();
    this.id = this.timestamp.getTime();
    this.getUri = function () {
        return this.uri;
    };
}

