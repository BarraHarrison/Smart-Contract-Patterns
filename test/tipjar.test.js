const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipJarOwnable", function () {
    let TipJar, tipJar, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        TipJar = await ethers.getContractFactory("TipJarOwnable");
        tipJar = await TipJar.deploy();
        await tipJar.waitForDeployment();
    });

    it("should set the deployer as the owner", async function () {
        expect(await tipJar.owner()).to.equal(owner.address);
    });

    it("should accept tips and update contract balance", async function () {
        const amount = ethers.parseEther("1");

        await tipJar.connect(addr1).sendTip("Great work!", { value: amount });

        const contractBalance = await tipJar.getBalance();
        expect(contractBalance).to.equal(amount);
    });

    it("should emit a TipReceived event on tip", async function () {
        const amount = ethers.parseEther("0.5");

        await expect(
            tipJar.connect(addr1).sendTip("Nice tip!", { value: amount })
        ).to.emit(tipJar, "TipReceived")
            .withArgs(addr1.address, amount, "Nice tip!");
    });

    it("should allow ONLY owner to withdraw", async function () {
        const tipAmount = ethers.parseEther("1");

        await tipJar.connect(addr1).sendTip("Test", { value: tipAmount });

        await expect(tipJar.connect(addr1).withdraw()).to.be.revertedWithCustomError
            (tipJar, "OwnableUnauthorizedAccount");

        await expect(tipJar.connect(owner).withdraw()).not.to.be.reverted;
    });

    it("should transfer the total balance to the owner on withdrawal", async function () {
        const tip1 = ethers.parseEther("1");
        const tip2 = ethers.parseEther("0.5");

        await tipJar.connect(addr1).sendTip("Tip1", { value: tip1 });
        await tipJar.connect(addr2).sendTip("Tip2", { value: tip2 });

        const balanceBefore = await tipJar.getBalance();
        expect(balanceBefore).to.equal(tip1 + tip2);

        await expect(tipJar.connect(owner).withdraw())
            .to.emit(tipJar, "Withdraw")
            .withArgs(owner.address, balanceBefore);

        const balanceAfter = await tipJar.getBalance();
        expect(balanceAfter).to.equal(0n);
    });

});
