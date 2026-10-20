import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();

  const adminAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const registryAddress =
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const [owner, manufacturer, customer] =
    await connection.ethers.getSigners();

  const admin = await connection.ethers.getContractAt(
    "AdminModule",
    adminAddress
  );

  const registry = await connection.ethers.getContractAt(
    "MedicineRegistry",
    registryAddress
  );

  console.log("======= INTEGRATED REGISTRY TEST =======");
  console.log(
  "Registry Admin Address:",
  await registry.adminModuleAddress()
);

  // Approve manufacturer in AdminModule
  const approvalTx = await admin.setParticipant(
    await manufacturer.getAddress(),
    1,
    true
  );

  await approvalTx.wait();

  console.log("Manufacturer approved!");
  const approved = await admin.isApprovedManufacturer(
  await manufacturer.getAddress()
);

console.log("Manufacturer approved status:", approved);

  // Register medicine using the approved manufacturer's wallet
  const manufacturerRegistry = registry.connect(manufacturer);

  const tx = await manufacturerRegistry.addMedicine(
    "MED002",
    "Crocin 500",
    "CRO2026B",
    "XYZ Pharma",
    "11/09/2026",
    "11/09/2028"
  );

  await tx.wait();

  console.log("Medicine registered successfully!");

  // Verify medicine
  const isValid = await registry.verifyMedicine("MED002");

  console.log("Medicine ID: MED002");
  console.log("Verification:", isValid ? "GENUINE" : "NOT REGISTERED");

  const medicine = await registry.getMedicine("MED002");

  console.log("Name:", medicine[1]);
  console.log("Batch:", medicine[2]);
  console.log("Manufacturer:", medicine[3]);

  // Test that an unapproved customer cannot register a medicine
  try {
    const customerRegistry = registry.connect(customer);

    const rejectedTx = await customerRegistry.addMedicine(
      "MED003",
      "Test Medicine",
      "TEST2026",
      "Test Company",
      "01/10/2026",
      "01/10/2028"
    );

    await rejectedTx.wait();

    console.log("ERROR: Unapproved customer was allowed to register!");
  } catch {
    console.log("PASS: Unapproved customer registration rejected!");
  }

  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});