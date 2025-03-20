const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/analyze-bet-history
 * @desc    Analyze historical betting data based on provided odds
 * @access  Public
 */
router.post('/analyze-bet-history', async (req, res, next) => {
  try {
    const { league, bet_odds } = req.body;
    
    if (!league || !bet_odds) {
      return res.status(400).json({ error: 'League and bet odds are required' });
    }
    
    // Extract bet odds values
    const overUnderData = bet_odds.over && bet_odds.under ? {
      goalLine: bet_odds.over.goal_line,
      overOdd: bet_odds.over.odd,
      underOdd: bet_odds.under.odd
    } : null;
    
    const oddEvenData = bet_odds.odd_goals && bet_odds.even_goals ? {
      oddOdd: bet_odds.odd_goals.odd,
      evenOdd: bet_odds.even_goals.odd
    } : null;
    
    const bttsData = bet_odds.btts_yes && bet_odds.btts_no ? {
      yesOdd: bet_odds.btts_yes.odd,
      noOdd: bet_odds.btts_no.odd
    } : null;
    
    // Query similar historical matches
    const similarMatches = await findSimilarMatches(
      req.prisma,
      league,
      overUnderData,
      oddEvenData,
      bttsData
    );
    
    if (similarMatches.length === 0) {
      return res.status(404).json({ message: 'No similar historical matches found' });
    }
    
    // Calculate success rates
    const results = calculateResults(similarMatches, overUnderData, oddEvenData, bttsData);
    
    // Try to cache results if Redis is available
    if (req.redis) {
      const cacheKey = generateCacheKey(league, bet_odds);
      await req.redis.set(cacheKey, JSON.stringify(results), {
        EX: 3600 // Cache for 1 hour
      });
    }
    
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * Find historical matches with similar betting odds
 */
async function findSimilarMatches(prisma, league, overUnderData, oddEvenData, bttsData) {
  // Define odds similarity threshold (20% instead of 10% to be more flexible)
  const ODDS_THRESHOLD = 0.2;
  
  // Base query
  let query = {
    where: {
      league: {
        contains: league,
        mode: 'insensitive'
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: 100 // Limit results to prevent performance issues
  };
  
  // Add filters based on provided bet types
  if (overUnderData) {
    const { goalLine, overOdd, underOdd } = overUnderData;
    
    // Add over/under filters
    query.where.AND = [
      {
        htouHcap: {
          equals: goalLine
        }
      },
      {
        htou01: {
          gte: overOdd * (1 - ODDS_THRESHOLD),
          lte: overOdd * (1 + ODDS_THRESHOLD)
        }
      },
      {
        htou02: {
          gte: underOdd * (1 - ODDS_THRESHOLD),
          lte: underOdd * (1 + ODDS_THRESHOLD)
        }
      }
    ];
  }
  
  // If we have odd/even data, refine the query
  if (oddEvenData && (!query.where.AND)) {
    query.where.AND = [];
  }
  
  if (oddEvenData) {
    const { oddOdd, evenOdd } = oddEvenData;
    
    // Add odd/even filters
    query.where.AND.push(
      {
        htoe01: {
          gte: oddOdd * (1 - ODDS_THRESHOLD),
          lte: oddOdd * (1 + ODDS_THRESHOLD)
        }
      },
      {
        htoe02: {
          gte: evenOdd * (1 - ODDS_THRESHOLD),
          lte: evenOdd * (1 + ODDS_THRESHOLD)
        }
      }
    );
  }
  
  // If we have BTTS data, refine the query
  if (bttsData && (!query.where.AND)) {
    query.where.AND = [];
  }
  
  if (bttsData) {
    const { yesOdd, noOdd } = bttsData;
    
    // Add BTTS filters
    query.where.AND.push(
      {
        htbg01: {
          gte: yesOdd * (1 - ODDS_THRESHOLD),
          lte: yesOdd * (1 + ODDS_THRESHOLD)
        }
      },
      {
        htbg02: {
          gte: noOdd * (1 - ODDS_THRESHOLD),
          lte: noOdd * (1 + ODDS_THRESHOLD)
        }
      }
    );
  }
  
  return await prisma.matchHistory.findMany(query);
}

/**
 * Calculate success rates for each bet type
 */
function calculateResults(matches, overUnderData, oddEvenData, bttsData) {
  const historicalResults = matches.map(match => {
    const halftimeGoals = match.halftimeGoals;
    const homeHalfGoals = match.homeHalfGoals;
    const awayHalfGoals = match.awayHalfGoals;
    
    // Determine bet success for each type
    const betSuccess = {};
    
    // Over/Under success
    if (overUnderData) {
      const { goalLine } = overUnderData;
      betSuccess[`over_${goalLine}`] = halftimeGoals > goalLine;
      betSuccess[`under_${goalLine}`] = halftimeGoals < goalLine;
    }
    
    // Odd/Even success
    if (oddEvenData) {
      betSuccess.odd_goals = halftimeGoals % 2 === 1;
      betSuccess.even_goals = halftimeGoals % 2 === 0;
    }
    
    // BTTS success
    if (bttsData) {
      betSuccess.btts_yes = homeHalfGoals > 0 && awayHalfGoals > 0;
      betSuccess.btts_no = homeHalfGoals === 0 || awayHalfGoals === 0;
    }
    
    return {
      match: match.match,
      date: match.date.toISOString().split('T')[0],
      halftime_goals: halftimeGoals,
      bet_success: betSuccess
    };
  });
  
  // Calculate success rates
  const successRates = {};
  const totalMatches = matches.length;
  
  // Initialize counters for each bet type
  const betTypes = [];
  
  if (overUnderData) {
    const { goalLine } = overUnderData;
    betTypes.push(`over_${goalLine}`, `under_${goalLine}`);
  }
  
  if (oddEvenData) {
    betTypes.push('odd_goals', 'even_goals');
  }
  
  if (bttsData) {
    betTypes.push('btts_yes', 'btts_no');
  }
  
  // Count successes for each bet type
  betTypes.forEach(betType => {
    const successCount = historicalResults.filter(result => result.bet_success[betType]).length;
    const successRate = (successCount / totalMatches) * 100;
    successRates[betType] = `${Math.round(successRate)}%`;
  });
  
  // Calculate goal distribution
  const goalDistribution = {};
  historicalResults.forEach(result => {
    const goals = result.halftime_goals;
    goalDistribution[goals] = (goalDistribution[goals] || 0) + 1;
  });
  
  // Find most probable total goals
  let mostProbableGoals = 0;
  let highestCount = 0;
  
  Object.entries(goalDistribution).forEach(([goals, count]) => {
    if (count > highestCount) {
      mostProbableGoals = parseInt(goals);
      highestCount = count;
    }
  });
  
  // Calculate probability percentage for most probable goals
  const mostProbableGoalsPercentage = Math.round((highestCount / totalMatches) * 100);
  
  return {
    historical_results: historicalResults,
    success_rates: successRates,
    total_matches_analyzed: totalMatches,
    goal_distribution: goalDistribution,
    most_probable_goals: {
      count: mostProbableGoals,
      percentage: `${mostProbableGoalsPercentage}%`
    }
  };

}

/**
 * Generate a cache key based on request parameters
 */
function generateCacheKey(league, betOdds) {
  return `bet-analysis:${league}:${JSON.stringify(betOdds)}`;
}

module.exports = router;