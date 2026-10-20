import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const owner = await provider.getSigner(0);

  const distributorAddress =
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

  const pharmacyAddress =
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

  const contractAddress =
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const abi = [
    "function approveDistributor(address account, bool approved) external",
    "function approvePharmacy(address account, bool approved) external",
    "function approvedDistributors(address) view returns (bool)",
    "function approvedPharmacies(address) view returns (bool)",
  ];

  const contract = new ethers.Contract(
    contractAddress,
    abi,
    owner
  );

  console.log("Checking deployed contract...");

  console.log(
    "Distributor approval function:",
    contract.interface.getFunction(
      "approveDistributor(address,bool)"
    )?.format()
  );

  console.log("Approving demo distributor...");

  const tx1 = await contract.approveDistributor(
    distributorAddress,
    true
  );

  await tx1.wait();

  console.log("Distributor approved!");

  console.log("Approving demo pharmacy...");

  const tx2 = await contract.approvePharmacy(
    pharmacyAddress,
    true
  );

  await tx2.wait();

  console.log("Pharmacy approved!");

  console.log(
    "Distributor status:",
    await contract.approvedDistributors(distributorAddress)
  );

  console.log(
    "Pharmacy status:",
    await contract.approvedPharmacies(pharmacyAddress)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});