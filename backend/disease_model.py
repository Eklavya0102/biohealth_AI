"""Disease prediction model (enhanced rule-based / lightweight model)."""

from typing import List, Dict


def _normalize(symptom: str) -> str:
    return symptom.strip().lower()


def predict_disease(symptoms: List[str]) -> Dict:
    """Predict a disease based on a list of symptoms.

    This uses a weighted rule-based approach to provide a more nuanced
    prediction than a single-heuristic rule. It is intended for demo purposes
    and not a medical diagnosis.
    """
    # Normalize input symptoms
    s = [_normalize(sym) for sym in symptoms]

    # Define diseases with weighted symptom mappings
    disease_rules = {
        "Flu": {
            "fever": 2,
            "cough": 1,
            "fatigue": 1,
            "sore throat": 1,
            "headache": 1,
        },
        "Common Cold": {
            "cough": 1,
            "runny nose": 1,
            "sore throat": 1,
            "fever": 0,
        },
        "Viral Fever": {
            "fever": 2,
            "fatigue": 1,
            "headache": 1,
        },
        "Food Poisoning": {
            "nausea": 2,
            "vomiting": 2,
            "diarrhea": 1,
        },
        "Migraine": {
            "headache": 2,
            "nausea": 1,
            "dizziness": 1,
        },
        "Sinusitis": {
            "fever": 1,
            "cough": 1,
            "runny nose": 1,
        },
    }

    # Medicine, precautions, and tips per disease
    disease_guidance = {
        "Flu": {
            "medicines": ["Paracetamol 500 mg (as directed)", "ORS"],
            "precautions": ["Rest", "Hydration", "Avoid spreading infection"],
            "tips": ["Monitor fever", "Seek medical advice if symptoms worsen"],
        },
        "Common Cold": {
            "medicines": ["Paracetamol as needed"],
            "precautions": ["Rest", "Hydration"],
            "tips": ["Humidified air may help", "Saltwater gargles"],
        },
        "Viral Fever": {
            "medicines": ["Paracetamol 500 mg (as directed)", "ORS"],
            "precautions": ["Rest", "Hydration"],
            "tips": ["Monitor for dehydration", "If fever lasts > 3 days seek care"],
        },
        "Food Poisoning": {
            "medicines": ["ORS", "Electrolyte solution"],
            "precautions": ["Stay hydrated", "Avoid solid foods temporarily"],
            "tips": [
                "Seek medical help if vomiting continues",
                "Watch for signs of dehydration",
            ],
        },
        "Migraine": {
            "medicines": ["Analgesics as advised (e.g., acetaminophen)"],
            "precautions": ["Rest in a dark quiet room"],
            "tips": ["Hydration", "Limit caffeine if triggers"],
        },
        "Sinusitis": {
            "medicines": ["Consult doctor for antibiotics if indicated"],
            "precautions": ["Nasal irrigation may help"],
            "tips": ["Steam inhalation", "Avoid irritants"],
        },
    }

    # Score each disease
    scores = {}
    max_capacity = 0
    for disease, rules in disease_rules.items():
        score = 0
        for symptom, weight in rules.items():
            if symptom in s:
                score += weight
        scores[disease] = score
        max_capacity = max(max_capacity, sum(rules.values()))

    # Pick the disease with the highest score; if all zero, fallback to Common Cold
    best_disease, best_score = (
        max(scores.items(), key=lambda kv: kv[1]) if scores else ("Common Cold", 0)
    )
    if best_score == 0:
        best_disease = "Common Cold"

    # Compute a simple confidence metric
    total_capacity = max_capacity or 1
    confidence = int((scores.get(best_disease, 0) / total_capacity) * 100)

    # Compile top 3 candidates for extra UX (if any)
    sorted_candidates = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    top_candidates = [d for d, sc in sorted_candidates[:3] if sc > 0]

    guidance = disease_guidance.get(
        best_disease, {"medicines": [], "precautions": [], "tips": []}
    )

    return {
        "disease": best_disease,
        "medicines": guidance["medicines"],
        "precautions": guidance["precautions"],
        "tips": guidance["tips"],
        "disclaimer": "This is NOT a medical diagnosis. Seek professional medical advice for health concerns.",
        "confidence": confidence,
        "top_diseases": top_candidates,
    }
