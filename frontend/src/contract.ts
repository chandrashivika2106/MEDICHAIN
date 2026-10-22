export const ADMIN_MODULE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_id",
        type: "string",
      },
    ],
    name: "verifyMedicine",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_id",
        type: "string",
      },
    ],
    name: "getMedicine",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "id",
            type: "string",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "batchNumber",
            type: "string",
          },
          {
            internalType: "string",
            name: "manufacturer",
            type: "string",
          },
          {
            internalType: "string",
            name: "manufacturingDate",
            type: "string",
          },
          {
            internalType: "string",
            name: "expiryDate",
            type: "string",
          },
          {
            internalType: "address",
            name: "registeredBy",
            type: "address",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct MedicineRegistry.Medicine",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
// ==========================================
// ADMIN MODULE
// ==========================================


export const ADMIN_MODULE_ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "participants",
    outputs: [
      {
        internalType: "enum AdminModule.Role",
        name: "role",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "enum AdminModule.Role",
        name: "role",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
    ],
    name: "setParticipant",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isApprovedManufacturer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "medicineId",
        type: "string",
      },
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "reportSuspiciousMedicine",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getReportCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "reportId",
        type: "uint256",
      },
    ],
    name: "getReport",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "medicineId",
            type: "string",
          },
          {
            internalType: "address",
            name: "reporter",
            type: "address",
          },
          {
            internalType: "string",
            name: "reason",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "reviewed",
            type: "bool",
          },
        ],
        internalType: "struct AdminModule.Report",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "reportId",
        type: "uint256",
      },
    ],
    name: "reviewReport",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;