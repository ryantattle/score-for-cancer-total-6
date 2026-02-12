// Vercel Serverless Function to scrape Score for Cancer fundraising total
// This endpoint fetches the current amount raised from the fundraising page

export default async function handler(req, res) {
  // Enable CORS so Framer can call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Fetch the fundraising page
    const response = await fetch('https://fundraisemyway.cancer.ca/campaigns/scoreforcancer', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract the amount raised using regex
    // Looking for pattern like "$186,578 RAISED"
    const amountMatch = html.match(/\$[\d,]+\s+RAISED/i);
    const goalMatch = html.match(/GOAL\s+\$[\d,]+/i);
    
    if (!amountMatch) {
      throw new Error('Could not find amount raised on page');
    }

    // Extract just the dollar amount (remove "RAISED" text)
    const amountRaised = amountMatch[0].replace(/\s+RAISED/i, '').trim();
    const goal = goalMatch ? goalMatch[0].replace(/GOAL\s+/i, '').trim() : null;
    
    // Extract numeric value for calculations
    const numericAmount = parseFloat(amountRaised.replace(/[$,]/g, ''));
    const numericGoal = goal ? parseFloat(goal.replace(/[$,]/g, '')) : null;
    
    // Calculate percentage if we have a goal
    const percentage = numericGoal ? Math.round((numericAmount / numericGoal) * 100) : null;

    // Return the data
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
    console.error('Error fetching fundraising data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch fundraising data'
    });
  }
}
