const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const app = express();
app.use(cors())
app.use(express.json());

// Create logs folder if not exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Function to log events
function logEvent(message) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${message}\n`;
    console.log(logMsg.trim());
    fs.appendFileSync(path.join(logsDir, 'server.log'), logMsg);
}

mongoose.connect("mongodb://mongoheydo:dtcaFrR9S9t7ozRS@mongoforheydotech-shard-00-00.5uryy.mongodb.net:27017,mongoforheydotech-shard-00-01.5uryy.mongodb.net:27017,mongoforheydotech-shard-00-02.5uryy.mongodb.net:27017/?authSource=admin&authMechanism=DEFAULT&tls=true&retryWrites=true&appName=Heydo_mongo&w=majority")
  .then(() => logEvent(" MongoDB Connected"))
  .catch(err => logEvent(` MongoDB connection error: ${err}`));

// --- Update User Schema to have password ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true }, 
    role: { type: String, enum: ['admin', 'updater', 'approver'], required: true }
});

const productSchema = new mongoose.Schema({
  Barcode: String,
  "Cost Price (QuickBooks)": Number,
  Fremont: Number,
  "INV date": String,
  "INV number": String,
  "Item Name": String,
  Karthik: Number,
  Milpitas: Number,
  Priority: String,
  SKU: String,
  "Vendor Name": String
}, { collection: 'cost_price' });



const updateRequestSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    updated_data: {
        type: Object,
        required: true,
        validate: {
            validator: function(data) {
                const allowedFields = ["Karthik", "Milpitas", "Fremont"];
                return Object.keys(data).every(key => allowedFields.includes(key));
            },
            message: props => `Only 'Karthik', 'Milpitas', and 'Fremont' can be updated`
        }
    },
    previous_data: { type: Object, default: {} }, // <-- new field to store previous values
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const UpdateRequest = mongoose.model('UpdateRequest', updateRequestSchema);

// --- Admin: Create user ---
// --- Admin: Create user ---
app.post('/users', async (req, res) => {
    try {
        const { name, password, role } = req.body;
        if (!name || !password || !role) {
            logEvent("⚠️ User creation failed: Missing fields");
            return res.status(400).json({ error: "Name, password, and role are required" });
        }

        const user = new User({ name, password, role });
        await user.save();
        logEvent(`👤 User created: ${JSON.stringify({ id: user._id, name: user.name, role: user.role })}`);
        res.json(user);
    } catch (err) {
        logEvent(`Error creating user: ${err}`);
        res.status(500).json({ error: err.message });
    }
});

//
// --- Login Route ---
app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ error: "Name and password are required" });
        }

        const user = await User.findOne({ name, password });
        if (!user) {
            logEvent(`❌ Login failed for: ${name}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        logEvent(`🔓 Login successful for: ${name}`);
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        logEvent(`❌ Login error: ${err}`);
        res.status(500).json({ error: err.message });
    }
});



// --- Admin: Update role ---
app.put('/users/:id', async (req, res) => {
    try {
        if (!req.body.role) {
            logEvent("⚠️ Role update failed: Missing role");
            return res.status(400).json({ error: "Role is required" });
        }
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ error: "User not found" });
        logEvent(`🔄 User role updated: ${JSON.stringify(user)}`);
        res.json(user);
    } catch (err) {
        logEvent(`Error updating role: ${err}`);
        res.status(500).json({ error: err.message });
    }
});

// --- Updater: Get all products ---
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        logEvent(`📦 Fetched ${products.length} products`);
        res.json(products);
    } catch (err) {
        logEvent(`❌ Error fetching products: ${err}`);
        res.status(500).json({ error: err.message });
    }
});

// --- Updater: Request update ---
// --- auth middleware ---
async function authMiddleware(req, res, next) {
  try {
    const userId = req.header("userid"); // temp way to simulate login
    if (!userId) return res.status(401).json({ error: "Missing userid header" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- Updater: Request update ---
app.post("/update-request", authMiddleware, async (req, res) => {
  try {
    const { productId, updated_data } = req.body;

    const allowedFields = ["Karthik", "Milpitas", "Fremont"];
    const invalidFields = Object.keys(updated_data).filter(
      (key) => !allowedFields.includes(key)
    );
    if (invalidFields.length) {
      return res.status(400).json({
        error: `Only ${allowedFields.join(", ")} can be updated`,
      });
    }

    // Fetch the current product to get previous values
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Prepare previous values for allowed fields
    const previous_data = {};
    allowedFields.forEach((field) => {
      previous_data[field] = product[field] ?? null;
    });

    const updateRequest = new UpdateRequest({
      product_id: productId,
      updated_data,
      previous_data,          // <-- new field to track previous values
      updated_by: req.user._id,
      updated_at: new Date(),
      status: "pending"
    });

    await updateRequest.save();
    res.status(201).json({ message: "Update request created" });
  } catch (err) {
    console.error("❌ Error creating update request:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// --- Approver: Get all pending updates ---
app.get('/pending-updates', async (req, res) => {
    try {
        const pending = await UpdateRequest.find({ status: 'pending' }).populate('product_id').populate('updated_by');
        logEvent(`📋 Fetched ${pending.length} pending updates`);
        res.json(pending);
    } catch (err) {
        logEvent(`❌ Error fetching pending updates: ${err}`);
        res.status(500).json({ error: err.message });
    }
});

// --- Approver: Approve or Reject ---

app.put('/approve/:id', async (req, res) => {
  try {
    const action = String(req.body.action || "").toLowerCase();
    if (!['approve', 'reject'].includes(action)) {
      logEvent("⚠️ Invalid approve/reject action");
      return res.status(400).json({ error: 'Invalid action' });
    }

    const updateReq = await UpdateRequest.findById(req.params.id);
    if (!updateReq) return res.status(404).json({ error: 'Request not found' });

    if (action === 'approve') {
      // Fetch current product values
      const product = await Product.findById(updateReq.product_id);

      // Save previous values for the updated fields
      const prevData = {};
      Object.keys(updateReq.updated_data).forEach(field => {
        prevData[field] = product[field];
      });
      updateReq.previous_data = prevData;

      // Update product
      await Product.findByIdAndUpdate(updateReq.product_id, updateReq.updated_data);

      updateReq.status = 'approved';
      logEvent(`✅ Update approved: ${updateReq._id}`);
    } else {
      updateReq.status = 'rejected';
      logEvent(`❌ Update rejected: ${updateReq._id}`);
    }

    await updateReq.save({ validateBeforeSave: false });
    res.json({ message: `Request ${updateReq.status}` });
  } catch (err) {
    logEvent(`❌ Error approving/rejecting request: ${err}`);
    res.status(500).json({ error: err.message });
  }
});




// backend route
app.get('/users/name/:name', async (req, res) => {
  const user = await User.findOne({ name: req.params.name });
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});


app.listen(5001, () => logEvent('🚀 Server running on port 5001'));


