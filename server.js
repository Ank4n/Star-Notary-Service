const blockchain = require('./blockchain');
const NotaryService = require('./notary-service');
const express = require('express');
const bodyParser = require("body-parser");

const notaryService = new NotaryService();

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


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

app.post('/requestValidation', async (req, res) => {
        if (!req.body.address) {
            res.status(400).json({message: 'Missing address field'});
            return;
        }

        res.json(notaryService.requestValidation(req.body.address));
    }
);

app.post('/message-signature/validate', async (req, res) => {
    if (!req.body.address || !req.body.signature) {
        res.status(400).json({message: 'Missing address or signature field'});
        return;
    }

    let validateObject = notaryService.validate(req.body.address, req.body.signature);

    if (!validateObject) {
        res.status(404).json(
            {message: 'Validation request not found or has expired. Create a new validation request'});
        return;
    }

    res.json(validateObject);
});


app.listen(port, () => init());

function init() {
    chain = new blockchain();
    console.log("Blockchain server running on port " + port)
}