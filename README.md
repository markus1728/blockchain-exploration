# Blockchain-Exploration
Implementation of blockchain fundamentals in Javascript.

Functionalities included:
  - Chain generation
  - User generation and joining a chain
  - Coin exchange between users
  - Block mining with ProofOfWork
  - Checking of the chain's validity

# Usage 
Create a blockchain and the users. 

```javascript
let testChain = new Blockchain(4, 2);
let Alice= new User("Alice", 100, testChain);
let Bob = new User("Bob", 50, testChain);
```

Transfer coins between the users.

```javascript
Bob.sendCoins(Alice.address, 20, "ETH");
Alice.sendCoins(Bob.address, 40, "ETH");
Bob.sendCoins(Alice.address, 30, "ETH");
Alice.sendCoins(Bob.address, 20, "ETH");
```

Check the validity of the chain

```javascript
console.log(testChain.checkChainValidity());
```
