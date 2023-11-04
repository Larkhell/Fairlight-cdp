// cdp.test.js
const { CDP } = require('./cdp'); // Ensure the path is correct
const BigNumber = require('bignumber.js');

// Mocks for dependencies
const bitcoinNodeMock = {
  sendTransaction: jest.fn().mockResolvedValue('txId123'),
};

const ordinalInstanceMock = {
  createInscription: jest.fn().mockReturnValue('inscriptionData'),
};

// Custom time provider
let currentTime = 1000000000000; // Mock current time (e.g., Unix time in milliseconds)
const timeProvider = () => currentTime;
const advanceTime = (ms) => currentTime += ms;

// Describe block defines a test suite for CDP Protocol Operations
describe('CDP Protocol Operations', () => {
  let cdpProtocol;

  // beforeEach function runs before each test to set up the environment
  beforeEach(() => {
    // Reset mocks and create a new instance of CDP before each test
    jest.clearAllMocks();
    cdpProtocol = new CDP(bitcoinNodeMock, ordinalInstanceMock, timeProvider);
  });

  // Test case for opening a new CDP
  test('should open a new CDP', () => {
    const cdpId = cdpProtocol.openCDP('ownerAddress', 10);
    expect(cdpId).toBeDefined();
    expect(cdpProtocol.cdpStorage[cdpId].collateral.toNumber()).toBe(10);
  });
  test('should close a CDP', () => {
    // First, open a new CDP
    const cdpId = cdpProtocol.openCDP('ownerAddress', 10);
    expect(cdpId).toBeDefined();

    // Assume some operations happen here, like repaying the debt

    // Now, attempt to close the CDP
    cdpProtocol.closeCDP(cdpId);

    // Expect the CDP to no longer exist in the storage
    expect(cdpProtocol.cdpStorage[cdpId]).toBeUndefined();
  });

  // Test case for depositing collateral
  test('should deposit collateral', () => {
    const cdpId = cdpProtocol.openCDP('ownerAddress', 10);
    cdpProtocol.depositCollateral(cdpId, 5);
    expect(cdpProtocol.cdpStorage[cdpId].collateral.toNumber()).toBe(15);
  });

  // Test case for withdrawing collateral
  test('should withdraw collateral', () => {
    const cdpId = cdpProtocol.openCDP('ownerAddress', 10);
    cdpProtocol.withdrawCollateral(cdpId, 5);
    expect(cdpProtocol.cdpStorage[cdpId].collateral.toNumber()).toBe(5);
  });

  // Test case for drawing debt against collateral
  test('should draw debt', () => {
    const cdpId = cdpProtocol.openCDP('ownerAddress', 10);
    cdpProtocol.drawDebt(cdpId, 5);
    expect(cdpProtocol.cdpStorage[cdpId].debt.toNumber()).toBe(5);
  });

  // Test case for repaying debt
  test('should repay debt', () => {
    const cdpId = cdpProtocol.openCDP('ownerAddress', 10);
    cdpProtocol.drawDebt(cdpId, 5);
    cdpProtocol.repayDebt(cdpId, 5);
    expect(cdpProtocol.cdpStorage[cdpId].debt.toNumber()).toBe(0);
  });

  // Test case for checking liquidation conditions
  test('should check for liquidation', () => {
    const cdpId = cdpProtocol.openCDP('owner', 10); // Assume 10 units are sufficient collateral
    cdpProtocol.drawDebt(cdpId, 5); // Draw debt within collateral limits
    expect(() => cdpProtocol.checkForLiquidation(cdpId)).not.toThrow();
  });

  // Test case for handling liquidation correctly
  test('should handle liquidation correctly', () => {
    const cdpId = cdpProtocol.openCDP('owner', 10);
    cdpProtocol.drawDebt(cdpId, 6); // Increase debt to be close to the liquidation threshold
    // Withdraw an amount of collateral that will make the ratio just below the liquidation threshold
    // without triggering the "Insufficient collateral" error.
    cdpProtocol.withdrawCollateral(cdpId, 4); // Collateral-to-debt ratio is now 6/6 = 1, just below the threshold of 1.5
    cdpProtocol.checkForLiquidation(cdpId); // Should trigger liquidation
    expect(bitcoinNodeMock.sendTransaction).toHaveBeenCalledWith('inscriptionData');
    expect(ordinalInstanceMock.createInscription).toHaveBeenCalledWith(cdpId, expect.anything(), expect.anything());
    expect(cdpProtocol.cdpStorage[cdpId]).toBeUndefined(); // The CDP should be liquidated and removed
  });


  // Test case for accruing interest
  test('should accrue interest', () => {
    const cdpId = cdpProtocol.openCDP('ownerAddress', 10);
    cdpProtocol.drawDebt(cdpId, 5);
    // Advance time by one day
    advanceTime(86400000);
    cdpProtocol.accrueInterest(cdpId);
    // Calculate the expected debt after interest accrual
    const expectedDebt = new BigNumber(5).times(new BigNumber(1).plus(cdpProtocol.INTEREST_RATE.dividedBy(365))).toNumber();
    expect(cdpProtocol.cdpStorage[cdpId].debt.toNumber()).toBeCloseTo(expectedDebt);
  });

  // Test case for calculating rate
  test('should calculate the correct rate', () => {
    const rate = cdpProtocol.calculateRate(10, 5);
    // This is a placeholder example calculation, replace with the actual expected rate calculation
    const expectedRate = 2; // Replace with the actual expected rate calculation
    expect(rate).toBe(expectedRate);
  });



});
