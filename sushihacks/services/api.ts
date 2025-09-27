// For iOS Simulator: use localhost
// For Android Emulator: use 10.0.2.2 instead of localhost
// For physical device: use your computer's IP address (run 'ifconfig' to find it)
const API_BASE_URL = 'http://localhost:8000';

interface PredictionRequest {
  age: number;
  bmi: number;
  csa: number;
  pb: number;
  nrs: number;
  sex: number;
}

interface PredictionResponse {
  prediction: number;
  confidence: number;
  metadata: {
    model_version: string;
    risk_level: string;
    risk_factors: string[];
    weights: {
      age: string;
      bmi: string;
      csa: string;
      pb: string;
      nrs: string;
    };
  };
}

export const predictFeatures = async (
  age: string,
  bmi: string,
  crossSectionalArea: string,
  palmarBowing: string,
  nrs: string,
  sex: string
): Promise<PredictionResponse> => {
  // Convert sex string to number
  const sexMap: { [key: string]: number } = {
    'male': 0,
    'female': 1,
    'other': 1  // Default to 1 for other
  };

  const request: PredictionRequest = {
    age: parseInt(age) || 0,
    bmi: parseFloat(bmi) || 0,
    csa: parseFloat(crossSectionalArea) || 0,
    pb: parseFloat(palmarBowing) || 0,
    nrs: parseInt(nrs) || 0,
    sex: sexMap[sex.toLowerCase()] ?? 1
  };

  try {
    const response = await fetch(`${API_BASE_URL}/feature_predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PredictionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Prediction API error:', error);
    throw error;
  }
};