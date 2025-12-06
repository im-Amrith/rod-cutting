# Rod Cutting Algorithm Visualization

A complete, single-file React web application that visualizes the Rod Cutting dynamic programming algorithm with interactive D3.js visualizations.

## Features

- **Interactive Configuration**: Input rod length and prices for each piece length
- **Step-by-Step Visualization**: Watch the algorithm execute with detailed explanations
- **D3.js Visualizations**: 
  - Revenue table (r) with color-coded highlighting
  - Cuts table (s) showing optimal cut positions
  - Final rod visualization with optimal cuts
- **Playback Controls**: Play/Pause, Next/Previous step, Reset, and scrubbing slider
- **Pseudo-code Display**: Shows the algorithm with highlighted current line
- **Responsive Design**: Modern dark theme with Tailwind CSS

## How to Use

1. **Open the Application**: Open `index.html` in a web browser
2. **Configure Input**: 
   - Set the rod length (1-15)
   - Enter space-separated prices for each piece length
3. **Start Visualization**: Click "Visualize Algorithm"
4. **Control Playback**: Use the control buttons or slider to navigate through steps
5. **View Results**: See the optimal cuts and maximum revenue at the end

## Example Input

- **Rod Length**: 8
- **Prices**: `1 5 8 9 10 17 17 20`

This means:
- Length 1 piece costs 1
- Length 2 piece costs 5
- Length 3 piece costs 8
- And so on...

## Algorithm Explanation

The Rod Cutting problem finds the optimal way to cut a rod of length n to maximize revenue. The dynamic programming solution:

1. Creates two arrays: `r[i]` (maximum revenue for length i) and `s[i]` (optimal first cut for length i)
2. For each rod length i from 1 to n:
   - Try all possible first cuts j from 1 to i
   - Calculate revenue as `price[j-1] + r[i-j]`
   - Keep track of the maximum revenue and corresponding cut
3. Reconstruct the optimal solution using the `s` array

## Technical Details

- **React**: Functional components with hooks (useState, useEffect, useRef)
- **D3.js v7**: Loaded dynamically via script tag for SVG visualizations
- **Tailwind CSS**: For responsive styling and dark theme
- **Single File**: Complete application in one .jsx file
- **No External Dependencies**: All components defined within the main file

## File Structure

```
├── RodCuttingVisualization.jsx  # Main React application
├── index.html                   # HTML file to run the app
└── README.md                    # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript features
- React 18
- D3.js v7
- CSS Grid and Flexbox
