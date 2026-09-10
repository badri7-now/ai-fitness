-- ==========================================================
-- AI-Powered Personalized Fitness and Nutrition Assistant
-- Database Schema with Row Level Security (RLS)
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    age INTEGER CHECK (age > 0 AND age < 120),
    gender TEXT,
    height NUMERIC(5, 2), -- in cm
    weight NUMERIC(5, 2), -- in kg
    fitness_level TEXT CHECK (fitness_level IN ('Beginner', 'Intermediate', 'Advanced')),
    activity_level TEXT,
    fitness_goal TEXT CHECK (fitness_goal IN ('Weight Loss', 'Muscle Gain', 'Strength', 'Improve Endurance', 'General Fitness', 'Maintain Weight')),
    workout_preference JSONB DEFAULT '{}'::jsonb,
    food_preference TEXT CHECK (food_preference IN ('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Other')),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKOUTS TABLE
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration INTEGER NOT NULL DEFAULT 0, -- in seconds or minutes
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKOUT EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER NOT NULL DEFAULT 10,
    weight NUMERIC(6, 2) DEFAULT 0.0,
    duration INTEGER DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false
);

-- 4. NUTRITION TABLE
CREATE TABLE IF NOT EXISTS public.nutrition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
    meal_name TEXT NOT NULL,
    calories NUMERIC(6, 1) NOT NULL DEFAULT 0,
    protein NUMERIC(5, 1) NOT NULL DEFAULT 0,
    carbohydrates NUMERIC(5, 1) NOT NULL DEFAULT 0,
    fats NUMERIC(5, 1) NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false
);

-- 5. PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(5, 2),
    steps INTEGER DEFAULT 0,
    calories NUMERIC(6, 1) DEFAULT 0,
    workout_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON public.nutrition(user_id, date);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON public.progress(user_id, date);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own workouts" ON public.workouts
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout exercises" ON public.workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workouts w
            WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workouts w
            WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own nutrition" ON public.nutrition
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON public.progress
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
