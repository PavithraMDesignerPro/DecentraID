import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
const app = express();
app.use(cors());
app.use(express.json());


dotenv.config();

// ✅ MongoDB Connection
mongoose
  .connect("mongodb+srv://forprojectwork001:projectwork001@faceverification.oixunpt.mongodb.net/faceVerification")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ Schema
const UserSchema = new mongoose.Schema({
  name: String,
  descriptor: [Number],
});

const User = mongoose.model("User", UserSchema);

app.get("/", (req, res) => {
  res.send("Face Auth Backend Running Successfully");
});


// ✅ Register API
app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ msg: "Registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Register Error" });
  }
});

// ✅ Login API
app.post("/login", async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor) {
      return res.status(400).json({ msg: "Descriptor missing" });
    }

    const users = await User.find();

    for (let user of users) {
      if (!user.descriptor) continue;

      const dist = euclidean(user.descriptor, descriptor);

      if (dist < 0.7) {
        return res.json({ msg: "Login Success: " + user.name });
      }
    }

    res.json({ msg: "Face Not Matched" });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});


// Distance function
function euclidean(d1, d2) {
  return Math.sqrt(
    d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0)
  );
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

