import express from "express";
import path from "path";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const PORT = 3000;

// Increased limit for base64 images upload (< 1.5MB)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

let dbMode: "database" | "memory" = "memory";
let dbConnected = false;
let dbInstance: any = null;
let dbNameStr = "";
let dbError: string | null = null;
let mongoClient: MongoClient | null = null;

// Clean demo contacts stored in memory mode
let memoryContacts: any[] = [
  {
    _id: "664ac7a0e28f731131c15f11",
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah.jenkins@nexustech.io",
    phone: "+1 (555) 234-5678",
    title: "Lead Solutions Architect",
    organization: "Nexus Tech Solutions",
    website: "https://nexustech.io",
    address: "100 Pine Street, San Francisco, CA 94111",
    avatar: "",
    socials: {
      linkedin: "https://linkedin.com/in/sarahjenkins-nexus",
      twitter: "https://twitter.com/s_jenkins_tech",
      github: "https://github.com/sarah-j-nexus",
      instagram: ""
    },
    createdAt: "2026-05-19T10:00:00.000Z"
  },
  {
    _id: "664ac7a0e28f731131c15f22",
    firstName: "Marcus",
    lastName: "Vance",
    email: "marcus.vance@vanguardcap.com",
    phone: "+1 (555) 987-6543",
    title: "Managing Director",
    organization: "Vanguard Capital",
    website: "https://vanguardcap.com",
    address: "55 Park Avenue, New York, NY 10022",
    avatar: "",
    socials: {
      linkedin: "https://linkedin.com/in/marcusvance",
      twitter: "https://twitter.com/marcus_vance",
      github: "",
      instagram: ""
    },
    createdAt: "2026-05-18T14:30:00.000Z"
  },
  {
    _id: "664ac7a0e28f731131c15f33",
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena.rostova@designhaus.co",
    phone: "+49 30 123456",
    title: "Principal Brand Designer",
    organization: "DesignHaus Berlin",
    website: "https://designhaus.co",
    address: "Rosenthaler Str. 40-41, 10178 Berlin, Germany",
    avatar: "",
    socials: {
      linkedin: "https://linkedin.com/in/elenarostova",
      twitter: "",
      github: "https://github.com/elena-rostova",
      instagram: "https://instagram.com/elena_draws"
    },
    createdAt: "2026-05-17T09:15:00.000Z"
  }
];

// Helper to check MongoDB connection status and run connection safely
async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    dbMode = "memory";
    dbConnected = false;
    dbError = "MONGODB_URI environment variable is missing in system settings.";
    console.log("⚠️ MONGODB_URI not provided. Starting in-memory DEMO mode.");
    return;
  }

  try {
    console.log("🔌 Connecting to MongoDB Database Server...");
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
    });
    await mongoClient.connect();
    dbInstance = mongoClient.db();
    dbNameStr = dbInstance.databaseName;
    dbMode = "database";
    dbConnected = true;
    dbError = null;
    console.log(`✅ MongoDB Connected database: "${dbNameStr}"`);

    // Ensure initial seeding
    const coll = dbInstance.collection("contacts");
    const count = await coll.countDocuments();
    if (count === 0) {
      console.log("💾 Database is empty. Seeding initial contact records...");
      const seeded = memoryContacts.map(c => ({
        ...c,
        _id: new ObjectId(c._id),
        createdAt: new Date(c.createdAt)
      }));
      await coll.insertMany(seeded);
    }
  } catch (err: any) {
    dbMode = "memory";
    dbConnected = false;
    dbError = err.message || "Failed to establish database server connection";
    console.error("❌ MongoDB Connection Failure:", dbError);
    console.log("🔄 Gracefully routing requests to system memory.");
  }
}

let dbConnectionPromise: Promise<void> | null = null;

function ensureMongoConnected(): Promise<void> {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectToMongo();
  }
  return dbConnectionPromise;
}

// Spark database routine
ensureMongoConnected();

// Helper to access MongoDB collection safely
function getContactsCol() {
  if (dbMode === "database" && dbConnected && dbInstance) {
    return dbInstance.collection("contacts");
  }
  return null;
}

// API Routes

// Connection health and check middleware for all API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    try {
      await ensureMongoConnected();
    } catch (e) {
      console.error("Middleware MongoDB connection error status:", e);
    }
  }
  next();
});

