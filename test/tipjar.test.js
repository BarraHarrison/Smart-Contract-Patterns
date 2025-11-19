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

    it("should accept tips and update balance", async function () {
        const amount = ethers.parseEther("1");

        await tipJar.connect(addr1).tip({ value: amount });

        const userBalance = await tipJar.balances(addr1.address);
        expect(userBalance).to.equal(amount);

        const total = await tipJar.totalBalance();
        expect(total).to.equal(amount);
    });

    it("should emit a TipReceived event on tip", async function () {
        const amount = ethers.parseEther("0.5");

        await expect(
            tipJar.connect(addr1).tip({ value: amount })
        ).to.emit(tipJar, "TipReceived")
            .withArgs(addr1.address, amount);
    });

    it("should allow ONLY owner to withdraw", async function () {
        const tip1 = ethers.parseEther("1");
        await tipJar.connect(addr1).tip({ value: tip1 });

        await expect(
            tipJar.connect(addr1).withdraw()
        ).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(tipJar.connect(owner).withdraw()).not.to.be.reverted;
    });

    it("should transfer the total balance to the owner on withdrawal", async function () {
        const tip1 = ethers.parseEther("1");
        const tip2 = ethers.parseEther("0.5");

        await tipJar.connect(addr1).tip({ value: tip1 });
        await tipJar.connect(addr2).tip({ value: tip2 });

        const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

        const tx = await tipJar.connect(owner).withdraw();
        const receipt = await tx.wait();

        const gasUsed = receipt.gasUsed * receipt.gasPrice;

        const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

        const total = ethers.parseEther("1.5");

        expect(ownerBalanceAfter).to.equal(
            ownerBalanceBefore + total - gasUsed
        );

        expect(await tipJar.totalBalance()).to.equal(0n);
    });
});
