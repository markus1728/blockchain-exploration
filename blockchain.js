const SHA256 = require("crypto-js/sha256");
let userList = [];

class User {
    constructor(name, coins, blockchain) {
        this.address = SHA256(name).toString();
        this.coins = coins
        this.blockchain = blockchain
        this.addToBLockchain()
    }

    addToBLockchain() {
        userList.push(this)
    }

    sendCoins(receiverAddress, amount, currency) {
        //check if enough coins
        if (amount <= this.coins) {
            this.blockchain.addTransaction(new Transaction(this.address, receiverAddress, amount, currency))
            this.coins = this.coins - amount
        } else {
            return console.log("Not enough coins")
        }
    }

    setCoins(amount) {
        this.coins = this.coins + amount;
    }
}

class Transaction {
    constructor(senderAddress, receiverAddress, amount, currency) {
        let transactionFee = 0.1 * amount;
        let totalOutput = amount - transactionFee;
        this.transaction = {
            time: new Date(Date.now()).toUTCString(), senderAddress: senderAddress, receiverAddress: receiverAddress,
            totalInput: amount, totalOutput: totalOutput, transactionFee: transactionFee, currency: currency
        }
        return this.transaction
    }
}

class Block {
    constructor(id, time, previousBlockHash, transactionVolume, transactions) {
        this.blockID = id;
        this.time = time;
        this.previousBlockHash = previousBlockHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.transactionVolume = transactionVolume;
        this.transactionsList = [...transactions]
    }

    calculateHash() {
        return SHA256(
            this.blockID + this.time + this.previousBlockHash + this.nonce + this.transactionVolume + JSON.stringify(this.transactionsList)
        ).toString();
    }

    proofOfWork(mineDifficulty) {
        while (this.hash.substring(0, mineDifficulty) !== Array(mineDifficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain {
    constructor(mineDifficulty, transactionsPerBlock) {
        this.chain = [];
        this.createGenesisBlock();
        this.pendingTransactions = [];
        this.mineDifficulty = mineDifficulty;
        this.transactionsPerBlock = transactionsPerBlock;
    }

    createGenesisBlock() {
        let genesisBlock = new Block(0, new Date(Date.now()).toUTCString(), "0",
            0, ["First block in the blockchain"]);
        this.chain.push(genesisBlock);
    }

    getLatestBlock() {
        let indexOfLatestBlock = this.chain.length - 1;
        return this.chain[indexOfLatestBlock];
    }

    mineBlock() {
        let blockID = Object.keys(this.chain).length;
        let transactionVolume = 0;

        for (let i = 0; i < Object.keys(this.pendingTransactions).length; i++) {
            //calculate the total transaction volume in this block
            transactionVolume = transactionVolume + this.pendingTransactions[i].totalInput;
            //add coins to receivers coins amount
            let user = userList.filter(obj => {
                return obj.address === this.pendingTransactions[i].receiverAddress
            })
            user[0].setCoins(this.pendingTransactions[i].totalOutput)
        }

        let block = new Block(blockID, new Date(Date.now()).toUTCString(), this.getLatestBlock().hash, transactionVolume, this.pendingTransactions);
        block.proofOfWork(this.mineDifficulty);
        this.chain.push(block);
        this.pendingTransactions.splice(0, Object.keys(this.pendingTransactions).length);
    }

    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
        //mine a block if pending transactions equal the allowed transactions per block
        if (Object.keys(this.pendingTransactions).length === this.transactionsPerBlock) {
            this.mineBlock();
        }
    }

    checkChainValidity() {
        if (Object.keys(this.chain).length === 1) {
            return true;
        }
        for (let i = 1; i < Object.keys(this.chain).length; i++) {
            let previousBlock = this.chain[i - 1];
            let currentBlock = this.chain[i];

            let validHash = (currentBlock.hash === currentBlock.calculateHash());
            let previousHashValid = (currentBlock.previousBlockHash === previousBlock.hash);
            let validChain = (validHash && previousHashValid);

            if (!validChain) {
                return false;
            }
        }
        return true;
    }
}


