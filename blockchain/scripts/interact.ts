import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();

  const contractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const contract = await connection.ethers.getContractAt(
    "MedicineRegistry",
    contractAddress
  );

  const tx = await contract.addMedicine(
    "MED001",
    "Paracetamol 650",
    "PAR2026A",
    "ABC Pharma",
    "11/09/2026",
    "11/09/2028"
  );

  console.log("Transaction submitted:", tx.hash);

  await tx.wait();

  console.log("Medicine registered successfully!");
  console.log("Medicine ID: MED001");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});