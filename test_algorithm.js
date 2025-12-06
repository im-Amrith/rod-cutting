// Test the rod cutting algorithm
function rodCuttingTest(prices, n) {
    const r = new Array(n + 1).fill(0);
    const s = new Array(n + 1).fill(0);
    
    console.log("Input prices:", prices);
    console.log("Rod length:", n);
    console.log();
    
    for (let i = 1; i <= n; i++) {
        let maxRevenue = 0;
        
        console.log(`\n=== Processing rod length ${i} ===`);
        
        for (let j = 1; j <= i; j++) {
            const currentRevenue = prices[j - 1] + r[i - j];
            console.log(`j=${j}: price[${j}] + r[${i-j}] = ${prices[j-1]} + ${r[i-j]} = ${currentRevenue}`);
            
            if (currentRevenue > maxRevenue) {
                maxRevenue = currentRevenue;
                s[i] = j;
                console.log(`  -> New best! maxRevenue = ${maxRevenue}, s[${i}] = ${j}`);
            }
        }
        
        r[i] = maxRevenue;
        console.log(`Final: r[${i}] = ${maxRevenue}, s[${i}] = ${s[i]}`);
    }
    
    console.log("\n=== FINAL RESULTS ===");
    console.log("r array:", r);
    console.log("s array:", s);
    
    // Expected results based on the image
    const expectedR = [0, 1, 5, 8, 10, 13, 17, 18, 22, 25, 30];
    const expectedS = [0, 1, 2, 3, 2, 2, 6, 1, 2, 3, 10];
    
    console.log("\n=== COMPARISON ===");
    console.log("Expected r:", expectedR);
    console.log("Actual r:  ", r);
    console.log("r arrays match:", JSON.stringify(r) === JSON.stringify(expectedR));
    
    console.log("Expected s:", expectedS);
    console.log("Actual s:  ", s);
    console.log("s arrays match:", JSON.stringify(s) === JSON.stringify(expectedS));
    
    return { r, s };
}

// Test with the standard example
const prices = [1, 5, 8, 9, 10, 17, 17, 20, 24, 30];
const n = 10;

rodCuttingTest(prices, n);