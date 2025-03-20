const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/predict-fulltime-goals
 * @desc    Predict fulltime goal distribution based on provided odds
 * @access  Public
 */
router.post('/predict-fulltime-goals', async (req, res, next) => {
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
    
    // Calculate goal probabilities
    const results = calculateGoalProbabilities(similarMatches);
    
    // Try to cache results if Redis is available
    if (req.redis) {
      const cacheKey = `fulltime-goal-prediction:${league}:${JSON.stringify(bet_odds)}`;
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
  // Define odds similarity threshold (20% to be flexible)
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
    take: 1000 // Limit results to prevent performance issues
  };
  
  // Add filters based on provided bet types
  if (overUnderData) {
    const { goalLine, overOdd, underOdd } = overUnderData;
    
    // Add over/under filters
    query.where.AND = [
      {
        ouHcap: {
          equals: goalLine
        }
      },
      {
        ou01: {
          gte: overOdd * (1 - ODDS_THRESHOLD),
          lte: overOdd * (1 + ODDS_THRESHOLD)
        }
      },
      {
        ou02: {
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
        oddGoals: {
          gte: oddOdd * (1 - ODDS_THRESHOLD),
          lte: oddOdd * (1 + ODDS_THRESHOLD)
        }
      },
      {
        evenGoals: {
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
        bttsYes: {
          gte: yesOdd * (1 - ODDS_THRESHOLD),
          lte: yesOdd * (1 + ODDS_THRESHOLD)
        }
      },
      {
        bttsNo: {
          gte: noOdd * (1 - ODDS_THRESHOLD),
          lte: noOdd * (1 + ODDS_THRESHOLD)
        }
      }
    );
  }
  
  // Execute the query
  return await prisma.match.findMany(query);
}

/**
 * Calculate goal probabilities from historical match data
 */
function calculateGoalProbabilities(matches) {
  // Initialize goal counts
  const goalCounts = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3+': 0
  };

  // Count goal occurrences in historical matches
  matches.forEach(match => {
    const totalGoals = match.home_goals + match.away_goals;
    if (totalGoals === 0) {
      goalCounts['0']++;
    } else if (totalGoals === 1) {
      goalCounts['1']++;
    } else if (totalGoals === 2) {
      goalCounts['2']++;
    } else {
      goalCounts['3+']++;
    }
  });

  // Calculate probabilities
  const totalMatches = matches.length;
  const goalProbabilities = {
    '0': (goalCounts['0'] / totalMatches) * 100,
    '1': (goalCounts['1'] / totalMatches) * 100,
    '2': (goalCounts['2'] / totalMatches) * 100,
    '3+': (goalCounts['3+'] / totalMatches) * 100
  };

  return {
    goal_probabilities: goalProbabilities,
    total_matches_analyzed: totalMatches
  };
}

module.exports = router;