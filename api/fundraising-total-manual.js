// Simple API endpoint - manually update the amount below when it changes
// Much simpler than trying to scrape a JavaScript-heavy page

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ⬇️ UPDATE THESE VALUES WHEN THE FUNDRAISING TOTAL CHANGES ⬇️
    const amountRaised = "$186,578";
    const goal = "$250,000";
    // ⬆️ UPDATE THESE VALUES WHEN THE FUNDRAISING TOTAL CHANGES ⬆️
    
    // Calculate numeric values and percentage
    const numericAmount = parseFloat(amountRaised.replace(/[$,]/g, ''));
    const numericGoal = goal ? parseFloat(goal.replace(/[$,]/g, '')) : null;
    const percentage = numericGoal ? Math.round((numericAmount / numericGoal) * 100) : null;

    res.status(200).json({
      success: true,
      amountRaised: amountRaised,
      amountRaisedNumeric: numericAmount,
      goal: goal,
      goalNumeric: numericGoal,
      percentage: percentage,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to read fundraising data'
    });
  }
}
