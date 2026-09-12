import QRCode from "qrcode";

async function main() {
  const medicineId = "MED001";

  await QRCode.toFile(
    "MED001-QR.png",
    medicineId,
    {
      width: 500,
      margin: 2,
    }
  );

  console.log("QR Code generated successfully!");
  console.log("Medicine ID encoded:", medicineId);
  console.log("File: MED001-QR.png");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});