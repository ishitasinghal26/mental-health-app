CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),

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

CREATE TABLE journals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content TEXT,
  mood VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  activity_type VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chatbot_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  user_message TEXT,
  bot_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);