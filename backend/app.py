from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from disease_model import predict_disease

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def serve_frontend():
    # Serve the frontend from the separate frontend/ directory
    import os

    frontend_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend")
    )
    return send_from_directory(frontend_dir, "index.html")


@app.route("/<path:path>", methods=["GET"])
def serve_static(path):
    # Serve static frontend assets (style.css, script.js, assets, etc.)
    import os

    frontend_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend")
    )
    return send_from_directory(frontend_dir, path)


def _bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Normal"
    if bmi < 30:
        return "Overweight"
    return "Obese"


@app.route("/calculate-bmi", methods=["POST"])
def calculate_bmi():
    data = request.get_json(force=True) or {}
    height = data.get("height")
    weight = data.get("weight")
    try:
        height = float(height)
        weight = float(weight)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid height or weight"}), 400
    if height <= 0 or weight <= 0:
        return jsonify({"error": "Height and weight must be positive numbers"}), 400

    h_m = height / 100.0
    bmi = weight / (h_m * h_m)
    bmi_rounded = round(bmi, 2)
    category = _bmi_category(bmi_rounded)

    # Simple health suggestions based on category
    suggestions = []
    if category == "Underweight":
        suggestions = [
            "Increase calorie intake with balanced meals.",
            "Include protein-rich foods.",
        ]
    elif category == "Normal":
        suggestions = ["Maintain balanced diet and regular exercise."]
    elif category == "Overweight":
        suggestions = ["Incorporate cardio, monitor portions, and stay hydrated."]
    else:  # Obese
        suggestions = ["Consult a healthcare professional for a personalized plan."]

    return jsonify(
        {"bmi": bmi_rounded, "category": category, "suggestions": suggestions}
    )


def _compat_rules():
    # Define compatibility map for donor -> recipient
    donors = ["O-", "O+", "A-", "A+", "B-", "B-", "AB-", "AB+"]

    # All rules implemented in function to avoid confusion
    return None


def _is_compatible(donor: str, recipient: str) -> (bool, str):
    # Normalize
    donor = (donor or "").strip()
    recipient = (recipient or "").strip()
    if not donor or not recipient:
        return False, "Donor and recipient blood groups must be provided."

    # Pattern-based lookup based on ABO and Rh compatibility
    # Universal donor
    if donor == "O-":
        return True, f"{donor} can donate to any blood type."
    if recipient == "AB+":
        return True, "AB+ is universal recipient."

    # Define compatibility table by recipient
    comp = {
        "O+": ["O+", "O-"],
        "A+": ["A+", "A-", "O+", "O-"],
        "B+": ["B+", "B-", "O+", "O-"],
        "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "O-": ["O-"],
        "A-": ["A-", "O-"],
        "B-": ["B-", "O-"],
        "AB-": ["AB-", "A-", "B-", "O-"],
    }

    allowed = comp.get(recipient, [])
    is_ok = donor in allowed
    explanation = ""
    if is_ok:
        explanation = f"Donor {donor} is compatible with recipient {recipient}."
    else:
        explanation = f"Donor {donor} is NOT compatible with recipient {recipient}."
    return is_ok, explanation


@app.route("/check-blood", methods=["POST"])
def check_blood():
    data = request.get_json(force=True) or {}
    donor = data.get("donor")
    receiver = data.get("receiver")

    compatible, explanation = _is_compatible(donor, receiver)
    return jsonify({"compatible": compatible, "explanation": explanation})


@app.route("/predict-disease", methods=["POST"])
def predict_disease_endpoint():
    data = request.get_json(force=True) or {}
    symptoms = data.get("symptoms", [])
    if not isinstance(symptoms, list):
        return jsonify({"error": "symptoms must be a list"}), 400
    result = predict_disease(symptoms)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
