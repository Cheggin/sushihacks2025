import pickle
import pandas as pd

def feature_predict(json_data: dict) -> int:
    """
    json data example:
    {   
        "age": int,
        "bmi": float,
        "csa": float,
        "pb": float,
        "nrs": (int 0-10),
        "sex": (0=male, 1-female)
    }
    """
    # Load the pre-trained model
    with open("new_model.pkl", "rb") as f:
        loaded_model = pickle.load(f)

    # Convert JSON data to DataFrame
    input_df = pd.DataFrame([json_data])

    # Make prediction
    prediction = loaded_model.predict(input_df)

    return prediction[0]

def test():
    with open("new_model.pkl", "rb") as f:
        loaded_model = pickle.load(f)

    # Example new data for prediction
    new_data = pd.DataFrame([{
        "age": 65,
        "bmi": 23.530366,
        "csa": 27.0,
        "pb": 3.9,
        "nrs": 7,
        "sex": 0,
    }])

    pred_class = loaded_model.predict(new_data)

    print(f"Predicted class: {pred_class[0]}")

def main():
    test()
    return 0

if __name__ == "__main__":
    main()