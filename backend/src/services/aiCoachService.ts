import { Profile, Workout } from "../config/db";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GeneratedWorkoutExercise {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  rest_time_seconds: number;
  duration_seconds: number;
  instructions?: string;
}

export interface GeneratedWorkout {
  workout_name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimated_duration_minutes: number;
  target_muscle_groups: string[];
  equipment: string[];
  exercises: GeneratedWorkoutExercise[];
  coach_tip: string;
}

const MEDICAL_DISCLAIMER =
  "\n\n*Disclaimer: I am your FitAI fitness coach. I provide general fitness and nutrition recommendations. I do not diagnose injuries or medical conditions. For any pain or medical concerns, please consult a qualified healthcare professional.*";

export async function askFitAICoach(
  prompt: string,
  profile?: Profile,
  recentWorkouts?: Workout[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey && process.env.GEMINI_API_KEY) {
    try {
      const response = await callGeminiAPI(process.env.GEMINI_API_KEY, prompt, profile, recentWorkouts);
      if (response) return response + MEDICAL_DISCLAIMER;
    } catch (e) {
      console.warn("Gemini API call failed, using intelligent built-in FitAI engine:", e);
    }
  }

  // Built-in intelligent AI Coach reasoning engine (Zero cost, high-quality, personalized)
  return generateLocalAIResponse(prompt, profile, recentWorkouts) + MEDICAL_DISCLAIMER;
}

