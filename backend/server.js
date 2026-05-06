const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/studentdb";

mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

const teacherSchema = new mongoose.Schema({ name: String, subject: String });
const Teacher = mongoose.model("Teacher", teacherSchema);

const courseSchema = new mongoose.Schema({ title: String, code: String });
const Course = mongoose.model("Course", courseSchema);

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});
const Student = mongoose.model("Student", studentSchema);

app.get("/teachers", async (req, res) => res.json(await Teacher.find()));
app.post("/teachers", async (req, res) => res.json(await Teacher.create(req.body)));
app.put("/teachers/:id", async (req, res) => res.json(await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete("/teachers/:id", async (req, res) => { await Teacher.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); });

app.get("/courses", async (req, res) => res.json(await Course.find()));
app.post("/courses", async (req, res) => res.json(await Course.create(req.body)));
app.put("/courses/:id", async (req, res) => res.json(await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete("/courses/:id", async (req, res) => { await Course.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); });

app.get("/students", async (req, res) => res.json(await Student.find().populate("teacher").populate("courses")));
app.post("/students", async (req, res) => res.json(await Student.create(req.body)));
app.put("/students/:id", async (req, res) => res.json(await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete("/students/:id", async (req, res) => { await Student.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); });

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));