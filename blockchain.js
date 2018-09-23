/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
    constructor(body) {
        this.hash = "";
        this.height = 0;
        this.body = body;
        this.time = 0;
        this.previousBlockHash = "";
    }
}

class StarBody {
    constructor(star, address) {
        this.star = star;
        this.address = address;
    }
}

class Star {
    constructor(dec, ra, story, magnitude, constellation) {
        this.dec = dec;
        this.ra = ra;
        this.story = story;
        this.magnitude = magnitude;
        this.constellation = constellation;
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {
        this.addGenesisBlock()
    }

    async addGenesisBlock() {
        let chainHeight = await this.getBlockHeight();
        if (chainHeight) return;

        let genesisBlock = new Block("First block in the chain - Genesis block");
        // Block height
        genesisBlock.height = 0;
        // UTC timestamp
        genesisBlock.time = 0;
        // Block hash with SHA256 using newBlock and converting to a string
        genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
        // Adding block object to chain
        addToDB(0, JSON.stringify(genesisBlock));
        setBlockHeight(0);
    }

    // Add new block
    async addBlock(body) {

        let newBlock = new Block(body);
        let chainHeight = await this.getBlockHeight();
        // Block height
        newBlock.height = chainHeight + 1;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (newBlock.height > 0) {
            let lastBlock = JSON.parse(await this.getBlock(chainHeight));
            newBlock.previousBlockHash = lastBlock.hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

        // Adding block object to chain
        await setBlockHeight(newBlock.height);
        await addToDB(newBlock.height, JSON.stringify(newBlock));
        await indexBlock(newBlock);
    }


    // Get block height
    async getBlockHeight() {
        try {
            return parseInt(await db.get("chainHeight"));
        } catch (e) {
            return null;
        }
    }

    // get block
    async getBlock(height) {
        console.log("get Block at height:", height);
        return await db.get(height)
            .catch(function (err) {
                console.error(err);
                return err;
            });
    }

    // get block
    async getStarBlock(query) {
        let array = query.split(":");
        let height = await db.get(array[1]);

        if (array[0] === "hash") {
            return JSON.parse(await db.get(height));
        }

        // if queried by wallet id
        let heightArr = height.split(",");
        let blocks = [];

        for(let i = 0; i< heightArr.length; i++){
            let block = await db.get(heightArr[i]);
            blocks.push(JSON.parse(block));
        }

        console.log("Found " + blocks.length + " blocks");
        return blocks;
    }

    // validate block
    async validateBlock(blockHeight) {
        // get block object
        let block = JSON.parse(await this.getBlock(blockHeight));

        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            console.log('Block #' + blockHeight + ' has a valid hash');
            return true;
        } else {
            console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }

    // Validate blockchain
    async validateChain() {
        let chainHeight = await this.getBlockHeight();
        let errorLog = [];
        for (var i = 0; i < chainHeight; i++) {
            // validate block
            if (!await this.validateBlock(i)) errorLog.push(i);
            // compare blocks hash link
            let blockHash = JSON.parse(await this.getBlock(i)).hash;
            let previousHash = JSON.parse(await this.getBlock(i + 1)).previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            }
        }

        // validating the last block
        let lastBlock = this.getBlockHeight();
        if (!(await this.validateBlock(lastBlock))) errorLog.push(lastBlock);

        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    }

}


async function addToDB(key, value) {
    return db.put(key, value)
        .then(function () {
            console.log("Block added successfully at " + key);
        })
        .catch(function (err) {
            console.error('Block ' + key + ' submission failed', err)
        })
}

async function setBlockHeight(height) {
    await db.put("chainHeight", height);
}

async function indexBlock(newBlock) {
    // to find blocks by hash
    console.log("Indexing the new blocks");
    await db.put(newBlock.hash, newBlock.height);
    let address = newBlock.body.address;

    if (address) {
        try {
            let existingBlocks = await db.get(address);
            await db.put(address, existingBlocks + "," + newBlock.height)
        } catch (e) {
            await db.put(address, newBlock.height);
        }

    }
}

module.exports = Blockchain;
