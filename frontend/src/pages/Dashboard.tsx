import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts
const dailyData = [
  { time: '8AM', strength: 52 },
  { time: '10AM', strength: 48 },
  { time: '12PM', strength: 45 },
  { time: '2PM', strength: 43 },
  { time: '4PM', strength: 47 },
  { time: '6PM', strength: 50 },
];

const weeklyData = [
  { day: 'Mon', value: 48 },
  { day: 'Tue', value: 52 },
  { day: 'Wed', value: 47 },  { day: 'Thu', value: 51 },
  { day: 'Fri', value: 49 },
  { day: 'Sat', value: 53 },
  { day: 'Sun', value: 50 },
];

export default function Dashboard() {
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    csa: '',
    pb: '',
    nrs: '',
    sex: '0',
  });
  const [result, setResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate risk score (simplified version)
    const age = parseInt(formData.age);
    const bmi = parseFloat(formData.bmi);
    const csa = parseFloat(formData.csa);
    const pb = parseFloat(formData.pb);
    const nrs = parseInt(formData.nrs);
    
    let riskScore = 0;
    
    if (age > 60) riskScore += 0.15;
    else if (age > 50) riskScore += 0.1;
    
    if (bmi < 18.5 || bmi > 30) riskScore += 0.2;
    else if (bmi > 25) riskScore += 0.1;
    
    if (csa > 14) riskScore += 0.25;
    else if (csa > 11) riskScore += 0.15;
    
    if (pb > 4.5) riskScore += 0.25;
    else if (pb > 3.5) riskScore += 0.15;
    
    riskScore += (nrs / 10) * 0.15;
    
    const riskLevel = riskScore < 0.3 ? 'Low' : riskScore < 0.6 ? 'Moderate' : 'High';
    const riskColor = riskScore < 0.3 ? 'risk-low' : riskScore < 0.6 ? 'risk-moderate' : 'risk-high';
    
    setResult({
      prediction: riskScore,
      riskLevel,
      riskColor,
      confidence: 0.85,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-text-primary">CTS Risk Dashboard</h1>
            <p className="text-sm text-text-secondary">Carpal Tunnel Syndrome Assessment</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 border border-border hover:border-primary rounded-lg text-text-primary transition-colors text-sm"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Today's Date */}
        <div className="text-text-secondary text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-base font-semibold text-text-primary mb-4">Today's Grip Strength</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
                <XAxis dataKey="time" stroke="#636E72" fontSize={12} />
                <YAxis stroke="#636E72" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="strength" stroke="#5ECDBF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-base font-semibold text-text-primary mb-4">Weekly Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
                <XAxis dataKey="day" stroke="#636E72" fontSize={12} />
                <YAxis stroke="#636E72" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#5ECDBF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Assessment Form */}
        <div className="bg-card rounded-lg p-8 border border-border">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-2">Carpal Tunnel Risk Test</h2>
            <p className="text-sm text-text-secondary">Enter your health metrics for an instant risk assessment</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Age</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:border-primary focus:outline-none"
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">BMI</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.bmi}
                  onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:border-primary focus:outline-none"
                  placeholder="Body Mass Index"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">CSA (mm²)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.csa}
                  onChange={(e) => setFormData({ ...formData, csa: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:border-primary focus:outline-none"
                  placeholder="Cross-Sectional Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">PB (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.pb}
                  onChange={(e) => setFormData({ ...formData, pb: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:border-primary focus:outline-none"
                  placeholder="Palmar Bowing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">NRS Pain (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={formData.nrs}
                  onChange={(e) => setFormData({ ...formData, nrs: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:border-primary focus:outline-none"
                  placeholder="Pain level"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:border-primary focus:outline-none"
                >
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-md transition-colors"
            >
              Calculate Risk Score
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-8 max-w-2xl mx-auto border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Assessment Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Risk Level:</span>
                  <span className={`text-xl font-bold ${
                    result.riskLevel === 'Low' ? 'text-secondary' :
                    result.riskLevel === 'Moderate' ? 'text-warning' :
                    'text-danger'
                  }`}>{result.riskLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Risk Score:</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {(result.prediction * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Confidence:</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2 mt-4">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      result.riskLevel === 'Low' ? 'bg-secondary' :
                      result.riskLevel === 'Moderate' ? 'bg-warning' :
                      'bg-danger'
                    }`}
                    style={{ width: `${result.prediction * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
