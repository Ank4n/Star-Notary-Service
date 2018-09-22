const blockchain = require('./blockchain');
const RequestValidationResponse = require('./model/requestValidateResponse');
const express = require('express');
const bodyParser = require("body-parser");
const NodeCache = require("node-cache");

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const memPool = new NodeCache({stdTTL: 5 * 60});

let chain;

let port = 8000;

app.get('/block/:height', async (req, res, next) => {
        if (req.params.height > chain.getBlockHeight())
            res.sendStatus(404);
        else
            res.json(JSON.parse(await chain.getBlock(parseInt(req.params.height))));

        next();
    }
);

app.post('/block', async (req, res, next) => {
        await chain.addBlock(req.body.data);
        res.send(JSON.parse(await chain.getBlock(chain.getBlockHeight())));
        next();
    }
);

app.post('/requestValidation', async (req, res, next) => {
        if (!req.body.address) {
            res.status(400);
            return;
        }

        let ttl = memPool.getTtl(req.body.address);
        let requestValidationResponse = new RequestValidationResponse(req.body.address);

        if (!ttl)
            memPool.set(req.body.address, JSON.stringify(requestValidationResponse));
        else
            requestValidationResponse.validationWindow = Math.floor((ttl - Date.now())/1000);

        res.json(requestValidationResponse);
        next();
    }
);


app.listen(port, () => init());

function init() {
    chain = new blockchain();
    console.log("Blockchain server running on port " + port)
}