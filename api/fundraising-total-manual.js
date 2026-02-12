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
    // Fetch the fundraising page with more realistic headers
    const response = await fetch('https://fundraisemyway.cancer.ca/campaigns/scoreforcancer', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Try multiple patterns to find the amount
    let amountRaised = null;
    let goal = null;
    
    // Pattern 1: $186,578 RAISED
    let match = html.match(/\$[\d,]+\s+RAISED/i);
    if (match) {
      amountRaised = match[0].replace(/\s+RAISED/i, '').trim();
    }
    
    // Pattern 2: Try finding just currency amounts
    if (!amountRaised) {
      match = html.match(/\$[\d,]+\.?\d*/);
      if (match) {
        amountRaised = match[0];
      }
    }
    
    // Pattern 3: Look for JSON data in script tags
    if (!amountRaised) {
      const scriptMatch = html.match(/"amountRaised":\s*"?\$?([\d,]+)/i);
      if (scriptMatch) {
        amountRaised = '$' + scriptMatch[1];
      }
    }
    
    // Find goal
    const goalMatch = html.match(/GOAL\s+\$[\d,]+/i);
    if (goalMatch) {
      goal = goalMatch[0].replace(/GOAL\s+/i, '').trim();
    }
    
    if (!amountRaised) {
      // Return diagnostic info to help debug
      const preview = html.substring(0, 1000);
      throw new Error(`Could not find amount raised. HTML preview: ${preview}`);
    }

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
