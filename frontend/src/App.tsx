import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ethers } from "ethers";
import "./App.css";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract";

function App() {
  const [role, setRole] = useState<"home" | "manufacturer" | "customer">("home");
  useEffect(() => {
  if (role !== "customer") return;

  console.log("QR SCANNER INITIALIZING");

  const scanner = new Html5QrcodeScanner(
    "qr-reader",
    {
      fps: 10,
      qrbox: { width: 200, height: 200 },
    },
    false
  );

  scanner.render(
    (decodedText) => {
      console.log("QR SCANNED:", decodedText);
      setMedicineId(decodedText);
    },
    () => {}
  );

  return () => {
    scanner.clear().catch(() => {});
  };
}, [role]);

  // rest of your existing code...
  const [medicineId, setMedicineId] = useState("");
  const [medicineName, setMedicineName] = useState("");
const [batchNumber, setBatchNumber] = useState("");
const [manufacturer, setManufacturer] = useState("");
const [manufacturingDate, setManufacturingDate] = useState("");
const [expiryDate, setExpiryDate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const provider = new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );

    const signer = await provider.getSigner(0);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      [
        ...CONTRACT_ABI,
        {
          inputs: [
            { internalType: "string", name: "_id", type: "string" },
            { internalType: "string", name: "_name", type: "string" },
            {
              internalType: "string",
              name: "_batchNumber",
              type: "string",
            },
            {
              internalType: "string",
              name: "_manufacturer",
              type: "string",
            },
            {
              internalType: "string",
              name: "_manufacturingDate",
              type: "string",
            },
            {
              internalType: "string",
              name: "_expiryDate",
              type: "string",
            },
          ],
          name: "addMedicine",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
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

    alert("Medicine registered successfully on blockchain!");

    console.log("Medicine registered:", medicineId);
    console.log("Transaction:", tx.hash);
  } catch (error: any) {
    console.error(error);
    alert(
      error?.reason ||
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

      const provider = new ethers.JsonRpcProvider(
        "http://127.0.0.1:8545"
      );

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const isValid = await contract.verifyMedicine(
        medicineId.trim()
      );

      if (!isValid) {
        setResult({
          genuine: false,
        });
        return;
      }

      const medicine = await contract.getMedicine(
        medicineId.trim()
      );

      setResult({
        genuine: true,
        name: medicine[1],
        batch: medicine[2],
        manufacturer: medicine[3],
        manufacturingDate: medicine[4],
        expiryDate: medicine[5],
      });
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the blockchain. Make sure the local Hardhat node is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
  {role === "home" && (
    <div className="role-screen">
      <div className="role-content">
        <div className="badge">
          🔗 Blockchain-Powered Healthcare
        </div>

        <h1>
          Welcome to <span>MediChain</span>
        </h1>

        <p>
          Verify and authenticate medicines using
          blockchain technology.
        </p>

        <h2>Choose how you want to continue</h2>

        <div className="role-cards">
          <button
            className="role-card"
            onClick={() => setRole("manufacturer")}
          >
            <div className="role-icon">🏭</div>
            <h3>Manufacturer</h3>
            <p>
              Register medicines and add verified
              medicine records to the blockchain.
            </p>
            <span>Register Medicine →</span>
          </button>

          <button
            className="role-card"
            onClick={() => setRole("customer")}
          >
            <div className="role-icon">💊</div>
            <h3>Customer</h3>
            <p>
              Scan a medicine QR code and verify its
              authenticity instantly.
            </p>
            <span>Verify Medicine →</span>
          </button>
        </div>
      </div>
    </div>
  )}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">✚</span>
          MediChain
        </div>

        <div className="nav-links">
          <span className="active">Home</span>
          <span>Verify Medicine</span>
          <span>About</span>
        </div>
      </nav>

      {role === "customer" && (
  <>
    <button
      className="back-btn"
      onClick={() => setRole("home")}
    >
      ← Change Role
    </button>

    <main className="hero">
        <div className="hero-text">
          <div className="badge">
            🔗 Blockchain-Powered Healthcare
          </div>

          <h1>
            Verify your medicine.
            <br />
            <span>Trust what you take.</span>
          </h1>

          <p>
            MediChain helps you authenticate medicines using
            blockchain technology. Enter a medicine's unique ID
            to verify its authenticity.
          </p>

          <div className="actions">
            <button className="primary-btn">
              📷 Scan QR Code
            </button>

            <button
              className="secondary-btn"
              onClick={verifyMedicine}
            >
              Verify Medicine →
            </button>
          </div>

          <div className="trust">
            <div>
              <strong>🔒 Blockchain</strong>
              <span>Tamper-resistant records</span>
            </div>

            <div>
              <strong>✓ Instant</strong>
              <span>Quick verification</span>
            </div>
          </div>
        </div>

        <div className="verification-card">
          <div className="card-header">
            <span>Medicine Verification</span>
            <span className="status-dot">●</span>
          </div>

<div className="qr-placeholder">
  <div id="qr-reader"></div>
  <p>Scan Medicine QR</p>
  <small>
    Point your camera at the medicine QR code
  </small>
</div>
          <div className="divider">
            <span>OR</span>
          </div>

          <label>Medicine ID</label>

          <div className="input-row">
            <input
              type="text"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              placeholder="e.g. MED001"
            />

            <button onClick={verifyMedicine}>
              {loading ? "..." : "Verify"}
            </button>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {result?.genuine && (
            <div className="result-card genuine">
              <div className="result-title">
                ✓ GENUINE MEDICINE
              </div>

              <div className="medicine-details">
                <p>
                  <strong>Medicine:</strong> {result.name}
                </p>

                <p>
                  <strong>Batch:</strong> {result.batch}
                </p>

                <p>
                  <strong>Manufacturer:</strong>{" "}
                  {result.manufacturer}
                </p>

                <p>
                  <strong>Manufactured:</strong>{" "}
                  {result.manufacturingDate}
                </p>

                <p>
                  <strong>Expires:</strong>{" "}
                  {result.expiryDate}
                </p>
              </div>

              <div className="blockchain-badge">
                🔗 Verified on Blockchain
              </div>
            </div>
          )}

          {result?.genuine === false && (
            <div className="result-card fake">
              <div className="result-title">
                ⚠️ MEDICINE NOT VERIFIED
              </div>

              <p>
                This medicine ID is not registered in the
                blockchain.
              </p>

              <strong>Possible counterfeit / unregistered medicine</strong>
            </div>
          )}

          <div className="secure-note">
            🔐 Verification is performed against the
            blockchain registry.
          </div>
        </div>
            </main>
  </>
)}

      {role === "manufacturer" && (
  <>
    <button
      className="back-btn"
      onClick={() => setRole("home")}
    >
      ← Change Role
    </button>

    <section className="registration-section">
        <div className="registration-card">
          <div className="registration-header">
            <div>
              <span className="section-badge">MANUFACTURER PORTAL</span>
              <h2>Register a Medicine</h2>
              <p>
                Add a new medicine record to the blockchain registry.
              </p>
            </div>
          </div>

          <div className="registration-grid">
            <div>
              <label>Medicine ID</label>
              <input
                value={medicineId}
                onChange={(e) => setMedicineId(e.target.value)}
                placeholder="e.g. MED002"
              />
            </div>

            <div>
              <label>Medicine Name</label>
              <input
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Crocin 500"
              />
            </div>

            <div>
              <label>Batch Number</label>
              <input
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. CRO2026B"
              />
            </div>

            <div>
              <label>Manufacturer</label>
              <input
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. XYZ Pharma"
              />
            </div>

            <div>
              <label>Manufacturing Date</label>
              <input
                type="text"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div>
              <label>Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          <button
            className="register-btn"
            onClick={registerMedicine}
          >
            Register Medicine on Blockchain →
          </button>
        </div>
      </section>
  </>
)}

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Easy Verification</h3>
          <p>
            Verify a medicine using its unique ID or QR code.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⛓️</div>
          <h3>Blockchain Secured</h3>
          <p>
            Medicine records are stored on a tamper-resistant
            blockchain.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Counterfeit Detection</h3>
          <p>
            Identify medicines that are not registered in the
            blockchain network.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;