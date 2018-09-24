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

        if (req.body.star) {
            if (!req.body.address) {
                res.status(400).json({message: 'Missing address field'});
                return;
            }

            if (!NotaryService.hasAccessToRegister(req.body.address)) {
                res.status(401).json({message: 'You do not have access to register a star. Please validate your request first with your blockchain Id'});
                return;
            }

            if (!req.body.star.ra || !req.body.star.dec || !req.body.star.story) {
                res.status(400).json({message: 'Missing mandatory star fields: [ra, dec, story]'});
                return;
            }
        }

        await chain.addBlock(req.body);
        res.send(JSON.parse(await chain.getBlock(await chain.getBlockHeight())));

        if (req.body.address) {
            NotaryService.removeAccess(req.body.address);
        }
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

app.get('/stars/:query', async (req, res) => {
    let blocks = await chain.getStarBlock(req.params.query);
    if (!blocks){
        res.status(404).json(
            {message: 'No registered star found'});
        return;
    }

    if (blocks === 'invalid'){
        res.status(400).json(
            {message: 'Sorry, we could not understand your query. Did you made a typo?'});
        return;
    }
    res.json(blocks);
});


app.listen(port, () => init());

function init() {
    chain = new blockchain();
    console.log("Blockchain server running on port " + port)
}