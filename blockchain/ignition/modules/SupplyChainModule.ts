import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SupplyChainModule = buildModule("SupplyChainModule", (m) => {
  const adminModule = m.contract("AdminModule");

  const medicineRegistry = m.contract("MedicineRegistry", [
    adminModule,
  ]);

  const distributorModule = m.contract("DistributorModule");

  const pharmacyModule = m.contract("PharmacyModule");

  return {
    adminModule,
    medicineRegistry,
    distributorModule,
    pharmacyModule,
  };
});

export default SupplyChainModule;