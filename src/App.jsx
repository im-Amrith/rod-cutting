import React from 'react';
// Import your existing component
// Ensure RodCuttingVisualization.jsx has "export default function..." inside it!
import RodCuttingVisualization from "./RodCuttingVisualization";
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
       {/* This renders your algorithm visualization */}
       <RodCuttingVisualization />
    </div>
  );
}

export default App;