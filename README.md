# MediChain: Additive modules (new files only)

These are new, standalone Solidity contracts intended to be added without replacing your friend's existing files:

- `contracts/DistributorModule.sol` — approved distributor/pharmacy handoffs and history.
- `contracts/PharmacyModule.sol` — pharmacy receipt, sale status, and recall flagging.
- `contracts/AdminModule.sol` — participant approval and suspicious-medicine reports.

## Important integration note

These contracts are intentionally separate from the existing `MedicineRegistry.sol`; they do not automatically share its medicine records or ABI. Copy this folder into the repository, then move/copy the three `.sol` files into `blockchain/contracts/` only if you want Hardhat to compile them with the existing project. This adds new files and does not overwrite existing ones.

Compile from the `blockchain` directory with the project's configured Hardhat version, for example `npx hardhat compile`. Resolve any compiler/toolchain issues before deployment. These contracts are a student prototype and have not been security audited or integrated end-to-end.

## Suggested Git workflow

```bash
git status
git add my-modules/
git commit -m "Add MediChain distributor pharmacy and admin modules"
```

If you put the Solidity files directly into `blockchain/contracts/`, stage only the new filenames explicitly:

```bash
git add blockchain/contracts/DistributorModule.sol blockchain/contracts/PharmacyModule.sol blockchain/contracts/AdminModule.sol
git commit -m "Add MediChain supply chain modules"
```
