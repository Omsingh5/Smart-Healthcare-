
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');
const Room = require('./models/room');
const PDFDocument = require("pdfkit");
const Razorpay = require("razorpay");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['https://smarthealth-care.netlify.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  specialization: String,
  age: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  address: String,
  contact: String,
  fee: { type: Number, default: 500 },
  staff: [{ name: String, email: String, contact: String, role: String }],
  offDays: [String],
  outstationDates: [String],
  created_at: { type: Date, default: Date.now }
});

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  contact: String,
  role: { type: String, required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const appointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientAge: String,
  patientContact: String,
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'cancelled', 'completed'] },
  notes: String,
  prescription: String,
  checkedUp: { type: Boolean, default: false },
  skipped: { type: Boolean, default: false },
  otherCharges: { type: Number, default: 0 },
  totalAmount: { type: Number },
  paymentStatus: { type: String, default: 'unpaid', enum: ['unpaid', 'paid', 'partial'] },
  paymentTime: Date,
  razorpayPaymentId: { type: String, default: '' }
});

const recordSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: String,
  prescription: String,
  date: { type: Date, default: Date.now },
  attachments: [String]
});

const bedSchema = new mongoose.Schema({
  number: Number,
  occupied: { type: Boolean, default: false },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, default: "" },           // ✅ Patient Name
  age: { type: Number, default: null },          // ✅ Patient Age
  problem: { type: String, default: "" },        // ✅ Treatment Info
  occupiedAt: { type: Date, default: null }      // ✅ Occupied Timestamp
});


const roomSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  number: Number,
  beds: [bedSchema]
});

const User = mongoose.model('User', userSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const MedicalRecord = mongoose.model('MedicalRecord', recordSchema);

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded.role === 'staff' ?
      await Staff.findById(decoded.id).select('-password') :
      await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ message: 'Invalid Token: User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

const isDoctor = (req, res, next) => {
  if (!req.user?.specialization) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashed, specialization });
    const token = jwt.sign({ id: newUser._id, role: newUser.specialization ? 'doctor' : 'patient' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ message: 'User created successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.specialization ? 'doctor' : 'patient' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const userData = user.toObject();
    delete userData.password;
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user.toObject?.() || req.user;
    if (!user.specialization) {
      delete user.fee;
      delete user.staff;
      delete user.offDays;
      delete user.outstationDates;
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user info', error: err.message });
  }
});

app.get("/api/auth/doctors", async (req, res) => {
  try {
    const doctors = await User.find({ specialization: { $ne: null } }).select("name _id specialization");
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctors", error: err.message });
  }
});

// Appointment Routes
app.post("/appointments", authenticateToken, async (req, res) => {
// also handle /api/appointments

  try {
    if (req.user.specialization) {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    const { doctor_id, date, time, notes } = req.body;

    const appointment = await Appointment.create({
      doctor_id,
      patient_id: req.user._id,
      patientName: req.user.name,
      patientAge: req.user.age || "",
      patientContact: req.user.contact || "",
      date,
      time,
      notes
    });

    const io = req.app.get("io");
    io.emit("appointmentUpdated", appointment);

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ message: "Appointment creation failed", error: err.message });
  }
});


// Alias: /api/appointments -> same as /appointments
app.post("/api/appointments", authenticateToken, async (req, res) => {
  try {
    if (req.user.specialization) {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }
    const { doctor_id, date, time, notes } = req.body;
    const appointment = await Appointment.create({
      doctor_id,
      patient_id: req.user._id,
      patientName: req.user.name,
      patientAge: req.user.age || "",
      patientContact: req.user.contact || "",
      date,
      time,
      notes
    });
    const io = req.app.get("io");
    io.emit("appointmentUpdated", appointment);
    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ message: "Appointment creation failed", error: err.message });
  }
});

app.get("/api/patient/appointments", authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient_id: req.user._id })
      .populate("doctor_id", "name")
      .sort({ date: -1 });

    const formatted = appointments.map((a) => ({
      ...a._doc,
      doctorName: a.doctor_id?.name || "Unknown"
    }));

    res.json({ appointments: formatted });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
});

app.put("/api/doctor/appointments/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    // Emit to frontend via socket.io
    const io = req.app.get("io");
    io.emit("appointmentUpdated", updated); // 🔁 emit update

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update appointment" });
  }
});


app.get("/api/doctor/appointments", authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor_id: req.user._id })
      .populate("patient_id", "name age contact")
      .sort({ date: -1 });
    // Enrich with doctor fee for billing
    const formatted = appointments.map(a => ({
      ...a._doc,
      doctorFee: req.user.fee || 500,
      patientAge: a.patientAge || a.patient_id?.age || "",
      patientContact: a.patientContact || a.patient_id?.contact || "",
    }));
    res.json({ appointments: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

app.put("/api/doctor/appointments/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment' });
  }
});

// Room Routes
app.post("/api/rooms", authenticateToken, isDoctor, async (req, res) => {
  try {
    const { roomCount } = req.body;
    if (!roomCount || roomCount < 1) {
      return res.status(400).json({ message: "Invalid room count" });
    }

    // ✅ Delete previous rooms for this doctor
    await Room.deleteMany({ doctor_id: req.user._id });

    const rooms = [];
    for (let i = 1; i <= roomCount; i++) {
      const room = await Room.create({
        doctor_id: req.user._id,
        number: i,
        beds: [],
      });
      rooms.push(room);
    }

    res.status(201).json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ message: "Failed to create rooms", error: err.message });
  }
});


