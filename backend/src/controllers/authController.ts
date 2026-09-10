import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { localDB, User, Profile } from "../config/db";
import { generateToken } from "../middleware/auth";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, username, password, confirmPassword } = req.body;

    if (!name || !email || !username || !password) {
      res.status(400).json({ success: false, message: "All fields are required." });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
      return;
    }

    const db = localDB.get();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    const existingEmail = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      res.status(400).json({ success: false, message: "Email is already registered." });
      return;
    }

    const existingUsername = db.users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existingUsername) {
      res.status(400).json({ success: false, message: "Username is already taken." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      email: cleanEmail,
      username: cleanUsername,
      password_hash,
      created_at: now
    };

    const newProfile: Profile = {
      id: uuidv4(),
      user_id: userId,
      name: name.trim(),
      username: cleanUsername,
      age: 28,
      gender: "Not specified",
      height: 175,
      weight: 70,
      fitness_level: "Beginner",
      activity_level: "Moderate",
      fitness_goal: "General Fitness",
      workout_preference: {
        location: "Home",
        availableTime: 30,
        daysPerWeek: 3,
        preferredType: "Full Body",
        equipment: ["Dumbbells", "Mat"]
      },
      food_preference: "Non-Vegetarian",
      allergies: [],
      created_at: now,
      updated_at: now
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    localDB.save();

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username
    });

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newProfile.name
        },
        profile: newProfile
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400).json({ success: false, message: "Please enter your credentials." });
      return;
    }

    const db = localDB.get();
    const cleanInput = emailOrUsername.trim().toLowerCase();

    const user = db.users.find(
      (u) => u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput
    );

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email/username or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email/username or password." });
      return;
    }

    const profile = db.profiles.find((p) => p.user_id === user.id);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    res.json({
      success: true,
      message: "Logged in successfully!",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: profile?.name || user.username
        },
        profile
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;
    const userEmail = (email || "google.user@example.com").toLowerCase();
    const db = localDB.get();

    let user = db.users.find((u) => u.email.toLowerCase() === userEmail);
    let profile = user ? db.profiles.find((p) => p.user_id === user!.id) : null;

    if (!user) {
      const userId = uuidv4();
      const now = new Date().toISOString();
      const username = userEmail.split("@")[0] + "_" + Math.floor(Math.random() * 1000);
      user = {
        id: userId,
        email: userEmail,
        username,
        password_hash: "OAUTH_GOOGLE_SECURE",
        created_at: now
      };
      profile = {
        id: uuidv4(),
        user_id: userId,
        name: name || "Google User",
        username,
        age: 26,
        gender: "Not specified",
        height: 172,
        weight: 68,
        fitness_level: "Beginner",
        activity_level: "Moderate",
        fitness_goal: "General Fitness",
        workout_preference: { location: "Home", availableTime: 30, daysPerWeek: 3 },
        food_preference: "Non-Vegetarian",
        allergies: [],
        created_at: now,
        updated_at: now
      };
      db.users.push(user);
      db.profiles.push(profile);
      localDB.save();
    }

    const targetUser = user!;
    const token = generateToken({
      userId: targetUser.id,
      email: targetUser.email,
      username: targetUser.username
    });

    res.json({
      success: true,
      message: "Signed in with Google successfully.",
      data: {
        token,
        user: { id: targetUser.id, email: targetUser.email, username: targetUser.username, name: profile?.name },
        profile
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Google authentication failed." });
  }
};

export const appleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;
    const userEmail = (email || "apple.user@icloud.com").toLowerCase();
    const db = localDB.get();

    let user = db.users.find((u) => u.email.toLowerCase() === userEmail);
    let profile = user ? db.profiles.find((p) => p.user_id === user!.id) : null;

    if (!user) {
      const userId = uuidv4();
      const now = new Date().toISOString();
      const username = "apple_" + Math.floor(Math.random() * 10000);
      user = {
        id: userId,
        email: userEmail,
        username,
        password_hash: "OAUTH_APPLE_SECURE",
        created_at: now
      };
      profile = {
        id: uuidv4(),
        user_id: userId,
        name: name || "Apple User",
        username,
        age: 28,
        gender: "Not specified",
        height: 175,
        weight: 70,
        fitness_level: "Beginner",
        activity_level: "Moderate",
        fitness_goal: "General Fitness",
        workout_preference: { location: "Gym", availableTime: 45, daysPerWeek: 4 },
        food_preference: "Vegetarian",
        allergies: [],
        created_at: now,
        updated_at: now
      };
      db.users.push(user);
      db.profiles.push(profile);
      localDB.save();
    }

    const targetUser = user!;
    const token = generateToken({
      userId: targetUser.id,
      email: targetUser.email,
      username: targetUser.username
    });

    res.json({
      success: true,
      message: "Signed in with Apple successfully.",
      data: {
        token,
        user: { id: targetUser.id, email: targetUser.email, username: targetUser.username, name: profile?.name },
        profile
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Apple authentication failed." });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const db = localDB.get();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Security standard: don't disclose user existence
      res.json({
        success: true,
        message: "If that email is registered, a 6-digit recovery code has been sent."
      });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = Date.now() + 15 * 60 * 1000; // 15 mins

    // Clear previous resets for this email
    db.password_resets = db.password_resets.filter((r) => r.email.toLowerCase() !== cleanEmail);
    db.password_resets.push({ email: cleanEmail, code, expires_at });
    localDB.save();

    res.json({
      success: true,
      message: `Recovery code generated. For development/testing: Code is ${code}`,
      debugCode: code
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error processing forgot password request." });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({ success: false, message: "All fields are required." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = localDB.get();

    const resetRecord = db.password_resets.find(
      (r) => r.email.toLowerCase() === cleanEmail && r.code === code && r.expires_at > Date.now()
    );

    if (!resetRecord) {
      res.status(400).json({ success: false, message: "Invalid or expired verification code." });
      return;
    }

    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);

    // Remove used code
    db.password_resets = db.password_resets.filter((r) => r.email.toLowerCase() !== cleanEmail);
    localDB.save();

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error resetting password." });
  }
};
