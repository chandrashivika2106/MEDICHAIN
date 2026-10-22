import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ethers } from "ethers";
import "./App.css";

declare global {
  interface Window {
    ethereum?: any;
  }
}
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  ADMIN_MODULE_ABI,
  ADMIN_MODULE_ADDRESS,
} from "./contract";

type Role =
  | "home"
  | "manufacturer"
  | "customer"
  | "admin"
  | "distributor"
  | "pharmacy";

const RPC_URL = "http://127.0.0.1:8545";

// Local Hardhat demo only. Account 0 is the deployer/owner.
// Do not use this fixed-account pattern on a public or production network.
const LOCAL_ADMIN_SIGNER_INDEX = 0;
const LOCAL_MANUFACTURER_SIGNER_INDEX = 1;
const LOCAL_DISTRIBUTOR_SIGNER_INDEX = 2;
const DISTRIBUTOR_MODULE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const PHARMACY_MODULE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PHARMACY_MODULE_ABI = [
  { inputs: [{ internalType: "string", name: "medicineId", type: "string" }], name: "receiveMedicine", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string", name: "medicineId", type: "string" }], name: "markSold", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string", name: "medicineId", type: "string" }], name: "flagRecall", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "pharmacy", type: "address" }], name: "approvedPharmacies", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "string", name: "medicineId", type: "string" }], name: "getRecord", outputs: [{ components: [{ internalType: "string", name: "medicineId", type: "string" }, { internalType: "address", name: "pharmacy", type: "address" }, { internalType: "uint256", name: "receivedAt", type: "uint256" }, { internalType: "uint256", name: "soldAt", type: "uint256" }, { internalType: "enum PharmacyModule.Status", name: "status", type: "uint8" }], internalType: "struct PharmacyModule.PharmacyRecord", name: "", type: "tuple" }], stateMutability: "view", type: "function" },
];
const DISTRIBUTOR_MODULE_ABI = [
  { inputs: [{ internalType: "string", name: "medicineId", type: "string" }, { internalType: "address", name: "recipient", type: "address" }, { internalType: "string", name: "note", type: "string" }], name: "handoffToDistributor", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string", name: "medicineId", type: "string" }, { internalType: "address", name: "recipient", type: "address" }, { internalType: "string", name: "note", type: "string" }], name: "handoffToPharmacy", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "approvedDistributors", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "approvedPharmacies", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
];

function App() {
  const [role, setRole] = useState<Role>("home");
  const [registeredQrValue, setRegisteredQrValue] = useState("");

  const [medicineId, setMedicineId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin dashboard state
  const [participantAddress, setParticipantAddress] = useState("");
  const [participantRole, setParticipantRole] = useState("1");
  const [participantStatus, setParticipantStatus] = useState<{
    role: string;
    active: boolean;
  } | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAccount, setAdminAccount] = useState("");
  const [reportMedicineId, setReportMedicineId] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [reportsMessage, setReportsMessage] = useState("");
  const [reportsLoading, setReportsLoading] = useState(false);

  // Distributor dashboard state
  const [handoffMedicineId, setHandoffMedicineId] = useState("");
  const [handoffRecipient, setHandoffRecipient] = useState("");
  const [handoffNote, setHandoffNote] = useState("");
  const [handoffType, setHandoffType] = useState<"distributor" | "pharmacy">("pharmacy");
  const [handoffMessage, setHandoffMessage] = useState("");
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffHash, setHandoffHash] = useState("");

  // Pharmacy dashboard state
  const [pharmacyMedicineId, setPharmacyMedicineId] = useState("");
  const [pharmacyMessage, setPharmacyMessage] = useState("");
  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [pharmacyRecord, setPharmacyRecord] = useState<any>(null);

  useEffect(() => {
    if (role !== "customer") return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 200, height: 200 } },
      false
    );

    scanner.render(
      (decodedText) => {
      const scannedId = decodedText.trim();
      setMedicineId(scannedId);
      setError("");
      console.log("Scanned Medicine ID:", scannedId);
    },
    (errorMessage) => {
    // Ignore errors while the camera searches for a QR code.
    }
  );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [role]);

  useEffect(() => {
    if (role === "admin") {
      void checkAdminAccess();
    }
  }, [role]);

  async function getProvider() {
    return new ethers.JsonRpcProvider(RPC_URL);
  }

  async function registerMedicine() {
    try {
      if (
        !medicineId.trim() ||
        !medicineName.trim() ||
        !batchNumber.trim() ||
        !manufacturer.trim() ||
        !manufacturingDate.trim() ||
        !expiryDate.trim()
      ) {
        alert("Please fill all medicine details.");
        return;
      }

      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install or enable MetaMask.");
        return;
      }

      // Request access to MetaMask and use its currently selected account.
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        alert("No MetaMask account is connected. Please connect MetaMask and try again.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 31337n) {
        alert("Please switch MetaMask to the MediChain Local network (Chain ID 31337).");
        return;
      }

      // Do not hardcode a particular wallet here. The smart contract checks
      // whether this connected signer is an approved manufacturer.
      const signer = await provider.getSigner(accounts[0]);
      const signerAddress = await signer.getAddress();
      console.log("Registration account:", signerAddress);

      const addMedicineAbi = {
        inputs: [
          { internalType: "string", name: "_id", type: "string" },
          { internalType: "string", name: "_name", type: "string" },
          { internalType: "string", name: "_batchNumber", type: "string" },
          { internalType: "string", name: "_manufacturer", type: "string" },
          { internalType: "string", name: "_manufacturingDate", type: "string" },
          { internalType: "string", name: "_expiryDate", type: "string" },
        ],
        name: "addMedicine",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      };

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        [...CONTRACT_ABI, addMedicineAbi],
        signer
      );

      const tx = await contract.addMedicine(
        medicineId.trim(),
        medicineName.trim(),
        batchNumber.trim(),
        manufacturer.trim(),
        manufacturingDate.trim(),
        expiryDate.trim()
      );

      await tx.wait();
      setRegisteredQrValue(medicineId.trim());
      alert(`Medicine ${medicineId.trim()} registered successfully on blockchain!`);
    } catch (err: any) {
      console.error(err);
      alert(
        err?.shortMessage ||
          err?.reason ||
          err?.info?.error?.message ||
          "Registration failed. Check the browser console."
      );
    }
  }

  async function verifyMedicine() {
    if (!medicineId.trim()) {
      setError("Please enter a Medicine ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const provider = await getProvider();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const isValid = await contract.verifyMedicine(medicineId.trim());

      if (!isValid) {
        setResult({ genuine: false });
        return;
      }

      const medicine = await contract.getMedicine(medicineId.trim());

      setResult({
        genuine: true,
        id: medicine[0],
        name: medicine[1],
        batch: medicine[2],
        manufacturer: medicine[3],
        manufacturingDate: medicine[4],
        expiryDate: medicine[5],
        registeredBy: medicine[6],
      });
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the blockchain. Make sure the local Hardhat node is running and the contract address is current."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitHandoff() {
    setHandoffMessage("");
    setHandoffHash("");

    if (!handoffMedicineId.trim() || !handoffRecipient.trim() || !handoffNote.trim()) {
      setHandoffMessage("Please fill in the medicine ID, recipient address, and transfer note.");
      return;
    }
    if (!ethers.isAddress(handoffRecipient.trim())) {
      setHandoffMessage("Enter a valid recipient wallet address.");
      return;
    }
    if (!window.ethereum) {
      setHandoffMessage("MetaMask is not installed or enabled. Install/unlock MetaMask and try again.");
      return;
    }

    try {
      setHandoffLoading(true);
      setHandoffMessage("Connecting to MetaMask...");

      // Request the selected MetaMask account; this account becomes the sender.
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || accounts.length === 0) {
        setHandoffMessage("No MetaMask account is connected. Connect an account and try again.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n) {
        setHandoffMessage("Switch MetaMask to MediChain Local (Chain ID 31337; RPC http://127.0.0.1:8545).");
        return;
      }

      const signer = await provider.getSigner(accounts[0]);
      const senderAddress = await signer.getAddress();
      console.log("Distributor handoff sender:", senderAddress);

      const distributor = new ethers.Contract(
        DISTRIBUTOR_MODULE_ADDRESS,
        DISTRIBUTOR_MODULE_ABI,
        signer
      );

      // Check the module's own allowlist before asking MetaMask to sign.
      const senderApproved = await distributor.approvedDistributors(senderAddress);
      if (!senderApproved) {
        setHandoffMessage(
          `This MetaMask account (${senderAddress}) is not approved as a distributor in DistributorModule. Import/select the approved local distributor account or approve this address first.`
        );
        return;
      }

      const recipient = handoffRecipient.trim();
      const recipientApproved = handoffType === "distributor"
        ? await distributor.approvedDistributors(recipient)
        : await distributor.approvedPharmacies(recipient);
      if (!recipientApproved) {
        setHandoffMessage(
          handoffType === "distributor"
            ? "The recipient is not approved as a distributor in DistributorModule."
            : "The recipient is not approved as a pharmacy in DistributorModule."
        );
        return;
      }

      setHandoffMessage("Please confirm the handoff transaction in MetaMask...");
      const tx = handoffType === "distributor"
        ? await distributor.handoffToDistributor(handoffMedicineId.trim(), recipient, handoffNote.trim())
        : await distributor.handoffToPharmacy(handoffMedicineId.trim(), recipient, handoffNote.trim());

      setHandoffMessage(`Transaction submitted: ${tx.hash}. Waiting for confirmation...`);
      await tx.wait();
      setHandoffHash(tx.hash);
      setHandoffMessage(`Medicine handoff recorded successfully. Sender: ${senderAddress}`);
      setHandoffMedicineId("");
      setHandoffRecipient("");
      setHandoffNote("");
    } catch (err: any) {
      console.error("Distributor handoff failed:", err);
      setHandoffMessage(
        err?.shortMessage || err?.reason || err?.info?.error?.message || err?.message ||
        "Handoff failed. Check MetaMask, the local network, and participant approvals."
      );
    } finally {
      setHandoffLoading(false);
    }
  }

  async function runPharmacyAction(action: "receiveMedicine" | "markSold" | "flagRecall") {
    setPharmacyMessage("");
    setPharmacyRecord(null);
    const id = pharmacyMedicineId.trim();
    if (!id) {
      setPharmacyMessage("Enter a medicine ID first.");
      return;
    }
    if (!window.ethereum) {
      setPharmacyMessage("MetaMask is not installed or enabled. Install/unlock MetaMask and try again.");
      return;
    }

    try {
      setPharmacyLoading(true);
      setPharmacyMessage("Connecting to MetaMask...");
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        setPharmacyMessage("No MetaMask account is connected. Connect the pharmacy account and try again.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n) {
        setPharmacyMessage("Switch MetaMask to MediChain Local (Chain ID 31337; RPC http://127.0.0.1:8545).");
        return;
      }

      const signer = await provider.getSigner(accounts[0]);
      const account = await signer.getAddress();
      console.log("Pharmacy action account:", account, "action:", action);

      const pharmacy = new ethers.Contract(PHARMACY_MODULE_ADDRESS, PHARMACY_MODULE_ABI, signer);

      // PharmacyModule has its own allowlist, separate from DistributorModule.
      // receiveMedicine and markSold require an approved pharmacy; flagRecall is owner-only.
      if (action === "flagRecall") {
        const owner = await pharmacy.owner();
        if (account.toLowerCase() !== owner.toLowerCase()) {
          setPharmacyMessage(`Flag Recall is owner-only. Switch MetaMask to PharmacyModule owner: ${owner}`);
          return;
        }
      } else {
        const isApproved = await pharmacy.approvedPharmacies(account);
        if (!isApproved) {
          setPharmacyMessage(`This account (${account}) is not approved in PharmacyModule. The pharmacy must be approved separately in this contract.`);
          return;
        }
      }

      setPharmacyMessage(`Please confirm ${action} in MetaMask...`);
      const tx = await pharmacy[action](id);
      setPharmacyMessage(`Transaction submitted: ${tx.hash}. Waiting for confirmation...`);
      await tx.wait();
      setPharmacyMessage(`${action === "receiveMedicine" ? "Medicine receipt recorded" : action === "markSold" ? "Medicine marked as sold" : "Medicine flagged for recall"} successfully on-chain. Account: ${account}`);
      await loadPharmacyRecord(id);
    } catch (err: any) {
      console.error("Pharmacy action failed:", err);
      const message = err?.shortMessage || err?.reason || err?.info?.error?.message || err?.message;
      setPharmacyMessage(
        message || "Pharmacy action failed. Check MetaMask, the local network, and the contract's permissions. If flagRecall is owner-only, use the contract-owner account for that action."
      );
    } finally {
      setPharmacyLoading(false);
    }
  }

  async function loadPharmacyRecord(idOverride?: string) {
    const id = (idOverride ?? pharmacyMedicineId).trim();
    if (!id) {
      setPharmacyMessage("Enter a medicine ID first.");
      return;
    }
    try {
      setPharmacyLoading(true);
      setPharmacyMessage("");
      const provider = await getProvider();
      const pharmacy = new ethers.Contract(PHARMACY_MODULE_ADDRESS, PHARMACY_MODULE_ABI, provider);
      const record = await pharmacy.getRecord(id);
      const statusValue = Number(record.status ?? record[4]);
      const statusNames = ["Received", "Sold", "Recalled"];
      const receivedAt = record.receivedAt ?? record[2] ?? 0;
      const soldAt = record.soldAt ?? record[3] ?? 0;
      setPharmacyRecord({
        medicineId: record.medicineId ?? record[0] ?? id,
        pharmacy: record.pharmacy ?? record[1] ?? "",
        status: statusNames[statusValue] ?? `Unknown (${statusValue})`,
        updatedAt: soldAt > 0 ? soldAt : receivedAt,
      });
      setPharmacyMessage("Pharmacy record loaded from the blockchain.");
    } catch (err: any) {
      console.error(err);
      setPharmacyRecord(null);
      setPharmacyMessage(err?.shortMessage || err?.reason || err?.info?.error?.message || "Could not load the pharmacy record. Confirm the PharmacyModule getRecord return format and deployment address.");
    } finally {
      setPharmacyLoading(false);
    }
  }

  async function checkAdminAccess() {
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner(LOCAL_ADMIN_SIGNER_INDEX);
      const account = await signer.getAddress();

      const admin = new ethers.Contract(
        ADMIN_MODULE_ADDRESS,
        ADMIN_MODULE_ABI,
        provider
      );
      const owner = await admin.owner();
      const ownerMatch = account.toLowerCase() === owner.toLowerCase();

      setAdminAccount(account);
      setIsAdmin(ownerMatch);
      setAdminMessage(
        ownerMatch
          ? `Connected as contract owner: ${account}`
          : `Account ${account} is not the contract owner.`
      );
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
      setAdminMessage(
        "Could not connect to Hardhat. Confirm that the node is running at http://127.0.0.1:8545 and the contracts are deployed."
      );
    }
  }

  async function manageParticipant(active: boolean) {
    if (!ethers.isAddress(participantAddress.trim())) {
      setAdminMessage("Enter a valid wallet address.");
      return;
    }

    if (Number(participantRole) === 0 && active) {
      setAdminMessage("Choose Manufacturer, Distributor, or Pharmacy.");
      return;
    }

    if (!window.ethereum) {
      setAdminMessage("MetaMask is not installed or enabled.");
      return;
    }

    try {
      setAdminLoading(true);
      setAdminMessage("");
      setParticipantStatus(null);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 31337n) {
        setAdminMessage("Switch MetaMask to MediChain Local (Chain ID 31337).");
        return;
      }

      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      const adminRead = new ethers.Contract(
        ADMIN_MODULE_ADDRESS,
        ADMIN_MODULE_ABI,
        provider
      );
      const owner = await adminRead.owner();

      if (account.toLowerCase() !== owner.toLowerCase()) {
        setAdminMessage(`Wrong MetaMask account. Connect the admin owner account: ${owner}`);
        return;
      }

      const admin = new ethers.Contract(
        ADMIN_MODULE_ADDRESS,
        ADMIN_MODULE_ABI,
        signer
      );

      const tx = await admin.setParticipant(
        participantAddress.trim(),
        Number(participantRole),
        active
      );

      setAdminMessage(`Transaction submitted: ${tx.hash}`);
      await tx.wait();

      setAdminMessage(
        `Participant ${active ? "approved/activated" : "deactivated"} successfully. Transaction: ${tx.hash}`
      );
      await checkParticipant();
    } catch (err: any) {
      console.error("Admin participant update failed:", err);
      setAdminMessage(
        err?.shortMessage ||
          err?.reason ||
          err?.info?.error?.message ||
          err?.message ||
          "Participant transaction failed. Check MetaMask and the browser console."
      );
    } finally {
      setAdminLoading(false);
    }
  }

  async function checkParticipant() {
    if (!ethers.isAddress(participantAddress.trim())) {
      setAdminMessage("Enter a valid wallet address.");
      return;
    }

    try {
      setAdminLoading(true);
      const provider = await getProvider();
      const admin = new ethers.Contract(
        ADMIN_MODULE_ADDRESS,
        ADMIN_MODULE_ABI,
        provider
      );

      const participant = await admin.participants(participantAddress.trim());
      const roleNames = ["None", "Manufacturer", "Distributor", "Pharmacy"];

      setParticipantStatus({
        role: roleNames[Number(participant.role)] ?? "Unknown",
        active: Boolean(participant.active),
      });
      setAdminMessage("Participant status read from the blockchain.");
    } catch (err) {
      console.error(err);
      setAdminMessage("Could not read participant status from the blockchain.");
    } finally {
      setAdminLoading(false);
    }
  }

  async function submitSuspiciousReport() {
    if (!reportMedicineId.trim() || !reportReason.trim()) {
      setReportsMessage("Enter both a medicine ID and a reason.");
      return;
    }

    try {
      setReportsLoading(true);
      setReportsMessage("");
      const provider = await getProvider();
      // Demo reporter: local Hardhat account 1. Reports are open to any account
      // in the contract, so this does not require the admin signer.
      const signer = await provider.getSigner(LOCAL_MANUFACTURER_SIGNER_INDEX);
      const admin = new ethers.Contract(
        ADMIN_MODULE_ADDRESS,
        ADMIN_MODULE_ABI,
        signer
      );

      const tx = await admin.reportSuspiciousMedicine(
        reportMedicineId.trim(),
        reportReason.trim()
      );
      setReportsMessage(`Report submitted: ${tx.hash}`);
      await tx.wait();
      setReportsMessage(`Suspicious medicine report saved on-chain. Transaction: ${tx.hash}`);
      setReportMedicineId("");
      setReportReason("");
      await loadReports();
    } catch (err: any) {
      console.error(err);
      setReportsMessage(
        err?.shortMessage ||
          err?.reason ||
          err?.info?.error?.message ||
          "Could not submit the report."
      );
    } finally {
      setReportsLoading(false);
    }
  }

  async function loadReports() {
    try {
      setReportsLoading(true);
      setReportsMessage("");
      const provider = await getProvider();
      const admin = new ethers.Contract(
        ADMIN_MODULE_ADDRESS,
        ADMIN_MODULE_ABI,
        provider
      );

      const count = Number(await admin.getReportCount());
      const loaded: any[] = [];

      for (let i = 0; i < count; i++) {
        const report = await admin.getReport(i);
        loaded.push({
          id: i,
          medicineId: report.medicineId,
          reporter: report.reporter,
          reason: report.reason,
          timestamp: Number(report.timestamp),
          reviewed: Boolean(report.reviewed),
        });
      }

      setReports(loaded.reverse());
      setReportsMessage(`Loaded ${loaded.length} report(s) from the blockchain.`);
    } catch (err) {
      console.error(err);
      setReportsMessage("Could not load reports. Check the local blockchain connection.");
    } finally {
      setReportsLoading(false);
    }
  }

  async function reviewReport(reportId: number) {
    try {
      setReportsLoading(true);
      setReportsMessage("");
      const provider = await getProvider();
      const signer = await provider.getSigner(LOCAL_ADMIN_SIGNER_INDEX);
      const admin = new ethers.Contract(
        ADMIN_MODULE_ADDRESS,
        ADMIN_MODULE_ABI,
        signer
      );

      const tx = await admin.reviewReport(reportId);
      setReportsMessage(`Review transaction submitted: ${tx.hash}`);
      await tx.wait();
      setReportsMessage(`Report #${reportId} marked as reviewed.`);
      await loadReports();
    } catch (err: any) {
      console.error(err);
      setReportsMessage(
        err?.shortMessage ||
          err?.reason ||
          err?.info?.error?.message ||
          "Could not review report. Only the contract owner can review reports."
      );
    } finally {
      setReportsLoading(false);
    }
  }

  const newModules = {
    admin: {
      icon: "🛡️",
      title: "Admin Dashboard",
      description: "Manage participant approvals and suspicious medicine reports.",
    },
    distributor: {
      icon: "🚚",
      title: "Distributor Dashboard",
      description: "Manage medicine transfers and track supply-chain handoffs.",
    },
    pharmacy: {
      icon: "💊",
      title: "Pharmacy Dashboard",
      description: "Manage medicine receipts and pharmacy sales.",
    },
  };

  return (
    <div className="app">
      {role === "home" && (
        <div className="role-screen">
          <div className="role-content">
            <div className="badge">🔗 Blockchain-Powered Healthcare</div>
            <h1>Welcome to <span>MediChain</span></h1>
            <p>Verify and authenticate medicines using blockchain technology.</p>
            <h2>Choose how you want to continue</h2>

            <div className="role-cards">
              <button className="role-card" onClick={() => setRole("manufacturer")}>
                <div className="role-icon">🏭</div>
                <h3>Manufacturer</h3>
                <p>Register medicines and add verified medicine records to the blockchain.</p>
                <span>Register Medicine →</span>
              </button>

              <button className="role-card" onClick={() => setRole("customer")}>
                <div className="role-icon">💊</div>
                <h3>Customer</h3>
                <p>Scan a medicine QR code and verify its authenticity.</p>
                <span>Verify Medicine →</span>
              </button>

              <button className="role-card" onClick={() => setRole("admin")}>
                <div className="role-icon">🛡️</div>
                <h3>Admin</h3>
                <p>Manage participant approvals and oversee the medicine network.</p>
                <span>Admin Dashboard →</span>
              </button>

              <button className="role-card" onClick={() => setRole("distributor")}>
                <div className="role-icon">🚚</div>
                <h3>Distributor</h3>
                <p>Manage medicine transfers and track supply-chain handoffs.</p>
                <span>Distributor Dashboard →</span>
              </button>

              <button className="role-card" onClick={() => setRole("pharmacy")}>
                <div className="role-icon">💊</div>
                <h3>Pharmacy</h3>
                <p>Manage medicine receipts and pharmacy sales.</p>
                <span>Pharmacy Dashboard →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="logo"><span className="logo-icon">✚</span> MediChain</div>
        <div className="nav-links">
          <span onClick={() => setRole("home")}>Home</span>
          <span onClick={() => setRole("customer")}>Verify Medicine</span>
          <span>About</span>
        </div>
      </nav>

      {role === "customer" && (
        <>
          <button className="back-btn" onClick={() => setRole("home")}>← Change Role</button>
          <main className="hero">
            <div className="hero-text">
              <div className="badge">🔗 Blockchain-Powered Healthcare</div>
              <h1>Verify your medicine.<br /><span>Trust what you take.</span></h1>
              <p>
                Authenticate medicines using blockchain technology.
                Enter a medicine's unique ID to verify its authenticity.
              </p>
              <div className="actions">
                <button className="primary-btn" onClick={() => {
                  document.getElementById("qr-reader")?.scrollIntoView({ behavior: "smooth" });
                }}>📷 Scan QR Code</button>
                <button className="secondary-btn" onClick={verifyMedicine}>Verify Medicine →</button>
              </div>
              <div className="trust">
                <div><strong>🔒 Blockchain</strong><span>Tamper-resistant records</span></div>
                <div><strong>✓ Instant</strong><span>Quick verification</span></div>
              </div>
            </div>

            <div className="verification-card">
              <div className="card-header"><span>Medicine Verification</span><span className="status-dot">●</span></div>
              <div className="qr-placeholder">
                <div id="qr-reader"></div>
                <p>Scan Medicine QR</p>
                <small>Point your camera at the medicine QR code</small>
              </div>
              <div className="divider"><span>OR</span></div>
              <label>Medicine ID</label>
              <div className="input-row">
                <input value={medicineId} onChange={e => setMedicineId(e.target.value)} placeholder="e.g. MED001" />
                <button onClick={verifyMedicine}>{loading ? "..." : "Verify"}</button>
              </div>

              {error && <div className="error-message">⚠️ {error}</div>}

              {result?.genuine && (
                <div className="result-card genuine">
                  <div className="result-title">✓ GENUINE MEDICINE</div>
                  <div className="medicine-details">
                    <p><strong>Medicine:</strong> {result.name}</p>
                    <p><strong>Batch:</strong> {result.batch}</p>
                    <p><strong>Manufacturer:</strong> {result.manufacturer}</p>
                    <p><strong>Manufactured:</strong> {result.manufacturingDate}</p>
                    <p><strong>Expires:</strong> {result.expiryDate}</p>
                  </div>
                  <div className="blockchain-badge">🔗 Verified on Blockchain</div>
                </div>
              )}

              {result?.genuine === false && (
                <div className="result-card fake">
                  <div className="result-title">⚠️ MEDICINE NOT VERIFIED</div>
                  <p>This medicine ID is not registered in the blockchain.</p>
                  <strong>Possible counterfeit / unregistered medicine</strong>
                </div>
              )}
              <div className="secure-note">🔐 Verification is performed against the blockchain registry.</div>
            </div>
          </main>
        </>
      )}

      {role === "manufacturer" && (
        <>
          <button className="back-btn" onClick={() => setRole("home")}>← Change Role</button>
          <section className="registration-section">
            <div className="registration-card">
              <div className="registration-header">
                <div>
                  <span className="section-badge">MANUFACTURER PORTAL</span>
                  <h2>Register a Medicine</h2>
                  <p>Add a new medicine record to the blockchain registry.</p>
                </div>
              </div>
              <div className="registration-grid">
                <div><label>Medicine ID</label><input value={medicineId} onChange={e => setMedicineId(e.target.value)} placeholder="e.g. MED002" /></div>
                <div><label>Medicine Name</label><input value={medicineName} onChange={e => setMedicineName(e.target.value)} placeholder="e.g. Crocin 500" /></div>
                <div><label>Batch Number</label><input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="e.g. CRO2026B" /></div>
                <div><label>Manufacturer</label><input value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="e.g. XYZ Pharma" /></div>
                <div><label>Manufacturing Date</label><input value={manufacturingDate} onChange={e => setManufacturingDate(e.target.value)} placeholder="DD/MM/YYYY" /></div>
                <div><label>Expiry Date</label><input value={expiryDate} onChange={e => setExpiryDate(e.target.value)} placeholder="DD/MM/YYYY" /></div>
              </div>
              <button className="register-btn" onClick={registerMedicine}>Register Medicine on Blockchain →</button>

              {registeredQrValue && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <h3>Medicine QR Code</h3>
                  <p>Medicine ID: {registeredQrValue}</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(registeredQrValue)}`}
                    alt="Medicine QR Code"
                    width="220"
                    height="220"
                  />
                  <br />
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(registeredQrValue)}`}
                    download={`${registeredQrValue}-QR.png`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button type="button">Download QR Code</button>
                  </a>
                </div>
              )}

              <p className="secure-note">Connect MetaMask on MediChain Local to sign medicine registration transactions.</p>
            </div>
          </section>
        </>
      )}

      {role === "admin" && (
        <>
          <button className="back-btn" onClick={() => setRole("home")}>← Back to Home</button>
          <section className="registration-section">
            <div className="registration-card">
              <div className="registration-header">
                <div>
                  <span className="section-badge">ADMIN DASHBOARD</span>
                  <h2>🛡️ Participant Management</h2>
                  <p>Approve, deactivate, and inspect participants through AdminModule on the local blockchain.</p>
                </div>
              </div>

              <p><strong>Contract owner:</strong> {adminAccount || "Checking..."}</p>
              <p>{isAdmin ? "✅ Admin owner access confirmed" : "⚠️ Admin owner access not confirmed"}</p>
              <button className="secondary-btn" onClick={checkAdminAccess}>Recheck Admin Connection</button>

              <hr />
              <h3>Approve or deactivate participant</h3>
              <div className="registration-grid">
                <div>
                  <label>Participant wallet address</label>
                  <input
                    value={participantAddress}
                    onChange={e => setParticipantAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label>Participant role</label>
                  <select value={participantRole} onChange={e => setParticipantRole(e.target.value)}>
                    <option value="1">Manufacturer</option>
                    <option value="2">Distributor</option>
                    <option value="3">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div className="actions">
                <button className="register-btn" disabled={!isAdmin || adminLoading} onClick={() => manageParticipant(true)}>
                  {adminLoading ? "Processing..." : "Approve / Activate"}
                </button>
                <button className="secondary-btn" disabled={!isAdmin || adminLoading} onClick={() => manageParticipant(false)}>
                  Deactivate Participant
                </button>
                <button className="secondary-btn" disabled={adminLoading} onClick={checkParticipant}>
                  Check Status
                </button>
              </div>

              {participantStatus && (
                <div className="result-card genuine">
                  <h3>Participant Status</h3>
                  <p><strong>Address:</strong> {participantAddress}</p>
                  <p><strong>Role:</strong> {participantStatus.role}</p>
                  <p><strong>Active:</strong> {participantStatus.active ? "Yes" : "No"}</p>
                </div>
              )}
              {adminMessage && <p role="status" className="secure-note">{adminMessage}</p>}

              <hr />
              <h2>🚨 Suspicious Medicine Reports</h2>
              <p>Reports are written on-chain. The contract owner can mark reports as reviewed.</p>
              <div className="registration-grid">
                <div>
                  <label>Medicine ID</label>
                  <input value={reportMedicineId} onChange={e => setReportMedicineId(e.target.value)} placeholder="e.g. MED999" />
                </div>
                <div>
                  <label>Reason for report</label>
                  <input value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Describe the concern" />
                </div>
              </div>
              <div className="actions">
                <button className="register-btn" disabled={reportsLoading} onClick={submitSuspiciousReport}>
                  {reportsLoading ? "Processing..." : "Submit Suspicious Medicine Report"}
                </button>
                <button className="secondary-btn" disabled={reportsLoading} onClick={loadReports}>
                  Load Reports
                </button>
              </div>
              {reportsMessage && <p role="status" className="secure-note">{reportsMessage}</p>}

              {reports.length > 0 && (
                <div>
                  <h3>Reports ({reports.length})</h3>
                  {reports.map(report => (
                    <div className="result-card" key={report.id}>
                      <h4>Report #{report.id} — {report.medicineId}</h4>
                      <p><strong>Reason:</strong> {report.reason}</p>
                      <p><strong>Reporter:</strong> {report.reporter}</p>
                      <p><strong>Submitted:</strong> {new Date(report.timestamp * 1000).toLocaleString()}</p>
                      <p><strong>Status:</strong> {report.reviewed ? "Reviewed" : "Pending review"}</p>
                      {!report.reviewed && (
                        <button
                          className="secondary-btn"
                          disabled={!isAdmin || reportsLoading}
                          onClick={() => reviewReport(report.id)}
                        >
                          Mark Reviewed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {role === "distributor" && (
        <>
          <button className="back-btn" onClick={() => setRole("home")}>← Back to Home</button>
          <section className="registration-section">
            <div className="registration-card">
              <div className="registration-header">
                <div>
                  <span className="section-badge">DISTRIBUTOR PORTAL</span>
                  <h2>🚚 Medicine Handoff</h2>
                  <p>Record medicine transfers to another distributor or an approved pharmacy.</p>
                </div>
              </div>

              <div className="registration-grid">
                <div>
                  <label>Medicine ID</label>
                  <input value={handoffMedicineId} onChange={e => setHandoffMedicineId(e.target.value)} placeholder="e.g. MED002" />
                </div>
                <div>
                  <label>Transfer To</label>
                  <select value={handoffType} onChange={e => setHandoffType(e.target.value as "distributor" | "pharmacy")}>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="distributor">Another Distributor</option>
                  </select>
                </div>
                <div>
                  <label>Recipient Wallet Address</label>
                  <input value={handoffRecipient} onChange={e => setHandoffRecipient(e.target.value)} placeholder="0x..." />
                </div>
                <div>
                  <label>Transfer Note</label>
                  <input value={handoffNote} onChange={e => setHandoffNote(e.target.value)} placeholder="e.g. Batch delivered to pharmacy" />
                </div>
              </div>

              <button className="register-btn" disabled={handoffLoading} onClick={submitHandoff}>
                {handoffLoading ? "Processing Transaction..." : "Record Medicine Handoff →"}
              </button>
              {handoffMessage && <p role="status" className="secure-note" style={{ overflowWrap: "anywhere" }}>{handoffMessage}</p>}
              {handoffHash && <div className="result-card"><strong>Transaction Hash</strong><p style={{ overflowWrap: "anywhere" }}>{handoffHash}</p></div>}
              <p className="secure-note">Connect MetaMask to MediChain Local (Chain ID 31337). The selected MetaMask account is the sender and must be approved in DistributorModule. The recipient must also be approved for the selected transfer type; AdminModule approval alone is not enough.</p>
            </div>
          </section>
        </>
      )}

      {role === "pharmacy" && (
        <>
          <button className="back-btn" onClick={() => setRole("home")}>← Back to Home</button>
          <section className="registration-section">
            <div className="registration-card">
              <div className="registration-header">
                <div>
                  <span className="section-badge">PHARMACY PORTAL</span>
                  <h2>💊 Pharmacy Inventory</h2>
                  <p>Record medicine receipt, sale, recall, and inspect the on-chain pharmacy record.</p>
                </div>
              </div>

              <div className="registration-grid">
                <div>
                  <label>Medicine ID</label>
                  <input value={pharmacyMedicineId} onChange={e => setPharmacyMedicineId(e.target.value)} placeholder="e.g. MED002" />
                </div>
              </div>

              <div className="actions" style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "18px" }}>
                <button className="register-btn" disabled={pharmacyLoading} onClick={() => runPharmacyAction("receiveMedicine")}>Receive Medicine</button>
                <button className="secondary-btn" disabled={pharmacyLoading} onClick={() => runPharmacyAction("markSold")}>Mark as Sold</button>
                <button className="secondary-btn" disabled={pharmacyLoading} onClick={() => runPharmacyAction("flagRecall")}>Flag Recall</button>
                <button className="secondary-btn" disabled={pharmacyLoading} onClick={() => loadPharmacyRecord()}>Check Record</button>
              </div>

              {pharmacyLoading && <p role="status" className="secure-note">Processing blockchain request...</p>}
              {pharmacyMessage && <p role="status" className="secure-note" style={{ overflowWrap: "anywhere" }}>{pharmacyMessage}</p>}

              {pharmacyRecord && (
                <div className="result-card">
                  <h3>Pharmacy Record</h3>
                  <p><strong>Medicine ID:</strong> {pharmacyRecord.medicineId}</p>
                  <p><strong>Status:</strong> {pharmacyRecord.status}</p>
                  {pharmacyRecord.pharmacy && <p><strong>Receiving pharmacy:</strong> {pharmacyRecord.pharmacy}</p>}
                  <p><strong>Last updated:</strong> {Number(pharmacyRecord.updatedAt) > 0 ? new Date(Number(pharmacyRecord.updatedAt) * 1000).toLocaleString() : "Not available"}</p>
                </div>
              )}

              <p className="secure-note">Connect MetaMask to MediChain Local (Chain ID 31337) and select the approved pharmacy account for Receive Medicine and Mark as Sold. Flag Recall may require the contract-owner account if restricted by PharmacyModule. A distributor handoff does not automatically update this pharmacy record; use Receive Medicine to record receipt separately.</p>
            </div>
          </section>
        </>
      )}

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Easy Verification</h3>
          <p>Verify a medicine using its unique ID or QR code.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⛓️</div>
          <h3>Blockchain Secured</h3>
          <p>Medicine records are stored on a tamper-resistant blockchain.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Counterfeit Detection</h3>
          <p>Identify medicines that are not registered in the blockchain.</p>
        </div>
      </section>
    </div>
  );
}

export default App;