async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  profile?: Profile,
  recentWorkouts?: Workout[]
): Promise<string | null> {
  const systemContext = `You are FitAI Coach, a supportive, encouraging, and science-backed personal fitness and nutrition coach.
User Profile:
- Name: ${profile?.name || "User"}
- Age: ${profile?.age || "Not specified"}, Gender: ${profile?.gender || "Not specified"}
- Height: ${profile?.height || 175}cm, Weight: ${profile?.weight || 70}kg
- Fitness Level: ${profile?.fitness_level || "Beginner"}
- Fitness Goal: ${profile?.fitness_goal || "General Fitness"}
- Location Preference: ${profile?.workout_preference?.location || "Home"}
- Available Time: ${profile?.workout_preference?.availableTime || 30} mins
- Recent workouts completed: ${recentWorkouts?.length || 0}
Always personalize your advice to their goal and fitness level. Keep answers concise, actionable, and formatted with bullet points. Never diagnose injuries; refer to medical professionals if injury or pain is mentioned.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }]
        }
      ]
    })
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

function generateLocalAIResponse(
  prompt: string,
  profile?: Profile,
  recentWorkouts?: Workout[]
): string {
  const query = prompt.toLowerCase();
  const name = profile?.name || "Friend";
  const goal = profile?.fitness_goal || "General Fitness";
  const level = profile?.fitness_level || "Beginner";
  const weight = profile?.weight || 70;
  const location = profile?.workout_preference?.location || "Home";

  // Check injury / medical safety
  if (
    query.includes("hurt") ||
    query.includes("pain") ||
    query.includes("injur") ||
    query.includes("sprain") ||
    query.includes("tear") ||
    query.includes("doctor")
  ) {
    return `Hi ${name}, your safety is our top priority! If you are feeling sharp pain or suspect an injury, please stop exercising that area immediately and consult a physician or licensed physical therapist.

Rest the affected area, apply ice if swollen, and avoid pushing through pain. Once you are cleared by a medical professional, we can customize a gentle rehab or low-impact routine for you.`;
  }

  // 1. "Create today's workout" / "Give me a workout"
  if (query.includes("today's workout") || query.includes("create") || query.includes("plan") || query.includes("routine")) {
    if (location === "Gym") {
      return `Here is your customized **${level} Gym Session** tailored for your **${goal}** goal:

1. **Barbell Squats**: 3 sets × 10 reps (Rest: 90s)
2. **Dumbbell Bench Press**: 3 sets × 10 reps (Rest: 60s)
3. **Lat Pulldowns / Cable Rows**: 3 sets × 12 reps (Rest: 60s)
4. **Romanian Deadlifts**: 3 sets × 10 reps (Rest: 75s)
5. **Plank**: 3 sets × 45 seconds

💡 **Coach Tip:** Start with a 5-minute dynamic warmup. Tap the **"Workout"** tab to launch the interactive live workout timer!`;
    }
    return `Here is your personalized **${level} Home Routine** targeting **${goal}**:

1. **Bodyweight Squats**: 3 sets × 15 reps (Rest: 60s)
2. **Push-ups (standard or knee)**: 3 sets × 10 reps (Rest: 60s)
3. **Walking Lunges**: 3 sets × 12 reps per leg (Rest: 60s)
4. **Glute Bridges**: 3 sets × 15 reps (Rest: 45s)
5. **Forearm Plank**: 3 sets × 35 seconds

💡 **Coach Tip:** Focus on steady tempo (2 seconds down, 1 second pause, 1 second up). Tap **Start Workout** on your Dashboard to track your reps and rest intervals!`;
  }

  // 2. "20-minute home workout"
  if (query.includes("20-minute") || query.includes("20 min") || query.includes("quick")) {
    return `Here is an efficient **20-Minute High-Yield Circuit** perfect for ${name}:

*Perform each exercise for 40 seconds, rest 20 seconds. Repeat the circuit 4 times (total ~20 mins):*
1. **Jumping Jacks / High Knees** (Warmup & cardio pump)
2. **Bodyweight Air Squats** (Lower body focus)
3. **Push-ups or Incline Push-ups** (Chest, shoulders, triceps)
4. **Bicycle Crunches** (Core activation)
5. **Mountain Climbers** (Endurance burn)

💡 **Coach Tip:** Keep water nearby and focus on continuous breathing!`;
  }

  // 3. Legs
  if (query.includes("leg") || query.includes("quad") || query.includes("hamstring")) {
    return `For developing strong legs aligned with your **${goal}** goal:

1. **Goblet / Barbell Squats**: 3-4 sets × 8-12 reps
2. **Romanian Deadlifts (RDLs)**: 3 sets × 10 reps (essential for hamstrings and glutes)
3. **Bulgarian Split Squats**: 3 sets × 8-10 reps per leg
4. **Calf Raises**: 3 sets × 15 reps with a 2-second pause at the peak

💡 **Form Tip:** Drive through your mid-foot and heel, keeping your chest proud and knees tracking inline with your toes.`;
  }

  // 4. Sets & Reps
  if (query.includes("how many sets") || query.includes("reps")) {
    return `For your goal of **${goal}** as an **${level}**:

- **Strength:** 3 to 5 sets of 4-6 reps (Heavier load, 2-3 min rest)
- **Muscle Hypertrophy:** 3 to 4 sets of 8-12 reps (Moderate-heavy load, 60-90s rest)
- **Endurance & Fat Loss:** 3 sets of 12-15+ reps (Moderate load, 30-45s rest)

For ${level} lifters, doing **3 working sets per exercise** strikes the optimal balance between stimulus and muscle recovery!`;
  }

  // 5. Missed yesterday's workout
  if (query.includes("missed") || query.includes("yesterday") || query.includes("skipped")) {
    return `Don't worry at all, ${name}! Consistency over months matters far more than any single day.

Here is what you should do:
1. **Do not try to do a double workout today.** That risks excessive fatigue and injury.
2. **Simply slide your schedule forward:** Pick up yesterday's planned workout today.
3. Stay hydrated and hit your daily nutrition targets. You're still on track for your **${goal}**!`;
  }

  // 6. Post-workout nutrition
  if (query.includes("eat") || query.includes("food") || query.includes("post-workout") || query.includes("nutrition")) {
    const proteinTarget = Math.round(weight * 0.4);
    return `For optimal recovery following your workout (weight: ${weight}kg):

**Within 1-2 hours post-workout, aim for:**
- **Protein (~${proteinTarget}g):** Whey/Plant protein shake, chicken breast, eggs, or Greek yogurt / paneer to kickstart muscle protein synthesis.
- **Complex Carbohydrates (~40-60g):** Brown rice, oatmeal, sweet potato, or banana to replenish depleted muscle glycogen stores.
- **Hydration:** 500ml of water with a pinch of electrolytes.

Check your **Nutrition** tab for your customized daily macro breakdown!`;
  }

  // 7. Improve strength
  if (query.includes("strength") || query.includes("improve") || query.includes("stronger")) {
    return `To steadily build strength for ${name}:

1. **Progressive Overload:** Aim to add either 1 rep or a slight weight increase (1-2.5 kg) to your compound lifts every week.
2. **Compound Movements:** Prioritize squats, deadlifts, bench/overhead presses, and pull-ups.
3. **Adequate Protein & Sleep:** Consume ~2g protein per kg of body weight (${Math.round(weight * 2)}g/day for you) and get 7-8 hours of quality sleep.
4. **Rest Between Sets:** Rest 2-3 minutes on heavy lifts to allow full ATP energy recovery.`;
  }

  // Default helpful coach response
  return `Hi ${name}! As your FitAI Coach, I am here to guide your journey towards **${goal}**.

Based on your current profile (${level} level, ${weight}kg, preferring ${location} workouts), here are a few things we can do:
- Ask me: *"Create today's workout"*
- Ask me: *"Give me a 20-minute home workout"*
- Ask me: *"What should I eat after my workout?"*
- Or navigate to the **Workout** tab to start an active workout with real-time timers!`;
}

