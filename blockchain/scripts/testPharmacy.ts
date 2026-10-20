import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();

  const pharmacyAddress =
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const [owner, pharmacy] = await connection.ethers.getSigners();

  const pharmacyContract = await connection.ethers.getContractAt(
    "PharmacyModule",
    pharmacyAddress
  );

  console.log("======= PHARMACY MODULE TEST =======");
  console.log("Contract:", pharmacyAddress);
  console.log("Owner:", await pharmacyContract.owner());

  // Step 1: Approve pharmacy
  let tx = await pharmacyContract.approvePharmacy(
    await pharmacy.getAddress(),
    true
  );
  await tx.wait();

  console.log("\nPharmacy approved!");

  // Step 2: Record medicine receipt
  const pharmacySignerContract = pharmacyContract.connect(pharmacy);

  tx = await pharmacySignerContract.receiveMedicine("MED001");
  await tx.wait();

  console.log("Medicine received successfully!");

  // Step 3: Retrieve the record
  let record = await pharmacyContract.getRecord("MED001");

  console.log("\n--- Pharmacy Record ---");
  console.log("Medicine ID:", record[0]);
  console.log("Pharmacy:", record[1]);
  console.log("Received At:", record[2].toString());
  console.log("Status:", record[4].toString());

  // Step 4: Mark medicine as sold
  tx = await pharmacySignerContract.markSold("MED001");
  await tx.wait();

  console.log("\nMedicine marked as sold!");

  // Step 5: Verify updated status
  record = await pharmacyContract.getRecord("MED001");

  console.log("Updated Status:", record[4].toString());
  console.log("Sold At:", record[3].toString());

  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});