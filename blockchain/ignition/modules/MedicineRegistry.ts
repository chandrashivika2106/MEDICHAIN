import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MedicineRegistryModule = buildModule("MedicineRegistryModule", (m) => {
  const medicineRegistry = m.contract("MedicineRegistry");

  return { medicineRegistry };
});

export default MedicineRegistryModule;