app.put("/api/rooms/:roomId/beds", authenticateToken, isDoctor, async (req, res) => {
  try {
    const { bedCount } = req.body;
    const room = await Room.findById(req.params.roomId);
    if (!room || !bedCount || bedCount < 1) return res.status(400).json({ message: "Invalid room/bed count" });

    room.beds = Array.from({ length: bedCount }, (_, i) => ({ number: i + 1, occupied: false }));
    await room.save();
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ message: "Failed to add beds", error: err.message });
  }
});

// ✅ GET /api/rooms - Get rooms for the logged-in doctor
app.get("/api/rooms", authenticateToken, isDoctor, async (req, res) => {
  try {
    const rooms = await Room.find({ doctor_id: req.user._id });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms", error: err.message });
  }
});


// GET /api/rooms/doctor/:doctorId - Patient views a specific doctor's rooms/beds
app.get("/api/rooms/doctor/:doctorId", authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({ doctor_id: req.params.doctorId }).select("number beds");
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctor rooms", error: err.message });
  }
});

// ✅ GET /api/rooms/public - All users can view public room/bed info (doctor_id hidden)
app.get("/api/rooms/public", authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find().select("number beds");
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ message: "Public room fetch failed", error: err.message });
  }
});

// ✅ PUT /api/rooms/:roomId/beds/:bedIndex - Toggle bed occupied status (doctor only)
app.put("/api/rooms/:roomId/beds/:bedIndex", authenticateToken, isDoctor, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    const bedIndex = parseInt(req.params.bedIndex);
    const { name, age, problem, occupied, occupiedAt } = req.body;

    if (!room || bedIndex >= room.beds.length) {
      return res.status(400).json({ message: "Invalid room or bed index" });
    }

    const bed = room.beds[bedIndex];

    // Toggle or set explicitly
    bed.occupied = occupied !== undefined ? occupied : !bed.occupied;

    if (bed.occupied) {
      bed.name = name;
      bed.age = age;
      bed.problem = problem;
      bed.occupiedAt = occupiedAt || new Date();
    } else {
      bed.name = "";
      bed.age = null;
      bed.problem = "";
      bed.occupiedAt = null;
    }

    await room.save();
    res.json({ success: true, updatedBed: bed });
  } catch (err) {
    res.status(500).json({ message: "Failed to update bed", error: err.message });
  }
});


app.put("/api/doctor/appointments/:id/checked-up", authenticateToken, isDoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const doctor = await User.findById(appointment.doctor_id);
    const total = (doctor.fee || 500) + (req.body.otherCharges || 0);

    appointment.checkedUp = true;
    appointment.otherCharges = req.body.otherCharges || 0;
    appointment.totalAmount = total;
    appointment.paymentStatus = 'unpaid';
    appointment.paymentTime = new Date();

    await appointment.save();

    // TRIGGER THIS: This tells the frontend to update the list immediately
    const io = req.app.get('io');
    io.emit("appointmentUpdated", appointment); 

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ message: "Check-up update failed", error: err.message });
  }
});

app.put("/api/doctor/appointments/:id/skip", authenticateToken, isDoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { skipped: true }, { new: true });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ message: "Skip failed", error: err.message });
  }
});

app.get("/api/invoice-data/:id", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor_id", "name specialization fee")
      .populate("patient_id", "name age contact");

    if (!appointment) return res.status(404).send("Appointment not found");

    res.json(appointment);
  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).send("Failed to fetch data");
  }
});



app.post("/api/payment/create-order", authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    if (!appointment.totalAmount || appointment.totalAmount <= 0) {
      return res.status(400).json({ message: "No bill generated yet. Doctor must mark checked-up first." });
    }

    const options = {
      amount: Math.round(appointment.totalAmount * 100), // ₹ to paise, must be integer
      currency: "INR",
      receipt: `rcpt_${appointment._id.toString().slice(-8)}`,
      notes: {
        appointmentId: appointment._id.toString(),
        patientName: appointment.patientName,
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      appointmentId: appointment._id,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ message: "Payment order creation failed", error: err.message });
  }
});

// Update payment status when payment is successful
app.put("/api/patient/payment-success/:id", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.paymentStatus === "paid") {
      return res.json({ success: true, message: "Already marked as paid" });
    }

    appointment.paymentStatus = "paid";
    appointment.paymentTime = new Date();
    if (req.body.paymentId) appointment.razorpayPaymentId = req.body.paymentId;

    await appointment.save();

    // Emit real-time update to all connected clients
    const io = req.app.get("io");
    io.emit("paymentUpdated", appointment);

    res.json({ success: true, message: "Payment confirmed", appointment });
  } catch (err) {
    console.error("Payment success update error:", err);
    res.status(500).json({ message: "Payment status update failed", error: err.message });
  }
});



app.put('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;

    const model = req.user.specialization ? User : User; // You can split later for patient if needed

    const updatedUser = await model.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select('-password');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update profile failed:", err);
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
});



// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true }
});

io.on('connection', (socket) => {
  console.log('🧠 New client connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ Client disconnected:', socket.id));
});

app.set('io', io);
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
