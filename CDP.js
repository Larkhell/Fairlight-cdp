(function(global, factory) {
    // Universal Module Definition (UMD) pattern for JavaScript modules that work everywhere.
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CDP = {}));
})(this, (function(exports) { 'use strict';

    // Import BigNumber library for precise arithmetic operations
    const BigNumber = require('bignumber.js') || global.BigNumber;

    // CDP (Collateralized Debt Position) class definition
    class CDP {
        // Constructor initializes the CDP instance with necessary dependencies, constants, and a time provider
        constructor(bitcoinNode, ordinalInstance, timeProvider = () => new Date().getTime()) {
            this.cdpStorage = {}; // Stores all CDPs
            this.cdpCounter = 0; // Counter for generating unique CDP IDs
            this.bitcoinNode = bitcoinNode; // Bitcoin node for blockchain interactions
            this.ordinalInstance = ordinalInstance; // Ordinal instance for creating inscriptions
            this.MIN_COLLATERAL_RATIO = new BigNumber(1.5); // Minimum collateral-to-debt ratio
            this.INTEREST_RATE = new BigNumber(0.05); // Annual interest rate (5%)
            this.INTEREST_ACCRUAL_PERIOD_MS = 86400000; // Period for interest accrual (daily)
            this.MIN_COLLATERAL = new BigNumber(1); // Minimum collateral required
            this.timeProvider = timeProvider; // Function that provides the current time
        }
        // Method to open a new CDP with a specified amount of collateral
        openCDP(owner, collateralAmount) {
            const collateral = new BigNumber(collateralAmount);
            if (collateral.lt(this.MIN_COLLATERAL)) {
                throw new Error('Collateral amount is too low');
            }
            const debt = new BigNumber(0);
            const cdpId = this.generateCDPId();
            this.cdpStorage[cdpId] = {
                owner,
                collateral,
                debt,
                createdAt: Date.now(),
                lastInterestAccrual: Date.now()
            };
            return cdpId;
        }

        // Method to close a CDP and retrieve collateral
        closeCDP(cdpId) {
            const cdp = this.cdpStorage[cdpId];
            if (!cdp) {
                throw new Error('CDP not found');
            }
            if (!cdp.debt.isZero()) {
                throw new Error('Debt must be repaid before closing the CDP');
            }
            const collateralToReturn = cdp.collateral;
            // Here you would add logic to return the collateral to the owner
            console.log(`Returning collateral to the owner: ${collateralToReturn.toString()}`);
            delete this.cdpStorage[cdpId];
        }                
        // Method to calculate the rate of borrowing or lending
        calculateRate(collateral, debt) {
          // Implement your rate calculation logic here
          // This is a placeholder example calculation
          const rate = collateral / debt;
          return rate;
        }
        // Method to deposit additional collateral into an existing CDP
        depositCollateral(cdpId, amount) {
            const cdp = this.cdpStorage[cdpId];
            cdp.collateral = cdp.collateral.plus(amount);
        }

        // Method to withdraw collateral from an existing CDP
        withdrawCollateral(cdpId, amount) {
            const cdp = this.cdpStorage[cdpId];
            const remainingCollateral = cdp.collateral.minus(amount);
            if (remainingCollateral.lt(0)) {
                throw new Error('Cannot withdraw more than the available collateral');
            }
            cdp.collateral = remainingCollateral;
        }

        // Method to draw debt against the collateral in a CDP
        drawDebt(cdpId, amount) {
            const cdp = this.cdpStorage[cdpId];
            const newDebt = cdp.debt.plus(amount);
            if (!this.isCollateralSufficient(cdp.collateral, newDebt)) {
                throw new Error('Debt exceeds collateral limits');
            }
            cdp.debt = newDebt;
        }

        // Method to repay part or all of the debt in a CDP
        repayDebt(cdpId, amount) {
            const cdp = this.cdpStorage[cdpId];
            const newDebt = cdp.debt.minus(amount);
            if (newDebt.lt(0)) {
                throw new Error('Repay amount exceeds debt');
            }
            cdp.debt = newDebt;
        }

        // Method to check if a CDP is subject to liquidation
        checkForLiquidation(cdpId) {
            const cdp = this.cdpStorage[cdpId];
            if (!this.isCollateralSufficient(cdp.collateral, cdp.debt)) {
                this.liquidateCDP(cdpId);
            }
        }

        // Method to accrue interest on the debt in a CDP
        accrueInterest(cdpId) {
            const cdp = this.cdpStorage[cdpId];
            if (!cdp) {
                throw new Error('CDP not found');
            }
            const timeElapsed = this.timeProvider() - cdp.lastInterestAccrual;
            if (timeElapsed >= this.INTEREST_ACCRUAL_PERIOD_MS) {
                const interest = cdp.debt.times(this.INTEREST_RATE)
                                 .times(timeElapsed / (365 * 24 * 60 * 60 * 1000));
                cdp.debt = cdp.debt.plus(interest);
                cdp.lastInterestAccrual = this.timeProvider();
            }
        }
        // Method to liquidate a CDP
        liquidateCDP(cdpId) {
            const cdp = this.cdpStorage[cdpId];
            if (!cdp) {
                throw new Error('CDP not found');
            }
            console.log(`Liquidating CDP ${cdpId}`);
            this.handleLiquidationWithOrdinalInscription(cdpId, cdp);
            delete this.cdpStorage[cdpId];
        }

        // Helper method to handle liquidation with an ordinal inscription
        handleLiquidationWithOrdinalInscription(cdpId, cdp) {
            const ordinalInscription = this.createOrdinalInscription(cdpId, cdp);
            this.sendBitcoinTransaction(ordinalInscription);
        }

        // Helper method to create an ordinal inscription for liquidation
        createOrdinalInscription(cdpId, cdp) {
            return this.ordinalInstance.createInscription(cdpId, cdp.collateral, cdp.debt);
        }

        // Helper method to send a Bitcoin transaction with an ordinal inscription
        sendBitcoinTransaction(ordinalInscription) {
            this.bitcoinNode.sendTransaction(ordinalInscription)
                .then(txId => console.log(`Transaction sent with txId: ${txId}`))
                .catch(error => console.error('Error sending transaction:', error));
        }

        // Helper method to generate a unique CDP ID
        generateCDPId() {
            return `CDP-${++this.cdpCounter}`;
        }

        // Helper method to check if the collateral is sufficient for the given debt
        isCollateralSufficient(collateral, debt) {
            return collateral.dividedBy(debt).gte(this.MIN_COLLATERAL_RATIO);
        }
    }

    // Export the CDP class to be used in other modules
    exports.CDP = CDP;

})); // End of factory function
