const NodeCache = require("node-cache");
const initialValidationWindow = 5 * 60;
const cache = new NodeCache({stdTTL: initialValidationWindow});
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');


class MemPoolObject {
    constructor(timestamp = Date.now(), validated = false) {
        this.timestamp = timestamp;
        this.validated = validated;

    }
}

class NotaryService {

    requestValidation(address) {
        let ttl = cache.getTtl(address);
        let memPoolObject, validationWindow;
        let newRequest = !ttl;

        if (newRequest) {
            memPoolObject = new MemPoolObject();
            cache.set(address, JSON.stringify(memPoolObject));
            validationWindow = initialValidationWindow;
        }
        else {
            memPoolObject = JSON.parse(cache.get(address));
            validationWindow = calculateValidationWindow(ttl);
        }

        return new RequestValidateObject(
            address, memPoolObject.timestamp,
            buildMessage(address, memPoolObject.timestamp),
            validationWindow);
    }

    validate(address, signature) {
        let memPoolObjectJson = cache.get(address);
        if (!memPoolObjectJson) return false;

        let memPoolObject = JSON.parse(memPoolObjectJson);
        let ttl = cache.getTtl(address);

        let message = buildMessage(address, memPoolObject.timestamp);

        let signatureValid = false;
        try {
            signatureValid = bitcoinMessage.verify(message,
                address, signature);
        } catch (e) {}

        let validationWindow = calculateValidationWindow(ttl);

        if (signatureValid)
            cache.set(address, JSON.stringify(new MemPoolObject(memPoolObject.timestamp, true)), validationWindow);

        return new ValidateSuccessObject(address, memPoolObject.timestamp, message, validationWindow, signatureValid);

    }

    static hasAccessToRegister(address) {
        let memPoolObject = cache.get(address);
        if (!memPoolObject) return false;

        return JSON.parse(memPoolObject).validated;
    }

    static removeAccess(address) {
        cache.del(address);
    }
}


class ValidateSuccessObject {
    constructor(address, requestTimeStamp, message, validationWindow, isSignatureValid) {
        this.registerStar = isSignatureValid;
        this.status = new Status(address, requestTimeStamp, message, validationWindow, isSignatureValid);
    }
}

class Status {
    constructor(address, requestTimeStamp, message, validationWindow, isSignatureValid) {
        this.address = address;
        this.requestTimeStamp = requestTimeStamp;
        this.message = message;
        this.validationWindow = validationWindow;
        this.messageSignature = isSignatureValid ? "Valid" : "Invalid";
    }
}

class RequestValidateObject {
    constructor(address, requestTimeStamp, message, validationWindow) {
        this.address = address;
        this.requestTimeStamp = requestTimeStamp;
        this.message = message;
        this.validationWindow = validationWindow;
    }
}

function buildMessage(address, timeStamp = Date.now()) {
    return address + ":" + timeStamp + ":" + "starRegistry";
}

function calculateValidationWindow(ttl) {
    return Math.floor((ttl - Date.now()) / 1000);
}

module.exports = NotaryService;