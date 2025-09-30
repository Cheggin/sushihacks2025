"""
Simple test script for the CTS Prediction API
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8002"

def test_prediction():
    """Test the prediction endpoint with sample data"""
    
    # Example patient data
    patient_data = {
        "age": 65,
        "bmi": 23.5,
        "sex": 0,  # female
        "duration": 6,  # months
        "nrs": 7,  # pain scale
        "grip_strength": 13.0,  # kg
        "pinch_strength": 2.9   # kg
    }
    
    try:
        print("🔬 Testing CTS Severity Prediction API")
        print("=" * 50)
        
        # Test API connection
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("❌ API is not running. Start it with: python cts_prediction_api.py")
            return
        
        print("✅ API is running!")
        
        # Make prediction
        print(f"\n📊 Testing prediction with patient data:")
        print(f"Age: {patient_data['age']}, BMI: {patient_data['bmi']}")
        print(f"Sex: {'Female' if patient_data['sex'] == 0 else 'Male'}")
        print(f"Duration: {patient_data['duration']} months")
        print(f"Pain Scale: {patient_data['nrs']}/10")
        print(f"Grip Strength: {patient_data['grip_strength']} kg")
        print(f"Pinch Strength: {patient_data['pinch_strength']} kg")
        
        response = requests.post(
            f"{BASE_URL}/predict",
            json=patient_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Prediction Results:")
            print(f"Predicted Severity: {result['predicted_class'].upper()}")
            print(f"Confidence: {result['confidence']:.1%}")
            print(f"\nDetailed Probabilities:")
            for severity, prob in result['probabilities'].items():
                print(f"  {severity.capitalize()}: {prob:.3f} ({prob*100:.1f}%)")
            
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure it's running:")
        print("   python cts_prediction_api.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_multiple_cases():
    """Test with multiple patient cases"""
    
    test_cases = [
        {
            "name": "Mild Case",
            "data": {
                "age": 45,
                "bmi": 24.0,
                "sex": 1,  # male
                "duration": 2,  # months
                "nrs": 3,  # pain scale
                "grip_strength": 38.0,  # kg (strong)
                "pinch_strength": 7.5   # kg (strong)
            }
        },
        {
            "name": "Moderate Case", 
            "data": {
                "age": 55,
                "bmi": 27.0,
                "sex": 0,  # female
                "duration": 8,  # months
                "nrs": 6,  # pain scale
                "grip_strength": 12.0,  # kg (weak)
                "pinch_strength": 2.5   # kg (weak)
            }
        },
        {
            "name": "Severe Case",
            "data": {
                "age": 70,
                "bmi": 29.0,
                "sex": 0,  # female
                "duration": 18,  # months
                "nrs": 9,  # pain scale
                "grip_strength": 8.0,   # kg (very weak)
                "pinch_strength": 1.8   # kg (very weak)
            }
        }
    ]
    
    print("\n🧪 Testing Multiple Cases:")
    print("=" * 50)
    
    for case in test_cases:
        print(f"\n📋 {case['name']}:")
        try:
            response = requests.post(
                f"{BASE_URL}/predict",
                json=case['data'],
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"  Predicted: {result['predicted_class'].upper()} (confidence: {result['confidence']:.1%})")
            else:
                print(f"  ❌ Failed: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")

if __name__ == "__main__":
    test_prediction()
    test_multiple_cases()
    
    print("\n" + "=" * 50)
    print("🚀 To start the API: python cts_prediction_api.py")
    print("📚 API docs: http://localhost:8002/docs")
    print("🔗 API endpoint: http://localhost:8002/predict")
