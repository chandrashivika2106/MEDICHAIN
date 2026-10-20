import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();

  const distributorAddress =
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const [owner, distributor1, distributor2, pharmacy] =
    await connection.ethers.getSigners();

  const distributor = await connection.ethers.getContractAt(
    "DistributorModule",
    distributorAddress
  );

  console.log("======= DISTRIBUTOR MODULE TEST =======");
  console.log("Contract:", distributorAddress);
  console.log("Owner:", await distributor.owner());

  // Approve two distributors
  let tx = await distributor.approveDistributor(
    await distributor1.getAddress(),
    true
  );
  await tx.wait();

  tx = await distributor.approveDistributor(
    await distributor2.getAddress(),
    true
  );
  await tx.wait();

  // Approve a pharmacy
  tx = await distributor.approvePharmacy(
    await pharmacy.getAddress(),
    true
  );
  await tx.wait();

  console.log("\nDistributors and pharmacy approved!");

  // Connect as distributor1 and hand medicine to distributor2
  const distributor1Contract = distributor.connect(distributor1);

  tx = await distributor1Contract.handoffToDistributor(
    "MED001",
    await distributor2.getAddress(),
    "Shipment to regional warehouse"
  );
  await tx.wait();

  console.log("Medicine handoff recorded successfully!");

  // Retrieve the handoff
  const count = await distributor.getHandoffCount();

  console.log("Total handoffs:", count.toString());

  const handoff = await distributor.getHandoff(0);

  console.log("Medicine ID:", handoff[0]);
  console.log("From:", handoff[1]);
  console.log("To:", handoff[2]);
  console.log("Note:", handoff[4]);

  console.log("=======================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});