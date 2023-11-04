# Fairlight CDP Protocol Documentation

## Introduction

Fairlight is a sophisticated JavaScript-based Collateralized Debt Position (CDP) protocol for blockchain financial systems. It enables users to secure cryptocurrency as collateral and borrow against it, incorporating features such as interest accrual and liquidation mechanisms to uphold system integrity.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [CDP Operations](#cdp-operations)
- [Ordinal Inscriptions](#ordinal-inscriptions)
- [Running Tests](#running-tests)
- [Support and Contributions](#support-and-contributions)

## Installation

To set up Fairlight, clone the repository and install its dependencies:

```bash
git clone https://github.com/Larkhell/Fairlight.git
cd Fairlight
npm install
```

## Getting Started

To use Fairlight, create a CDP instance with your Bitcoin node and Ordinal instance:

```javascript
const { CDP } = require('./path_to_CDP/CDP');

const bitcoinNode = /* Your configured Bitcoin node */;
const ordinalInstance = /* Your configured Ordinal instance */;
const cdp = new CDP(bitcoinNode, ordinalInstance);

// Open a new CDP
const cdpId = cdp.openCDP('ownerAddress', 10);
// You can now manage the CDP using the cdp instance.
```

## API Reference

### CDP Class

The `CDP` class is the core component of the Fairlight protocol, offering methods to oversee a CDP's lifecycle.

#### Constructor

```javascript
constructor(bitcoinNode, ordinalInstance, timeProvider)
```

This initializes a new CDP instance with the given Bitcoin node, Ordinal instance, and an optional time provider.

### Methods

- `openCDP(owner, collateralAmount)`: Creates a new CDP with the given collateral.
- `depositCollateral(cdpId, amount)`: Adds more collateral to an existing CDP.
- `withdrawCollateral(cdpId, amount)`: Removes collateral from an existing CDP.
- `drawDebt(cdpId, amount)`: Borrows additional funds against the CDP's collateral.
- `repayDebt(cdpId, amount)`: Pays back some or all of the CDP's debt.
- `closeCDP(cdpId)`: Closes a CDP, releasing the collateral back to the owner upon full debt repayment.
- `accrueInterest(cdpId)`: Applies interest to the CDP's debt over time.
- `checkForLiquidation(cdpId)`: Assesses if a CDP is in danger of being liquidated.
- `liquidateCDP(cdpId)`: Initiates the liquidation of an under-collateralized CDP.

## Ordinal Inscriptions

Fairlight leverages a JSON-based inscription system for CDP operations, offering a structured method to perform actions within the protocol:

1. **Open a CDP**:
   ```json
   {
     "p": "cdp-module",
     "op": "open",
     "params": {
       "user": "bc1quseraddress",
       "collateral": 1000,
       "debt": 500
     }
   }
   ```

2. **Draw Debt**:
   ```json
   {
     "p": "cdp-module",
     "op": "draw",
     "params": {
       "user": "bc1quseraddress",
       "amount": 100
     }
   }
   ```

3. **Repay Debt**:
   ```json
   {
     "p": "cdp-module",
     "op": "wipe",
     "params": {
       "user": "bc1quseraddress",
       "amount": 100
     }
   }
   ```

4. **Close a CDP**:
   ```json
   {
     "p": "cdp-module",
     "op": "close",
     "params": {
       "user": "bc1quseraddress"
     }
   }
   ```

5. **Check for Liquidation**:
   ```json
   {
     "p": "cdp-module",
     "op": "checkLiquidation",
     "params": {
       "user": "bc1quseraddress"
     }
   }
   ```

These inscriptions are used to interact with the CDP system, providing a clear and concise way to manage debt positions on the blockchain.


### Liquidation Logic:

Liquidation is a critical aspect of CDPs. If a CDP's collateral-to-debt ratio falls below a certain threshold (e.g., 150%), the CDP is considered under-collateralized and eligible for liquidation. During liquidation, the collateral is sold to repay the debt. If the protocol is integrated with a Decentralized Exchange (DEX), the sale can be executed directly on the DEX.

### DEX Integration:

Integration with a DEX streamlines the liquidation process. When a CDP needs to be liquidated, the collateral is automatically sold on the DEX to cover the debt. The exchange rate used for the sale is the prevailing rate on the DEX.

In summary, the integration of CDPs with a DEX allows for smoother management of liquidations and provides users with the ability to handle their CDPs more effectively.

---

This abstract provides a comprehensive overview of the Fairlight protocol, detailing its core functionalities, the JSON inscription system for CDP operations, the liquidation logic, and the benefits of DEX integration. It is designed to inform users and developers about the protocol's capabilities and its application in the DeFi space.

## Running Tests

To run the test suite, navigate to the project's root directory and run:

```bash
npm test
```

Ensure you have all the necessary dependencies installed before running the tests.


## Support

For support, please open an issue in the [GitHub issue tracker](https://github.com/Larkhell/Fairlight/issues).

