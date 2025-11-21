# TipJarOwnable – Solidity Smart Contract (Ownable Pattern + Withdrawals)

This project is a simple **Tip Jar** smart contract built with **Solidity**, **Hardhat**, **OpenZeppelin**, and **Ethers v6**. It was developed as part of my blockchain study roadmap to understand **smart contract patterns**, especially the **Ownable** access control model.

---

## 📌 Project Goal

Build a small but realistic Solidity contract that:

* Accepts ETH tips from any user
* Stores tip messages + metadata
* Allows *only the owner* to withdraw funds
* Demonstrates the **pull-payment pattern**
* Uses OpenZeppelin’s **Ownable** for access control
* Is fully tested using Hardhat + Ethers v6

---

## 📘 What I Learned

### 🔑 1. How OpenZeppelin’s Ownable Works

* The contract deployer becomes the default owner.
* The `onlyOwner` modifier protects sensitive functions like `withdraw()`.
* Newer OZ versions use **custom errors**, not string reverts:

  ```
  OwnableUnauthorizedAccount(address)
  ```
* Tests must use:

  ```js
  .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
  ```

### 💸 2. Pull-Based Withdrawals

Instead of sending funds during tipping, the contract **holds ETH** until the owner calls:

```solidity
function withdraw() external onlyOwner { ... }
```

This avoids re-entrancy issues and matches Web3 best practices.

### 🧪 3. How to Write Ethers v6 Tests

* Learned how to deploy contracts with Hardhat.
* Wrote event tests (`TipReceived`, `Withdraw`).
* Fixed multiple issues involving incorrect signer usage and undefined variables.
* Learned why testing *wallet balance changes* can fail due to gas costs.
* Replaced balance-difference tests with the correct pattern:

  * Check contract balance before withdrawal
  * Check contract balance after withdrawal
  * Verify event emission

### 🛠 4. Debugging BigInt Mixing Errors

Ethers v6 returns **BigInt**, not BigNumber. I learned how to avoid:

```
TypeError: Cannot mix BigInt and other types
```

by ensuring all math stays strictly in `BigInt`.

---

## ✨ Final Features

* `sendTip(message)` — send ETH + message
* `receive()` / `fallback()` — accept direct ETH transfers
* `getAllTips()` — retrieve full tip history
* `withdraw()` — owner-only ETH withdrawal
* Events:

  * `TipReceived`
  * `Withdraw`

All tests pass:

```
14 passing
0 failing
```

---

## 📂 Project Structure

```
contracts/
  TipJarOwnable.sol

scripts/
  deploy.js

test/
  tipjar.test.js

hardhat.config.js
```

---

## ▶ How to Run the Project

### Start a local Hardhat blockchain

```bash
npx hardhat node
```

### Run tests

```bash
npx hardhat test --network localhost
```

### Deploy the contract locally

```bash
npx hardhat run scripts/deploy.js --network localhost
```

---