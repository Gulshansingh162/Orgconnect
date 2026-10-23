
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Employee signup
router.post("/signup/employee", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      company,
      designation,
      experience,
    } = req.body;

    if (!fullName?.trim() || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (!validEmail.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (
      experience !== undefined &&
      (!Number.isFinite(experience) || experience < 0)
    ) {
      return res.status(400).json({
        message: "Experience must be a non-negative number.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const employee = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "employee",
      company,
      designation,
      experience,
    });

    return res.status(201).json({
      message: "Employee registered successfully.",
      user: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error("Employee signup error:", error);
    return res.status(500).json({
      message: "Unable to register employee.",
    });
  }
});

// Student signup
router.post("/signup/student", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      college,
      course,
      graduationYear,
    } = req.body;

    if (!fullName?.trim() || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (!validEmail.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (
      graduationYear !== undefined &&
      (!Number.isInteger(graduationYear) ||
        graduationYear < 2000 ||
        graduationYear > 2100)
    ) {
      return res.status(400).json({
        message: "Enter a valid graduation year.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      college,
      course,
      graduationYear,
    });

    return res.status(201).json({
      message: "Student registered successfully.",
      user: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error("Student signup error:", error);
    return res.status(500).json({
      message: "Unable to register student.",
    });
  }
});

// Login for employees and students
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required.",
      });
    }

    if (!["employee", "student"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account role.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role,
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email, password or role.",
      });
    }

    // Add a secure session or signed-token mechanism
    // before using this endpoint in production.
    return res.json({
      message: "Login credentials verified.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

module.exports = router;
