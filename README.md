# MindKare – Mental Wellness Platform

MindKare is a full-stack web application designed to assess mental health using the DASS (Depression, Anxiety, Stress Scale) framework and provide personalized, explainable recommendations based on user inputs.

Developed as a major project focused on building a structured and scalable mental wellness solution.

---

## Key Highlights

- Structured mental health assessment using DASS methodology  
- Secure authentication with OTP-based email verification  
- Backend-driven recommendation system using rule-based logic  
- Personalized insights based on severity levels and lifestyle inputs  
- Google OAuth integration for seamless login  

---

## Features

- Secure Authentication (Email + OTP Verification)  
- Google Sign-In Integration (OAuth 2.0)  
- DASS-Based Mental Health Assessment  
- Rule-Based Recommendation Engine  
- Journaling and Mood Tracking  
- AI Chat Support Interface (UI integrated)  
- Personalized Insights and Wellness Score  

---

## Tech Stack

### Frontend
- React (Vite)  
- Tailwind CSS  

### Backend
- Node.js  
- Express.js  

### Database
- PostgreSQL  

### Authentication
- JWT-based authentication  
- OTP Email Verification  
- Google OAuth  

---

## System Architecture

The system follows a three-tier architecture:

- **Frontend (Presentation Layer)**: Handles user interaction and UI rendering  
- **Backend (Application Layer)**: Processes authentication, DASS scoring, and recommendation logic  
- **Database (Data Layer)**: Stores user data, assessments, and activity logs  

---

## Workflow

1. User registers using email  
2. OTP is sent for verification  
3. After verification, user completes DASS assessment  
4. System processes:
   - Depression, Anxiety, Stress scores  
   - Severity classification  
   - Overall wellness score  
5. Personalized recommendations are generated  
6. Insights and journaling prompts are displayed  

---

## DASS Processing Logic

- **Input**: User responses and lifestyle inputs  
- **Processing**:
  - Score calculation  
  - Severity mapping (Normal to Extremely Severe)  
  - Wellness score generation  
- **Output**:
  - Insights  
  - Recommendations  
  - Journaling prompts  

---

## Security Features

- Password hashing  
- JWT-based authentication  
- OTP-based email verification  
- Prevention of duplicate registrations  

---

## Project Structure

```
mental-health-app/
│
├── client/        # Frontend (React)
├── server/        # Backend (Node.js/Express)
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│
└── README.md
```

---
## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/ishitasinghal26/mental-health-app
cd mental-health-app
```

### 2. Install dependencies
```bash
cd server
npm install

cd ../client
npm install
```

### 3. Run the application

**Backend**
```bash
cd server
npm run dev
```

**Frontend**
```bash
cd client
npm run dev
```

Notes

* Environment variables are required for:
    * Database configuration
    * Email service
    * Google OAuth
* Sensitive credentials are not included in the repository

⸻

Contributors

Anshita Mishra

* Backend Development
* DASS Scoring and Processing
* API Design and Database Integration
* Recommendation Engine

Ishita Singhal

* Frontend Development
* UI/UX Design
* Authentication Integration
* Chatbot Interface

⸻

Future Enhancements

* Integration of machine learning for adaptive recommendations
* Real-time analytics dashboard
* Therapist support integration
* Mobile application

⸻

Conclusion

MindKare provides a structured and scalable approach to mental health assessment by combining validated scoring techniques with personalized, explainable recommendations.




