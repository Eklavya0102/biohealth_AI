🧬 BioHealth AI Dashboard

BioHealth AI Dashboard is a full-stack health assistant web application that helps users monitor basic health indicators and get general health guidance. The platform provides tools for calculating Body Mass Index (BMI), checking blood group compatibility, and predicting possible diseases based on symptoms. It also suggests common medicines, precautions, and general health tips.

This project is built using Python (Flask) for the backend and HTML, CSS, and JavaScript for the frontend, with a modern dashboard interface and interactive features.

🚀 Features
🧮 BMI Calculator
Calculates Body Mass Index using height and weight
Displays BMI category:
Underweight
Normal
Overweight
Obese
Provides basic health suggestions
🩸 Blood Compatibility Checker
Select donor and recipient blood groups
Checks compatibility using medical blood donation rules
Supports all major blood types:
A+, A-
B+, B-
AB+, AB-
O+, O-
🩺 Symptom-Based Disease Predictor

Users can enter symptoms such as:

Fever
Cough
Headache
Fatigue
Nausea
Runny nose

The system predicts possible diseases like:

Common Cold
Flu
Migraine
Viral Fever
Food Poisoning

The app also provides:

Suggested general medicines
Precautions
Basic health advice
🎨 Modern Dashboard UI

The application includes a clean and user-friendly dashboard interface with:

Interactive health cards
Smooth animations
Scroll-based progress underline effects
Responsive layout
🌙 Dark Mode / Light Mode

The dashboard includes a theme toggle that allows users to switch between:

Light Mode
Dark Mode

The selected theme is stored using local storage for a better user experience.

🛠️ Tech Stack
Frontend
HTML5
CSS3
JavaScript
Backend
Python
Flask
Libraries
Flask
Flask-CORS


📂 Project Structure
BioHealth-AI-Dashboard

backend
│
├── app.py
├── disease_model.py
└── requirements.txt

frontend
│
├── index.html
├── style.css
└── script.js