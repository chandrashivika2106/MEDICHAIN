import { network } from "hardhat";
import { ethers } from "ethers";

const DISTRIBUTOR_MODULE_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const DISTRIBUTOR =
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

const PHARMACY =
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

const ABI = [
  "function approveDistributor(address account, bool approved)",
  "function approvePharmacy(address account, bool approved)",
  "function approvedDistributors(address account) view returns (bool)",
  "function approvedPharmacies(address account) view returns (bool)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const owner = await provider.getSigner(0);

  const distributorModule = new ethers.Contract(
    DISTRIBUTOR_MODULE_ADDRESS,
    ABI,
    owner
  );

  console.log("Approving distributor...");
  await (await distributorModule.approveDistributor(DISTRIBUTOR, true)).wait();

  console.log("Approving pharmacy...");
  await (await distributorModule.approvePharmacy(PHARMACY, true)).wait();

  console.log(
    "Distributor approved:",
    await distributorModule.approvedDistributors(DISTRIBUTOR)
  );

  console.log(
    "Pharmacy approved:",
    await distributorModule.approvedPharmacies(PHARMACY)
  );

  await provider.destroy();
}

main().catch(console.error);