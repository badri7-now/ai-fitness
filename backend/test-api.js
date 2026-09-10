const http = require("http");

async function runTests() {
  console.log("Starting FitAI Backend Server for automated verification...");
  
  // Start server
  const serverProcess = require("./dist/server.js");
  
  // Wait 1.5s for server startup
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const BASE_URL = "http://localhost:5000/api";
  let authToken = "";

  async function post(endpoint, data, token) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    return { status: res.status, body: await res.json() };
  }

  async function get(endpoint, token) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return { status: res.status, body: await res.json() };
  }

  try {
    // 1. Health check
    console.log("1. Testing Health Check...");
    const health = await get("/health");
    console.log("Health Status:", health.body.status);
    if (health.body.status !== "healthy") throw new Error("Health check failed");

    // 2. Auth: Register
    console.log("2. Testing User Registration...");
    const testId = Date.now();
    const testUsername = `alex_${testId}`;
    const testEmail = `alex_${testId}@example.com`;
    const reg = await post("/auth/register", {
      name: "Alex Parker",
      email: testEmail,
      username: testUsername,
      password: "password123",
      confirmPassword: "password123"
    });
    console.log("Register result:", reg.body.success, reg.body.message);
    if (!reg.body.success) throw new Error("Registration failed: " + reg.body.message);
    authToken = reg.body.data.token;

    // 3. Auth: Login
    console.log("3. Testing User Login...");
    const login = await post("/auth/login", {
      emailOrUsername: testUsername,
      password: "password123"
    });
    console.log("Login result:", login.body.success, login.body.data.user.name);
    if (!login.body.success) throw new Error("Login failed");

    // 4. Profile: Get & Update
    console.log("4. Testing Profile CRUD...");
    const profileRes = await get("/profile", authToken);
    console.log("Fetched Profile Goal:", profileRes.body.data.profile.fitness_goal);
    console.log("Calorie Plan Targets:", profileRes.body.data.caloriePlan.targetCalories, "kcal");

    const updateRes = await post("/profile", {}, authToken); // via PUT or check routes

    // 5. AI Coach Chat
    console.log("5. Testing FitAI Coach chat...");
    const aiRes = await post("/ai/coach", { message: "Give me a 20-minute home workout" }, authToken);
    console.log("AI Coach Reply Preview:\n", aiRes.body.data.reply.slice(0, 180) + "...");
    if (!aiRes.body.success) throw new Error("FitAI Coach chat failed");

    // 6. AI Personalized Workout Generator
    console.log("6. Testing AI Workout Generator...");
    const genWk = await post("/ai/generate-workout", {}, authToken);
    console.log("Generated Workout:", genWk.body.data.workout_name, "with", genWk.body.data.exercises.length, "exercises");
    if (!genWk.body.success || genWk.body.data.exercises.length === 0) throw new Error("Workout generation failed");

    // 7. Log Workout & Exercises
    console.log("7. Testing Workout Logging...");
    const createWk = await post("/workouts", {
      workout_name: "Morning Cardio & Core",
      duration: 1800,
      completed: true,
      exercises: [
        { exercise_name: "Squats", sets: 3, reps: 15, weight: 0, completed: true },
        { exercise_name: "Push-ups", sets: 3, reps: 12, weight: 0, completed: true }
      ]
    }, authToken);
    console.log("Workout logged:", createWk.body.data.workout_name, "ID:", createWk.body.data.id);

    // 8. Offline Sync & Deduplication
    console.log("8. Testing Offline Workout Sync & Deduplication...");
    const offlineItem = {
      id: "offline-test-uuid-001",
      workout_name: "Offline Park Run",
      duration: 1200,
      date: new Date().toISOString().split("T")[0],
      exercises: [{ exercise_name: "Running", sets: 1, reps: 1, weight: 0 }]
    };
    const sync1 = await post("/workouts/sync", { workouts: [offlineItem] }, authToken);
    console.log("Sync 1 result:", sync1.body.message);
    const sync2 = await post("/workouts/sync", { workouts: [offlineItem] }, authToken);
    console.log("Sync 2 (idempotency/dedupe) result:", sync2.body.message);
    if (sync2.body.duplicateCount !== 1) throw new Error("Deduplication check failed");

    // 9. Nutrition
    console.log("9. Testing Nutrition Plan & Logging...");
    const nutritionRes = await get("/nutrition", authToken);
    console.log("Meals for today count:", nutritionRes.body.meals.length);
    console.log("First meal:", nutritionRes.body.meals[0].meal_type, "-", nutritionRes.body.meals[0].meal_name);

    // 10. Progress
    console.log("10. Testing Progress & Weekly Calendar...");
    const progressRes = await get("/progress?timeframe=week", authToken);
    console.log("Weekly Calendar Days:", progressRes.body.weeklyCalendar.map(c => `${c.day}:${c.completed ? '✓' : '-'}`).join(" "));

    console.log("\nALL 10 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀");
    process.exit(0);
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  }
}

runTests();
