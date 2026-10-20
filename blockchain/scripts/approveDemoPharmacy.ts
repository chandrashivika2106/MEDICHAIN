import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider(
        "http://127.0.0.1:8545"
    );

    // Hardhat account 0 is the contract owner
    const owner = await provider.getSigner(0);

    // IMPORTANT: Replace this with the actual deployed PharmacyModule address
    const pharmacyModuleAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    // Approve the SAME address used by the frontend.
    // Your Pharmacy Portal currently uses Hardhat account 0.
    const pharmacyAddress = await owner.getAddress();

    const abi = [
        "function approvePharmacy(address pharmacy, bool approved) external",
        "function approvedPharmacies(address) view returns (bool)"
    ];

    const pharmacyModule = new ethers.Contract(
        pharmacyModuleAddress,
        abi,
        owner
    );

    console.log("Owner:", await owner.getAddress());
    console.log("Pharmacy to approve:", pharmacyAddress);
    console.log("PharmacyModule:", pharmacyModuleAddress);

    const tx = await pharmacyModule.approvePharmacy(
        pharmacyAddress,
        true
    );

    console.log("Transaction submitted:", tx.hash);

    await tx.wait();

    console.log("Pharmacy approved!");

    const status = await pharmacyModule.approvedPharmacies(
        pharmacyAddress
    );

    console.log("Pharmacy approval status:", status);
}

main().catch((error) => {
    console.error("Approval failed:", error);
    process.exitCode = 1;
});