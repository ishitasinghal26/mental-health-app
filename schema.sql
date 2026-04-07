-- ============================================================
-- MindKare Mental Health App — Full Database Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  dass_completed BOOLEAN DEFAULT FALSE,
  ai_consent BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  depression_score INT,
  anxiety_score INT,
  stress_score INT,
  depression_level VARCHAR(50),
  anxiety_level VARCHAR(50),
  stress_level VARCHAR(50),
  sleep_risk VARCHAR(50),
  screen_risk VARCHAR(50),
  stress_self VARCHAR(50),
  overall_severity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mood_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  intensity INT DEFAULT 3,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(50),
  intensity INT DEFAULT 3,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy journals table (kept for backward compat)
CREATE TABLE IF NOT EXISTS journals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content TEXT,
  mood VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);