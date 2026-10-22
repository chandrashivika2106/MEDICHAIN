import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";

const PHARMACY_MODULE_ADDRESS =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const PHARMACY_ADDRESS =
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

const ABI = [
  "function approvePharmacy(address pharmacy, bool approved)",
  "function approvedPharmacies(address pharmacy) view returns (bool)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Hardhat Account #0 is the PharmacyModule owner.
  const owner = await provider.getSigner(0);

  const pharmacyModule = new ethers.Contract(
    PHARMACY_MODULE_ADDRESS,
    ABI,
    owner
  );

  console.log("Approving pharmacy in PharmacyModule...");

  const tx = await pharmacyModule.approvePharmacy(
    PHARMACY_ADDRESS,
    true
  );

  await tx.wait();

  const approved = await pharmacyModule.approvedPharmacies(
    PHARMACY_ADDRESS
  );

  console.log("Pharmacy approved:", approved);

  await provider.destroy();
}

main().catch(console.error)