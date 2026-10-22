import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const ADMIN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const REGISTRY_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const MANUFACTURER = "0x70997970c51812dc3a010c7d01b50d0e17dc79c8";

async function main() {
  const adminAbi = [
    "function participants(address) view returns (uint8 role, bool active)",
    "function isApprovedManufacturer(address) view returns (bool)",
  ];

  const registryAbi = [
    "function adminModuleAddress() view returns (address)",
  ];

  const admin = new ethers.Contract(ADMIN_ADDRESS, adminAbi, provider);
  const registry = new ethers.Contract(REGISTRY_ADDRESS, registryAbi, provider);

  console.log("Manufacturer status:", await admin.participants(MANUFACTURER));
  console.log("Manufacturer approved:", await admin.isApprovedManufacturer(MANUFACTURER));
  console.log("Registry's AdminModule:", await registry.adminModuleAddress());
  console.log("Expected AdminModule:", ADMIN_ADDRESS);
}

main().catch(console.error);