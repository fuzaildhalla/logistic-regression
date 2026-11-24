import { useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.origin.includes('logistic-regression-2kr9') 
    ? '' 
    : 'https://logistic-regression-2kr9.onrender.com')

function App() {
  const [studyHours, setStudyHours] = useState('5.0')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handlePredict = async (e) => {
    e.preventDefault()
    setError('')

    const hours = parseFloat(studyHours)
    if (isNaN(hours) || hours < 0 || hours > 24) {
      setError('Please enter study hours between 0 and 24.')
      return
    }

    setLoading(true)

    try {
      const endpoint = `${API_BASE_URL}/predict`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ StudyHours: hours }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.detail
          ? (Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail)
          : `API returned status ${response.status}`
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to connect to the prediction API. Make sure FastAPI is running.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const presets = [2.0, 4.5, 6.0, 8.5]

  const isPass = result && (result.prediction === 'Pass' || result.prediction === 1)
  const passPercent = result ? Math.round(Number(result.pass_probability) * 100) : 0

  return (
    <div className="app-container">
      <div className="card">
        <header className="card-header">
          <div className="badge-pill">ML Model Powered</div>
          <h1>Student Pass / Fail Predictor</h1>
          <p>Estimate the probability of passing based on daily study hours</p>
        </header>

        <form onSubmit={handlePredict} className="predict-form">
          <div className="input-group">
            <label htmlFor="studyHoursInput">Daily Study Hours (0 - 24)</label>
            <div className="input-field-wrapper">
              <input
                id="studyHoursInput"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                placeholder="e.g. 5.5"
                required
              />
              <span className="unit-label">hrs</span>
            </div>
          </div>

          <div className="presets-container">
            <span className="presets-label">Quick select:</span>
            <div className="preset-chips">
              {presets.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`preset-btn ${parseFloat(studyHours) === h ? 'active' : ''}`}
                  onClick={() => setStudyHours(h.toFixed(1))}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Calculating...</span>
              </>
            ) : (
              <span>Predict Outcome</span>
            )}
          </button>
        </form>

        {error && (
          <div className="alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className={`result-box ${isPass ? 'result-pass' : 'result-fail'}`}>
            <div className="result-header">
              <span className="result-title">Predicted Result</span>
              <span className={`outcome-badge ${isPass ? 'outcome-pass' : 'outcome-fail'}`}>
                {isPass ? 'PASS' : 'FAIL'}
              </span>
            </div>

            <div className="probability-section">
              <div className="prob-label-row">
                <span>Pass Probability</span>
                <span className="prob-number">{passPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${isPass ? 'fill-pass' : 'fill-fail'}`}
                  style={{ width: `${passPercent}%` }}
                ></div>
              </div>
            </div>

            <p className="result-advice">
              {isPass
                ? 'Great! The model predicts a high likelihood of passing with this study schedule.'
                : 'Caution: The current study hours may not be sufficient based on historical student records.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
