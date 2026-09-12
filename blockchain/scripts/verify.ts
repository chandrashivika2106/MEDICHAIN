import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();

  const contractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const contract = await connection.ethers.getContractAt(
    "MedicineRegistry",
    contractAddress
  );

  const medicineId = "MED001";

  const isValid = await contract.verifyMedicine(medicineId);

  console.log("Medicine ID:", medicineId);
  console.log("Verification Result:", isValid ? "GENUINE" : "FAKE / NOT REGISTERED");

  if (isValid) {
    const medicine = await contract.getMedicine(medicineId);

    console.log("\n--- Medicine Details ---");
    console.log("Name:", medicine[1]);
    console.log("Batch Number:", medicine[2]);
    console.log("Manufacturer:", medicine[3]);
    console.log("Manufacturing Date:", medicine[4]);
    console.log("Expiry Date:", medicine[5]);
    console.log("Registered By:", medicine[6]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});