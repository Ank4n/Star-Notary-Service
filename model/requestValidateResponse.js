class RequestValidateResponse {
    constructor(address, validationWindow) {
        let now = Date.now();
        this.address = address;
        this.requestTimeStamp = now;
        this.message = address + ":" + now + ":" + "starRegistry";
        this.validationWindow = 300;
    }
}

module.exports = RequestValidateResponse;
