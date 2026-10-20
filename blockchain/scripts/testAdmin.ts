import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();

  const adminAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [owner, manufacturer] =
    await connection.ethers.getSigners();

  const admin = await connection.ethers.getContractAt(
    "AdminModule",
    adminAddress
  );

  console.log("========== ADMIN MODULE TEST ==========");
  console.log("Admin Contract:", adminAddress);
  console.log("Owner:", await admin.owner());

  // Role enum: None = 0, Manufacturer = 1
  const tx = await admin.setParticipant(
    await manufacturer.getAddress(),
    1,
    true
  );

  await tx.wait();

  console.log("\nManufacturer registered successfully!");

  const participant = await admin.participants(
    await manufacturer.getAddress()
  );

  console.log("Manufacturer Wallet:", await manufacturer.getAddress());
  console.log("Role:", participant[0].toString());
  console.log("Active:", participant[1]);

  console.log("=======================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});