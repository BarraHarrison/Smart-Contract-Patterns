const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with:", deployer.address);

    const TipJarOwnable = await hre.ethers.getContractFactory("TipJarOwnable");

    const tipJar = await TipJarOwnable.deploy();
    await tipJar.waitForDeployment();

    console.log("TipJarOwnable deployed to:", await tipJar.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});