// 1. Get DB / System configuration info
app.get("/api/config", (req, res) => {
  res.json({
    configured: !!process.env.MONGODB_URI,
    mode: dbMode,
    connected: dbConnected,
    dbName: dbNameStr || "In-Memory Storage",
    error: dbError
  });
});

// 2. Fetch all contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const col = getContactsCol();
    if (col) {
      const results = await col.find({}).sort({ createdAt: -1 }).toArray();
      res.json(results);
    } else {
      // Memory fallback sorted by newest
      const sorted = [...memoryContacts].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      res.json(sorted);
    }
  } catch (err: any) {
    console.error("GET /api/contacts error:", err);
    res.status(500).json({ error: "Failed to fetch contacts: " + err.message });
  }
});

// 3. Search or retrieve single contact card
app.get("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid contact ID format." });
  }

  try {
    const col = getContactsCol();
    if (col) {
      const contact = await col.findOne({ _id: new ObjectId(id) });
      if (!contact) {
        return res.status(404).json({ error: "Contact card not found." });
      }
      res.json(contact);
    } else {
      const contact = memoryContacts.find(c => c._id === id);
      if (!contact) {
        return res.status(404).json({ error: "Contact card not found in memory." });
      }
      res.json(contact);
    }
  } catch (err: any) {
    console.error("GET /api/contacts/:id error:", err);
    res.status(500).json({ error: "Failed to fetch contact: " + err.message });
  }
});

// 4. Create single contact card
app.post("/api/contacts", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, title, organization, website, address, avatar, socials } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First and Last Names are required." });
    }

    const newId = new ObjectId().toString();
    const newDoc = {
      firstName,
      lastName,
      email: email || "",
      phone: phone || "",
      title: title || "",
      organization: organization || "",
      website: website || "",
      address: address || "",
      avatar: avatar || "",
      socials: {
        linkedin: socials?.linkedin || "",
        twitter: socials?.twitter || "",
        github: socials?.github || "",
        instagram: socials?.instagram || "",
      },
      createdAt: new Date().toISOString()
    };

    const col = getContactsCol();
    if (col) {
      const mongoDoc = {
        ...newDoc,
        _id: new ObjectId(newId),
        createdAt: new Date()
      };
      await col.insertOne(mongoDoc);
      res.status(201).json({ _id: newId, ...newDoc });
    } else {
      const memoryDoc = {
        _id: newId,
        ...newDoc
      };
      memoryContacts.push(memoryDoc);
      res.status(201).json(memoryDoc);
    }
  } catch (err: any) {
    console.error("POST /api/contacts error:", err);
    res.status(500).json({ error: "Failed to create contact: " + err.message });
  }
});

// 5. Update contact card
app.put("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid contact ID format." });
  }

  try {
    const { firstName, lastName, email, phone, title, organization, website, address, avatar, socials } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First and Last Names are required." });
    }

    const updatedData = {
      firstName,
      lastName,
      email: email || "",
      phone: phone || "",
      title: title || "",
      organization: organization || "",
      website: website || "",
      address: address || "",
      avatar: avatar || "",
      socials: {
        linkedin: socials?.linkedin || "",
        twitter: socials?.twitter || "",
        github: socials?.github || "",
        instagram: socials?.instagram || "",
      }
    };

    const col = getContactsCol();
    if (col) {
      const result = await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Contact card not found." });
      }
      res.json({ _id: id, ...updatedData });
    } else {
      const index = memoryContacts.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Contact card not found in memory." });
      }
      memoryContacts[index] = {
        ...memoryContacts[index],
        ...updatedData
      };
      res.json(memoryContacts[index]);
    }
  } catch (err: any) {
    console.error("PUT /api/contacts/:id error:", err);
    res.status(500).json({ error: "Failed to update contact: " + err.message });
  }
});

// 6. Delete contact card
app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid contact ID format." });
  }

  try {
    const col = getContactsCol();
    if (col) {
      const result = await col.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Contact card not found." });
      }
      res.json({ success: true, message: "Contact deleted successfully." });
    } else {
      const index = memoryContacts.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Contact card not found in memory." });
      }
      memoryContacts.splice(index, 1);
      res.json({ success: true, message: "Contact deleted successfully." });
    }
  } catch (err: any) {
    console.error("DELETE /api/contacts/:id error:", err);
    res.status(500).json({ error: "Failed to delete contact: " + err.message });
  }
});

// Vite & Static file handler integration
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Avoid listening when VERCEL environment is configured
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 CARDNET server booting on http://localhost:${PORT}`);
    });
  }
}

setupViteOrStatic();

export default app;
