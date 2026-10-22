import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";

const MODULE_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const DISTRIBUTOR =
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

const PHARMACY =
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

const ABI = [
  "function approveDistributor(address account, bool approved)",
  "function approvePharmacy(address account, bool approved)",
  "function approvedDistributors(address account) view returns (bool)",
  "function approvedPharmacies(address account) view returns (bool)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Hardhat local test account #0 — contract owner
  const owner = await provider.getSigner(0);

  const module = new ethers.Contract(
    MODULE_ADDRESS,
    ABI,
    owner
  );

  console.log("Approving distributor...");
  const tx1 = await module.approveDistributor(DISTRIBUTOR, true);
  await tx1.wait();

  console.log("Approving pharmacy...");
  const tx2 = await module.approvePharmacy(PHARMACY, true);
  await tx2.wait();

  console.log(
    "Distributor approved:",
    await module.approvedDistributors(DISTRIBUTOR)
  );

  console.log(
    "Pharmacy approved:",
    await module.approvedPharmacies(PHARMACY)
  );

  await provider.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})