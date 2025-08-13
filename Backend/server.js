const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
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

mongoose.connect(
  "mongodb://mongoheydo:dtcaFrR9S9t7ozRS@mongoforheydotech-shard-00-00.5uryy.mongodb.net:27017,mongoforheydotech-shard-00-01.5uryy.mongodb.net:27017,mongoforheydotech-shard-00-02.5uryy.mongodb.net:27017/cost_price_data?authSource=admin&authMechanism=DEFAULT&tls=true&retryWrites=true&appName=Heydo_mongo&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => logEvent("✅ MongoDB Connected"))
.catch(err => logEvent(`❌ MongoDB connection error: ${err}`));

// Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
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
    product_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    updated_data: { type: Object, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const UpdateRequest = mongoose.model('UpdateRequest', updateRequestSchema);

// --- Admin: Create user ---
app.post('/users', async (req, res) => {
    try {
        if (!req.body.name || !req.body.role) {
            logEvent("⚠️ User creation failed: Missing fields");
            return res.status(400).json({ error: "Name and role are required" });
        }
        const user = new User(req.body);
        await user.save();
        logEvent(`👤 User created: ${JSON.stringify(user)}`);
        res.json(user);
    } catch (err) {
        logEvent(`❌ Error creating user: ${err}`);
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
        logEvent(`❌ Error updating role: ${err}`);
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
// --- Updater: Request update ---
app.post('/update-request', async (req, res) => {
    try {
        const { product_id, updated_data } = req.body;

        if (!product_id || !updated_data) {
            logEvent("⚠️ Update request failed: Missing product_id or updated_data");
            return res.status(400).json({ error: "product_id and updated_data are required" });
        }

        // Check if product exists
        const product = await Product.findById(product_id);
        if (!product) {
            logEvent(`⚠️ Update request failed: Product ${product_id} not found`);
            return res.status(404).json({ error: "Product not found" });
        }

        // Check for duplicate pending request
        const existingPending = await UpdateRequest.findOne({ product_id, status: 'pending' });
        if (existingPending) {
            logEvent(`⚠️ Duplicate request blocked for product ${product_id}`);
            return res.status(409).json({ error: "A pending update request already exists for this product" });
        }

        const updateReq = new UpdateRequest({ product_id, updated_data });
        await updateReq.save();

        logEvent(`✏️ Update request created: ${JSON.stringify(updateReq)}`);
        res.json({ message: 'Update request submitted', updateReq });
    } catch (err) {
        logEvent(`❌ Error creating update request: ${err}`);
        res.status(500).json({ error: err.message });
    }
});


// --- Approver: Get all pending updates ---
app.get('/pending-updates', async (req, res) => {
    try {
        const pending = await UpdateRequest.find({ status: 'pending' }).populate('product_id');
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
        const action = req.body.action;
        if (!['approve', 'reject'].includes(action)) {
            logEvent("⚠️ Invalid approve/reject action");
            return res.status(400).json({ error: 'Invalid action' });
        }
        const updateReq = await UpdateRequest.findById(req.params.id);
        if (!updateReq) return res.status(404).json({ error: 'Request not found' });

        if (action === 'approve') {
            await Product.findByIdAndUpdate(updateReq.product_id, updateReq.updated_data);
            updateReq.status = 'approved';
            logEvent(`✅ Update approved: ${updateReq._id}`);
        } else {
            updateReq.status = 'rejected';
            logEvent(`❌ Update rejected: ${updateReq._id}`);
        }
        await updateReq.save();
        res.json({ message: `Request ${updateReq.status}` });
    } catch (err) {
        logEvent(`❌ Error approving/rejecting request: ${err}`);
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => logEvent('🚀 Server running on port 5000'));
