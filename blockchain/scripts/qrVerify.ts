import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();

  const contractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const contract = await connection.ethers.getContractAt(
    "MedicineRegistry",
    contractAddress
  );

  // Simulated QR scan result
  const scannedMedicineId = "MED001";

  console.log("QR Code Scanned!");
  console.log("Medicine ID:", scannedMedicineId);

  const isValid = await contract.verifyMedicine(scannedMedicineId);

  if (isValid) {
    const medicine = await contract.getMedicine(scannedMedicineId);

    console.log("\n========== AUTHENTICATION RESULT ==========");
    console.log("Status: GENUINE MEDICINE");
    console.log("Medicine Name:", medicine[1]);
    console.log("Batch Number:", medicine[2]);
    console.log("Manufacturer:", medicine[3]);
    console.log("Manufacturing Date:", medicine[4]);
    console.log("Expiry Date:", medicine[5]);
    console.log("===========================================");
  } else {
    console.log("\n========== AUTHENTICATION RESULT ==========");
    console.log("Status: FAKE / NOT REGISTERED");
    console.log("===========================================");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});