import pickle
import pandas as pd

def feature_predict(json_data: dict) -> int:
    # Load the pre-trained model
    with open("xgboost_rf_model.pkl", "rb") as f:
        loaded_model = pickle.load(f)

    # Convert JSON data to DataFrame
    input_df = pd.DataFrame([json_data])

    # Make prediction
    prediction = loaded_model.predict(input_df)

    return prediction[0]

def test():
    with open("xgboost_rf_model.pkl", "rb") as f:
        loaded_model = pickle.load(f)

    # Example new data for prediction
    new_data = pd.DataFrame([{
        "age": 65,
        "bmi": 23.530366,
        "csa": 27.0,
        "pb": 3.9,
        "duration": 12,
        "nrs": 7,
        "sex": 0,        # e.g. male=1, female=0 (depends how you encoded it)
        "side": 0,       # left/right encoding
        "diabetes": 1,
        "np": 1,
        "weakness": 1
    }])

    pred_class = loaded_model.predict(new_data)

    print(f"Predicted class: {pred_class[0]}")

def main():
    test()
    return 0

if __name__ == "__main__":
    main()