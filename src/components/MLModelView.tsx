/**
 * =========================================================================================
 * SetiMitra (शेतीमित्र) - Machine Learning Model Training & Inference Studio
 * =========================================================================================
 * 
 * Capabilities:
 *   1. Train the Multivariate Ridge Regression Model with customizable hyperparameters
 *      (Epochs, Learning Rate, L2 Lambda penalty, Mini-batch size).
 *   2. Live real-time training animation displaying loss convergence, RMSE, and R^2 score.
 *   3. Interactive feature weights visualization highlighting economic price drivers.
 *   4. Crop Price & Wholesale Demand Inference engine with actionable farmer advisory.
 *   5. Full Trilingual localization in Marathi, Hindi, and English.
 * =========================================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  Cpu,
  Sliders,
  Play,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Calendar,
  CloudRain,
  Thermometer,
  Truck,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Language, MLModelHyperparams, MLModelMetrics, MLPredictionInput, MLPredictionOutput } from '../types';
import { agriculturalMLModel, FEATURE_NAMES } from '../ml/agriculturalModel';
import { getTranslation } from '../utils/translations';

interface MLModelViewProps {
  lang: Language;
}

export const MLModelView: React.FC<MLModelViewProps> = ({ lang }) => {
  const t = getTranslation(lang);

  // Training Hyperparameters state
  const [hyperparams, setHyperparams] = useState<MLModelHyperparams>({
    epochs: 150,
    learningRate: 0.045,
    l2Regularization: 0.015,
    batchSize: 8
  });

  // Training execution state
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<{
    epoch: number;
    totalEpochs: number;
    loss: number;
    r2Score: number;
  }>({
    epoch: 150,
    totalEpochs: 150,
    loss: 0.048,
    r2Score: 0.942
  });

  // Model evaluation metrics state
  const [metrics, setMetrics] = useState<MLModelMetrics>(agriculturalMLModel.getMetrics());

  // Inference / Prediction input form state
  const [predictionInput, setPredictionInput] = useState<MLPredictionInput>({
    cropName: 'Tomato',
    season: 'Kharif',
    rainfallMm: 65,
    tempCelsius: 28,
    mandiArrivalsQtl: 950,
    fuelIndex: 94,
    festiveFactor: 1.25,
    shelfLifeDays: 5,
    soilNitrogen: 110
  });

  // Inference prediction result state
  const [predictionResult, setPredictionResult] = useState<MLPredictionOutput | null>(null);

  // Initialize prediction on load
  useEffect(() => {
    runInference();
  }, []);

  // Handler to initiate real Machine Learning model training
  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      const trainedMetrics = await agriculturalMLModel.train(
        undefined, // Uses comprehensive agricultural dataset
        hyperparams,
        progress => {
          setTrainingProgress(progress);
        }
      );
      setMetrics(trainedMetrics);
      // Re-run inference with newly trained parameters
      runInference();
    } catch (err) {
      console.error('Training failed:', err);
    } finally {
      setIsTraining(false);
    }
  };

  // Handler to run forward inference
  const runInference = () => {
    const result = agriculturalMLModel.predict(predictionInput);
    setPredictionResult(result);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* View Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold mb-3">
            <BrainCircuit className="w-4 h-4" />
            <span>Trained Machine Learning Model</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.mlViewTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {t.mlViewSubtitle}
          </p>
        </div>
      </div>

      {/* Grid: 1. Training Studio, 2. Model Metrics & Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ML Training Studio (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">{t.mlTrainingStudio}</h2>
                <span className="text-xs text-stone-500">Multivariate Ridge Regression • Gradient Descent</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {metrics.isTrained ? 'Status: Trained & Active' : 'Status: Untrained'}
            </span>
          </div>

          {/* Hyperparameters Sliders */}
          <div className="space-y-4 mb-6 text-xs">
            <h3 className="font-bold text-stone-700 uppercase tracking-wider">{t.mlHyperparams}</h3>

            {/* Epochs Slider */}
            <div>
              <div className="flex justify-between font-semibold text-stone-700 mb-1">
                <span>{t.mlEpochs}</span>
                <span className="font-mono text-emerald-800 font-bold">{hyperparams.epochs} Epochs</span>
              </div>
              <input
                type="range"
                min="30"
                max="400"
                step="10"
                value={hyperparams.epochs}
                disabled={isTraining}
                onChange={e => setHyperparams({ ...hyperparams, epochs: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Learning Rate Slider */}
            <div>
              <div className="flex justify-between font-semibold text-stone-700 mb-1">
                <span>{t.mlLearningRate}</span>
                <span className="font-mono text-emerald-800 font-bold">{hyperparams.learningRate}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.15"
                step="0.005"
                value={hyperparams.learningRate}
                disabled={isTraining}
                onChange={e => setHyperparams({ ...hyperparams, learningRate: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* L2 Regularization Lambda Slider */}
            <div>
              <div className="flex justify-between font-semibold text-stone-700 mb-1">
                <span>{t.mlL2Reg}</span>
                <span className="font-mono text-emerald-800 font-bold">{hyperparams.l2Regularization}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.08"
                step="0.005"
                value={hyperparams.l2Regularization}
                disabled={isTraining}
                onChange={e => setHyperparams({ ...hyperparams, l2Regularization: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Train Button & Progress */}
          <div className="space-y-4">
            <button
              id="train-ml-model-btn"
              onClick={handleTrainModel}
              disabled={isTraining}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                isTraining
                  ? 'bg-amber-600 text-white cursor-wait'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer'
              }`}
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.trainingInProgress}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.trainModelBtn}</span>
                </>
              )}
            </button>

            {/* Training Progress Bar */}
            {isTraining && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-stone-700">
                  <span>Epoch {trainingProgress.epoch} of {trainingProgress.totalEpochs}</span>
                  <span className="text-emerald-700 font-mono">
                    Loss: {trainingProgress.loss.toFixed(4)} | R²: {(trainingProgress.r2Score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${(trainingProgress.epoch / trainingProgress.totalEpochs) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Loss Convergence Curve (SVG) */}
          <div className="mt-6 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                {t.lossCurveTitle}
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                Final Loss: {metrics.finalLoss} • RMSE: {metrics.rmse}
              </span>
            </div>

            <div className="h-32 w-full bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-end relative overflow-hidden">
              {metrics.lossHistory && metrics.lossHistory.length > 0 ? (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2="400" y2="25" stroke="#e5e7eb" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#e5e7eb" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="400" y2="75" stroke="#e5e7eb" strokeDasharray="3 3" />

                  {/* Polyline plotting loss across epochs */}
                  <polyline
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={metrics.lossHistory
                      .map((h, idx, arr) => {
                        const x = (idx / (arr.length - 1 || 1)) * 390 + 5;
                        const maxLoss = Math.max(...arr.map(a => a.loss)) || 1;
                        const y = 90 - (h.loss / maxLoss) * 80;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              ) : (
                <div className="w-full text-center text-xs text-stone-400 my-auto">
                  Click 'Train ML Model' to generate real-time loss curve
                </div>
              )}
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono px-1">
              <span>Epoch 1 (High Loss)</span>
              <span>Gradient Descent Convergence</span>
              <span>Epoch {metrics.epochsCompleted} (Optimal Loss)</span>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics & Mathematical Weights (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Metrics summary card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Model Accuracy & Evaluation Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="text-stone-500 block">{t.metricsR2}</span>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  {(metrics.r2Score * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">High Predictive Fit</span>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                <span className="text-stone-500 block">{t.metricsRMSE}</span>
                <span className="text-xl font-black text-blue-900 font-mono">
                  ±₹{metrics.rmse}
                </span>
                <span className="text-[10px] text-blue-700 block mt-0.5">Per Kg Error Margin</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">{t.metricsSamples}</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {metrics.trainingSamplesCount} Records
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Trained Bias (b):</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {metrics.bias}
                </span>
              </div>
            </div>
          </div>

          {/* Feature Importance Weights */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200 text-xs">
            <h3 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-700" />
              Learned Mathematical Feature Weights
            </h3>
            <p className="text-stone-500 text-[11px] mb-3 leading-relaxed">
              Weights reflect economic sensitivity. Negative weights show downward pressure (like heavy arrivals), while positive weights reflect festive/fuel inflation.
            </p>

            <div className="space-y-2.5 font-mono">
              {Object.entries(metrics.featureWeights).map(([feat, w]) => {
                const isNegative = w < 0;
                return (
                  <div key={feat} className="flex items-center justify-between text-xs">
                    <span className="text-stone-700 truncate max-w-[140px]">{feat}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isNegative ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {w >= 0 ? `+${w.toFixed(3)}` : w.toFixed(3)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Inference & Crop Price Prediction Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">{t.predictFormTitle}</h2>
            <p className="text-xs text-stone-500">
              Enter real farm parameters to evaluate the trained ML model's fair farm-gate pricing and market advisory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Crop Select */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">{t.inputCrop}</label>
              <select
                value={predictionInput.cropName}
                onChange={e => setPredictionInput({ ...predictionInput, cropName: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl bg-white text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="Tomato">Tomato (टोमॅटो)</option>
                <option value="Onion">Onion (कांदा)</option>
                <option value="Potato">Potato (बटाटा)</option>
                <option value="Green Chilli">Green Chilli (हिरवी मिरची)</option>
                <option value="Capsicum">Capsicum / Shimla Mirch (ढोबळी मिरची)</option>
                <option value="Ginger">Ginger (आले / अदरक)</option>
                <option value="Garlic">Garlic (लसूण)</option>
                <option value="Cauliflower">Cauliflower (फ्लॉवर)</option>
                <option value="Cabbage">Cabbage (कोबी)</option>
                <option value="Brinjal">Brinjal (वांगी / बैंगन)</option>
                <option value="Okra (Bhendi)">Okra / Bhendi (भेंडी)</option>
                <option value="Grapes">Grapes (द्राक्षे / अंगूर)</option>
              </select>
            </div>

            {/* Season Select */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">Crop Season:</label>
              <select
                value={predictionInput.season}
                onChange={e => setPredictionInput({ ...predictionInput, season: e.target.value as any })}
                className="w-full p-2.5 border border-stone-300 rounded-xl bg-white text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="Kharif">Kharif (Monsoon Crop)</option>
                <option value="Rabi">Rabi (Winter Harvest)</option>
                <option value="Zaid">Zaid (Summer Short Season)</option>
              </select>
            </div>

            {/* Rainfall */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>{t.inputRainfall}</span>
                <span className="font-mono text-emerald-800">{predictionInput.rainfallMm} mm</span>
              </label>
              <input
                type="range"
                min="0"
                max="250"
                value={predictionInput.rainfallMm}
                onChange={e => setPredictionInput({ ...predictionInput, rainfallMm: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>{t.inputTemp}</span>
                <span className="font-mono text-emerald-800">{predictionInput.tempCelsius} °C</span>
              </label>
              <input
                type="range"
                min="14"
                max="45"
                value={predictionInput.tempCelsius}
                onChange={e => setPredictionInput({ ...predictionInput, tempCelsius: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Mandi Arrivals */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>{t.inputArrivals}</span>
                <span className="font-mono text-emerald-800">{predictionInput.mandiArrivalsQtl} Qtl</span>
              </label>
              <input
                type="range"
                min="50"
                max="4000"
                step="50"
                value={predictionInput.mandiArrivalsQtl}
                onChange={e => setPredictionInput({ ...predictionInput, mandiArrivalsQtl: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Festive Factor */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>{t.inputFestive}</span>
                <span className="font-mono text-emerald-800">{(predictionInput.festiveFactor * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="1.8"
                step="0.05"
                value={predictionInput.festiveFactor}
                onChange={e => setPredictionInput({ ...predictionInput, festiveFactor: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                id="run-ml-prediction-btn"
                onClick={runInference}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>{t.predictNowBtn}</span>
              </button>
            </div>
          </div>

          {/* Output Card (5 Cols) */}
          <div className="lg:col-span-5 bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
            {predictionResult ? (
              <div className="space-y-4">
                <div className="border-b border-stone-200 pb-3">
                  <span className="text-xs text-stone-500 font-semibold block">{t.predictionResultsTitle}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-emerald-800 font-mono">
                      ₹{predictionResult.predictedPricePerKg}
                    </span>
                    <span className="text-xs text-stone-600 font-bold">/ kg (Farm Gate)</span>
                  </div>
                  <span className="text-xs text-stone-500 block">
                    Confidence Range: ₹{predictionResult.confidenceRange.min} - ₹{predictionResult.confidenceRange.max} / kg
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                    <span className="text-stone-500 block">{t.predictedDemand}</span>
                    <span className="font-bold text-stone-900 text-sm">{predictionResult.predictedDemandScore} / 100</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Level: {predictionResult.demandLevel}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                    <span className="text-stone-500 block">{t.predictedYield}</span>
                    <span className="font-bold text-stone-900 text-sm font-mono">
                      {predictionResult.predictedYieldPerAcreQtl} Qtl
                    </span>
                    <span className="text-[10px] text-stone-500 block">Per Acre Harvest</span>
                  </div>
                </div>

                {/* Key Price Drivers */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-stone-800 block">Key Contributing Factors:</span>
                  {predictionResult.primaryPriceDrivers.map((d, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white border border-stone-200 flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        d.impact === 'positive' ? 'bg-emerald-600' : 'bg-red-500'
                      }`} />
                      <div>
                        <span className="font-bold text-stone-800 block text-[11px]">{d.factor}</span>
                        <p className="text-[10px] text-stone-600 leading-tight">{d.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strategic Advice */}
                <div className="p-3 bg-emerald-900 text-emerald-50 rounded-xl text-xs">
                  <span className="font-bold block mb-1 text-emerald-300">{t.actionableAdvice}</span>
                  <p className="text-[11px] leading-relaxed opacity-95">
                    {predictionResult.marketAdvice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center my-auto py-12 text-stone-400 text-xs">
                Select crop and parameters to run real-time inference
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
