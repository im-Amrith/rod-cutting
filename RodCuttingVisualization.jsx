const { useState, useEffect, useRef, useMemo } = React;

// SVG Icon Components
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const NextIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const PrevIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ResetIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

// Pseudo-code component
const PseudoCode = ({ highlightedLine }) => {
  const pseudoCode = [
    "1. function rodCutting(prices, n):",
    "2.     r = array of size n+1, initialized to 0",
    "3.     s = array of size n+1, initialized to 0",
    "4.     for i = 1 to n:",
    "5.         maxRevenue = 0",
    "6.         for j = 1 to i:",
    "7.             if prices[j-1] + r[i-j] > maxRevenue:",
    "8.                 maxRevenue = prices[j-1] + r[i-j]",
    "9.                 s[i] = j",
    "10.        r[i] = maxRevenue",
    "11.    return r, s"
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">Algorithm Pseudo-code</h3>
      <div className="font-mono text-sm space-y-1">
        {pseudoCode.map((line, index) => (
          <div
            key={index}
            className={`px-2 py-1 rounded ${
              highlightedLine === index + 1
                ? 'bg-yellow-600 text-black'
                : 'text-gray-300'
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [rodLength, setRodLength] = useState(10);
  const [pricesInput, setPricesInput] = useState('1 5 8 9 10 17 17 20 24 30');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [error, setError] = useState('');
  const [d3Loaded, setD3Loaded] = useState(false);

  const revenueTableRef = useRef(null);
  const cutsTableRef = useRef(null);
  const rodVisualizationRef = useRef(null);
  const intervalRef = useRef(null);

  // Load D3.js dynamically
  useEffect(() => {
    if (window.d3) {
      setD3Loaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = () => setD3Loaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Generate algorithm steps
  const generateSteps = (prices, n) => {
    const steps = [];
    const r = new Array(n + 1).fill(0);
    const s = new Array(n + 1).fill(0);
    
    let stepCounter = 0;

    // Helper function to get current rod visualization
    const getCurrentRodVisualization = (currentI, currentJ, currentR, currentS) => {
      if (currentI === 0) {
        return { showRod: false, rodLength: 0, cuts: [] };
      }
      
      // Show rod of current length being processed
      const rodLength = currentI;
      const cuts = [];
      
      // If we have a cut decision for this length, show it
      if (currentS[currentI] > 0) {
        let remaining = currentI;
        while (remaining > 0 && currentS[remaining] > 0) {
          const cutLength = currentS[remaining];
          cuts.push(cutLength);
          remaining -= cutLength;
        }
        // If we couldn't complete the cuts, show the current segment being considered
        if (remaining > 0) {
          cuts.push(remaining);
        }
      } else {
        // Show the current segment being considered
        if (currentJ > 0) {
          cuts.push(currentJ);
          if (currentI - currentJ > 0) {
            cuts.push(currentI - currentJ);
          }
        } else {
          cuts.push(currentI);
        }
      }
      
      return { showRod: true, rodLength, cuts };
    };

    // Initial state
    steps.push({
      r: [...r],
      s: [...s],
      i: 0,
      j: 0,
      description: "Initializing arrays r and s with zeros",
      highlightedLine: 2,
      stepNumber: stepCounter++,
      rodVisualization: getCurrentRodVisualization(0, 0, r, s)
    });

    for (let i = 1; i <= n; i++) {
      let maxRevenue = 0;
      
      steps.push({
        r: [...r],
        s: [...s],
        i: i,
        j: 0,
        description: `Starting calculation for rod of length ${i}`,
        highlightedLine: 4,
        stepNumber: stepCounter++,
        rodVisualization: getCurrentRodVisualization(i, 0, r, s)
      });

      for (let j = 1; j <= i; j++) {
        const currentRevenue = prices[j - 1] + r[i - j];
        
        steps.push({
          r: [...r],
          s: [...s],
          i: i,
          j: j,
          description: `Checking if cutting at length ${j} gives better revenue: ${prices[j-1]} + r[${i-j}] = ${currentRevenue}`,
          highlightedLine: 7,
          stepNumber: stepCounter++,
          rodVisualization: getCurrentRodVisualization(i, j, r, s)
        });

        if (currentRevenue > maxRevenue) {
          maxRevenue = currentRevenue;
          s[i] = j;
          
          steps.push({
            r: [...r],
            s: [...s],
            i: i,
            j: j,
            description: `New best revenue found! Setting s[${i}] = ${j}`,
            highlightedLine: 9,
            stepNumber: stepCounter++,
            rodVisualization: getCurrentRodVisualization(i, j, r, s)
          });
        }
      }
      
      r[i] = maxRevenue;
      
      steps.push({
        r: [...r],
        s: [...s],
        i: i,
        j: 0,
        description: `Final revenue for length ${i}: r[${i}] = ${maxRevenue}`,
        highlightedLine: 10,
        stepNumber: stepCounter++,
        rodVisualization: getCurrentRodVisualization(i, 0, r, s)
      });
    }

    return steps;
  };

  // Handle visualization start
  const handleVisualize = () => {
    setError('');
    
    const prices = pricesInput.trim().split(/\s+/).map(p => parseFloat(p));
    
    if (prices.length < rodLength) {
      setError(`Please provide at least ${rodLength} prices (one for each possible cut length)`);
      return;
    }
    
    if (prices.some(p => isNaN(p) || p < 0)) {
      setError('All prices must be non-negative numbers');
      return;
    }

    const generatedSteps = generateSteps(prices, rodLength);
    setSteps(generatedSteps);
    setCurrentStep(0);
    setShowVisualization(true);
  };

  // Playback controls
  const playPause = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };

  const handleSliderChange = (e) => {
    setCurrentStep(parseInt(e.target.value));
  };

  // D3 visualization effects
  useEffect(() => {
    if (!d3Loaded || !showVisualization || steps.length === 0) return;

    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    // Render revenue table
    if (revenueTableRef.current) {
      const svg = d3.select(revenueTableRef.current);
      svg.selectAll("*").remove();

      const width = 400;
      const height = 60;
      const cellWidth = width / (currentStepData.r.length + 1);

      svg.attr("width", width).attr("height", height);

      // Draw cells
      svg.selectAll("rect")
        .data(currentStepData.r)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * cellWidth)
        .attr("y", 10)
        .attr("width", cellWidth - 2)
        .attr("height", 40)
        .attr("fill", (d, i) => {
          if (i === currentStepData.i) return "#06b6d4"; // cyan for current
          if (i === currentStepData.i - currentStepData.j && currentStepData.j > 0) return "#8b5cf6"; // purple for comparison
          return "#374151"; // gray for others
        })
        .attr("stroke", "#6b7280")
        .attr("stroke-width", 1);

      // Draw values
      svg.selectAll("text")
        .data(currentStepData.r)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "12")
        .text(d => d);

      // Draw indices
      svg.selectAll(".index")
        .data(currentStepData.r)
        .enter()
        .append("text")
        .attr("class", "index")
        .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .attr("font-size", "10")
        .text((d, i) => i);
    }

    // Render cuts table
    if (cutsTableRef.current) {
      const svg = d3.select(cutsTableRef.current);
      svg.selectAll("*").remove();

      const width = 400;
      const height = 60;
      const cellWidth = width / (currentStepData.s.length + 1);

      svg.attr("width", width).attr("height", height);

      // Draw cells
      svg.selectAll("rect")
        .data(currentStepData.s)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * cellWidth)
        .attr("y", 10)
        .attr("width", cellWidth - 2)
        .attr("height", 40)
        .attr("fill", (d, i) => {
          if (i === currentStepData.i) return "#06b6d4"; // cyan for current
          return "#374151"; // gray for others
        })
        .attr("stroke", "#6b7280")
        .attr("stroke-width", 1);

      // Draw values
      svg.selectAll("text")
        .data(currentStepData.s)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "12")
        .text(d => d);

      // Draw indices
      svg.selectAll(".index")
        .data(currentStepData.s)
        .enter()
        .append("text")
        .attr("class", "index")
        .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .attr("font-size", "10")
        .text((d, i) => i);
    }

    // Render rod visualization for current step
    if (rodVisualizationRef.current && currentStepData.rodVisualization) {
      const svg = d3.select(rodVisualizationRef.current);
      svg.selectAll("*").remove();

      const width = 400;
      const height = 100;
      const colors = d3.scaleOrdinal(d3.schemeCategory10);

      svg.attr("width", width).attr("height", height);

      const { showRod, rodLength, cuts } = currentStepData.rodVisualization;

      if (showRod && rodLength > 0) {
        const segmentWidth = width / rodLength;
        let currentX = 0;

        cuts.forEach((cutLength, index) => {
          const segmentWidthPx = cutLength * segmentWidth;
          
          // Different colors for different types of cuts
          let fillColor;
          if (currentStep === steps.length - 1) {
            // Final step - show optimal cuts
            fillColor = colors(index);
          } else if (currentStepData.j > 0 && index === 0) {
            // Current cut being considered
            fillColor = "#f59e0b"; // amber
          } else {
            // Other cuts
            fillColor = colors(index);
          }
          
          svg.append("rect")
            .attr("x", currentX)
            .attr("y", 20)
            .attr("width", segmentWidthPx - 2)
            .attr("height", 60)
            .attr("fill", fillColor)
            .attr("stroke", "#6b7280")
            .attr("stroke-width", 2);

          svg.append("text")
            .attr("x", currentX + segmentWidthPx / 2)
            .attr("y", 55)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12")
            .attr("font-weight", "bold")
            .text(cutLength);

          currentX += segmentWidthPx;
        });

        // Add rod length label
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .attr("fill", "#9ca3af")
          .attr("font-size", "10")
          .text(`Rod Length: ${rodLength}`);
      } else {
        // Show message when no rod to display
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("fill", "#6b7280")
          .attr("font-size", "14")
          .text("No rod to display");
      }
    }
  }, [currentStep, steps, d3Loaded, showVisualization, rodLength]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!d3Loaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading D3.js...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
          Rod Cutting Algorithm Visualization
        </h1>

        {!showVisualization ? (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rod Length (1-15):
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={rodLength}
                  onChange={(e) => setRodLength(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Prices (space-separated):
                </label>
                <input
                  type="text"
                  value={pricesInput}
                  onChange={(e) => setPricesInput(e.target.value)}
                  placeholder="e.g., 1 5 8 9 10 17 17 20 24 30"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                onClick={handleVisualize}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Visualize Algorithm
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Playback Controls */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={playPause}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md transition-colors"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    onClick={prevStep}
                    className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md transition-colors"
                  >
                    <PrevIcon />
                  </button>
                  <button
                    onClick={nextStep}
                    className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md transition-colors"
                  >
                    <NextIcon />
                  </button>
                  <button
                    onClick={reset}
                    className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md transition-colors"
                  >
                    <ResetIcon />
                  </button>
                </div>
                
                <div className="text-sm text-gray-300">
                  Step {currentStep + 1} / {steps.length}
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={steps.length - 1}
                value={currentStep}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Explanation and Pseudo-code */}
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Current Step</h3>
                  <p className="text-gray-300">
                    {steps[currentStep]?.description || "No step data available"}
                  </p>
                </div>

                <PseudoCode highlightedLine={steps[currentStep]?.highlightedLine} />
              </div>

              {/* Right Column - Visualizations */}
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Revenue Table (r)</h3>
                  <svg ref={revenueTableRef} className="w-full"></svg>
                  <div className="mt-2 text-sm text-gray-400">
                    <span className="inline-block w-4 h-4 bg-cyan-500 mr-2"></span>
                    Current index (i)
                    <span className="inline-block w-4 h-4 bg-purple-500 ml-4 mr-2"></span>
                    Comparison index (i-j)
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Cuts Table (s)</h3>
                  <svg ref={cutsTableRef} className="w-full"></svg>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {currentStep === steps.length - 1 ? "Optimal Rod Cuts" : "Current Rod State"}
                  </h3>
                  <svg ref={rodVisualizationRef} className="w-full"></svg>
                  <div className="mt-2 text-sm text-gray-400">
                    {currentStep === steps.length - 1 ? (
                      <>Maximum revenue: {steps[currentStep]?.r[rodLength]}</>
                    ) : (
                      <>Current step: Processing rod of length {steps[currentStep]?.i || 0}</>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="inline-block w-3 h-3 bg-amber-500 mr-2"></span>
                    Current cut being considered
                    <span className="inline-block w-3 h-3 bg-blue-500 ml-4 mr-2"></span>
                    Other segments
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Calculation Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Step-by-Step Calculation Table</h3>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Use this table to check your calculations while solving the problem manually
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 px-3 font-semibold">Step</th>
                      <th className="text-left py-2 px-3 font-semibold">Rod Length (i)</th>
                      <th className="text-left py-2 px-3 font-semibold">Cut Length (j)</th>
                      <th className="text-left py-2 px-3 font-semibold">Calculation</th>
                      <th className="text-left py-2 px-3 font-semibold">Revenue</th>
                      <th className="text-left py-2 px-3 font-semibold">Best Cut</th>
                      <th className="text-left py-2 px-3 font-semibold">Max Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step, index) => {
                      // Only show steps that involve actual calculations
                      if (step.j === 0 && step.i > 0 && !step.description.includes('Final revenue')) {
                        return null; // Skip initialization steps for each i
                      }
                      
                      const isCurrentStep = index === currentStep;
                      const isCompletedStep = index < currentStep;
                      
                      let calculationText = '';
                      let revenueValue = '';
                      
                      if (step.j > 0) {
                        const prices = pricesInput.trim().split(/\s+/).map(p => parseFloat(p));
                        const priceAtJ = prices[step.j - 1];
                        const previousRevenue = step.r[step.i - step.j];
                        calculationText = `price[${step.j}] + r[${step.i - step.j}] = ${priceAtJ} + ${previousRevenue}`;
                        revenueValue = priceAtJ + previousRevenue;
                      }
                      
                      return (
                        <tr 
                          key={index} 
                          className={`border-b border-gray-700 ${
                            isCurrentStep ? 'bg-blue-900/30 border-blue-500' : 
                            isCompletedStep ? 'bg-green-900/20' : 'bg-gray-800/50'
                          }`}
                        >
                          <td className="py-2 px-3">
                            <span className={`inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                              isCurrentStep ? 'bg-blue-500 text-white' :
                              isCompletedStep ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                            }`}>
                              {step.stepNumber + 1}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono">{step.i || '-'}</td>
                          <td className="py-2 px-3 font-mono">{step.j || '-'}</td>
                          <td className="py-2 px-3 font-mono text-xs">{calculationText || step.description}</td>
                          <td className="py-2 px-3 font-mono">{revenueValue || '-'}</td>
                          <td className="py-2 px-3 font-mono">{step.s[step.i] || '-'}</td>
                          <td className="py-2 px-3 font-mono font-semibold text-green-400">
                            {step.r[step.i] !== undefined ? step.r[step.i] : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-blue-900/30 p-3 rounded border border-blue-500">
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                    <span className="font-semibold">Current Step</span>
                  </div>
                  <p className="text-gray-300">The step currently being visualized above</p>
                </div>
                <div className="bg-green-900/20 p-3 rounded border border-green-500">
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-semibold">Completed Steps</span>
                  </div>
                  <p className="text-gray-300">Steps that have been calculated and stored</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-4 h-4 bg-gray-600 rounded-full mr-2"></span>
                    <span className="font-semibold">Future Steps</span>
                  </div>
                  <p className="text-gray-300">Steps to be calculated as algorithm progresses</p>
                </div>
              </div>
            </div>

            {/* Final Results Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Final Results Table</h3>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Complete solution showing optimal revenues and cut decisions
              </p>
              
              <div className="overflow-x-auto">
                <div className="bg-gray-900 p-4 rounded-lg border-2 border-gray-600">
                  {/* Index row */}
                  <div className="mb-4">
                    <div className="grid grid-flow-col auto-cols-max gap-1 justify-start">
                      <div className="w-12 h-10 flex items-center justify-center bg-gray-700 border border-gray-500 text-xs font-semibold">
                        i
                      </div>
                      {steps.length > 0 && steps[steps.length - 1].r.map((_, index) => (
                        <div key={index} className="w-12 h-10 flex items-center justify-center bg-gray-700 border border-gray-500 text-xs font-mono">
                          {index}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue row r[i] */}
                  <div className="mb-4">
                    <div className="grid grid-flow-col auto-cols-max gap-1 justify-start">
                      <div className="w-12 h-10 flex items-center justify-center bg-blue-700 border border-blue-500 text-xs font-semibold text-white">
                        r[i]
                      </div>
                      {steps.length > 0 && steps[steps.length - 1].r.map((value, index) => (
                        <div key={index} className="w-12 h-10 flex items-center justify-center bg-blue-600 border border-blue-400 text-xs font-mono text-white font-semibold">
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuts row s[i] */}
                  <div>
                    <div className="grid grid-flow-col auto-cols-max gap-1 justify-start">
                      <div className="w-12 h-10 flex items-center justify-center bg-green-700 border border-green-500 text-xs font-semibold text-white">
                        s[i]
                      </div>
                      {steps.length > 0 && steps[steps.length - 1].s.map((value, index) => (
                        <div key={index} className="w-12 h-10 flex items-center justify-center bg-green-600 border border-green-400 text-xs font-mono text-white font-semibold">
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results explanation */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-900/30 p-4 rounded border border-blue-500">
                  <h4 className="font-semibold text-blue-300 mb-2">Revenue Array (r[i])</h4>
                  <p className="text-sm text-gray-300">
                    r[i] represents the maximum revenue obtainable from a rod of length i.
                  </p>
                  <p className="text-xs text-blue-200 mt-2">
                    Maximum revenue for rod of length {rodLength}: <span className="font-bold text-lg">
                      {steps.length > 0 ? steps[steps.length - 1].r[rodLength] : 0}
                    </span>
                  </p>
                </div>
                <div className="bg-green-900/30 p-4 rounded border border-green-500">
                  <h4 className="font-semibold text-green-300 mb-2">Cut Decision Array (s[i])</h4>
                  <p className="text-sm text-gray-300">
                    s[i] represents the optimal first cut length for a rod of length i.
                  </p>
                  <div className="text-xs text-green-200 mt-2">
                    <p>Optimal cutting sequence for length {rodLength}:</p>
                    <p className="font-mono bg-green-800/50 p-2 rounded mt-1">
                      {steps.length > 0 && (() => {
                        const cuts = [];
                        let remaining = rodLength;
                        const finalS = steps[steps.length - 1].s;
                        while (remaining > 0 && finalS[remaining] > 0) {
                          cuts.push(finalS[remaining]);
                          remaining -= finalS[remaining];
                        }
                        if (remaining > 0) cuts.push(remaining);
                        return cuts.join(' + ') + ` = ${rodLength}`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowVisualization(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
              >
                Back to Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// App component is now globally accessible
