function RequestStore() {
    this.requests = new Array();

    this.Add = function (request) {
        this.requests.push(request);
    };

}