export function generatePersonalizedWorkout(profile?: Profile): GeneratedWorkout {
  const goal = profile?.fitness_goal || "General Fitness";
  const level = profile?.fitness_level || "Beginner";
  const location = profile?.workout_preference?.location || "Home";
  const availableTime = profile?.workout_preference?.availableTime || 35;
  const isGym = location === "Gym";

  if (isGym) {
    return {
      workout_name: `Full Body Strength & Hypertrophy (${level})`,
      difficulty: level,
      estimated_duration_minutes: availableTime,
      target_muscle_groups: ["Chest", "Back", "Legs", "Core"],
      equipment: ["Barbell", "Dumbbells", "Cables", "Bench"],
      coach_tip: "Focus on controlled eccentrics (lowering the weight slowly) and full range of motion.",
      exercises: [
        {
          exercise_name: "Barbell Back Squat",
          sets: level === "Beginner" ? 3 : 4,
          reps: 10,
          weight: 40,
          rest_time_seconds: 75,
          duration_seconds: 45,
          instructions: "Keep chest proud, descend until thighs are parallel to ground."
        },
        {
          exercise_name: "Dumbbell Incline Bench Press",
          sets: 3,
          reps: 10,
          weight: 16,
          rest_time_seconds: 60,
          duration_seconds: 40,
          instructions: "Squeeze upper chest at top without locking elbows."
        },
        {
          exercise_name: "Seated Cable Row",
          sets: 3,
          reps: 12,
          weight: 35,
          rest_time_seconds: 60,
          duration_seconds: 45,
          instructions: "Drive elbows backward, squeeze shoulder blades together."
        },
        {
          exercise_name: "Dumbbell Romanian Deadlift",
          sets: 3,
          reps: 10,
          weight: 20,
          rest_time_seconds: 60,
          duration_seconds: 45,
          instructions: "Hinge at the hips, feeling tension in the hamstrings."
        },
        {
          exercise_name: "Hanging Knee Raises / Cable Crunch",
          sets: 3,
          reps: 15,
          weight: 0,
          rest_time_seconds: 45,
          duration_seconds: 30,
          instructions: "Curl pelvis upward, contracting abdominals."
        }
      ]
    };
  }

  // Home routine
  return {
    workout_name: `AI Bodyweight & Core Blast (${level})`,
    difficulty: level,
    estimated_duration_minutes: availableTime,
    target_muscle_groups: ["Full Body", "Core", "Legs", "Cardio"],
    equipment: ["Bodyweight", "Mat"],
    coach_tip: "Ensure tight core engagement and smooth breathing on every rep.",
    exercises: [
      {
        exercise_name: "Bodyweight Deep Squats",
        sets: 3,
        reps: 15,
        weight: 0,
        rest_time_seconds: 60,
        duration_seconds: 45,
        instructions: "Keep knees tracking over toes, hips back."
      },
      {
        exercise_name: level === "Advanced" ? "Diamond Push-ups" : "Standard Push-ups",
        sets: 3,
        reps: level === "Beginner" ? 10 : 15,
        weight: 0,
        rest_time_seconds: 60,
        duration_seconds: 40,
        instructions: "Maintain straight plank line from neck to heels."
      },
      {
        exercise_name: "Reverse Alternating Lunges",
        sets: 3,
        reps: 12,
        weight: 0,
        rest_time_seconds: 60,
        duration_seconds: 50,
        instructions: "Step back smoothly, lowering rear knee towards floor."
      },
      {
        exercise_name: "Glute Bridge Pulses",
        sets: 3,
        reps: 15,
        weight: 0,
        rest_time_seconds: 45,
        duration_seconds: 40,
        instructions: "Drive through heels, squeeze glutes at top."
      },
      {
        exercise_name: "Forearm Plank Hold",
        sets: 3,
        reps: 1,
        weight: 0,
        rest_time_seconds: 60,
        duration_seconds: level === "Beginner" ? 35 : 55,
        instructions: "Brace core tight, do not let lower back sag."
      }
    ]
  };
}
