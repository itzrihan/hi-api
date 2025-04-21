import extractAnimeInfo from "../extractors/animeInfo.extractor.js";
import extractSeasons from "../extractors/seasons.extractor.js";
import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export const getAnimeInfo = async (req, res) => {
  const { id } = req.query;
  
  // Validate input
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: "Invalid anime ID. Please provide a valid string ID." 
    });
  }

  const cacheKey = `animeInfo_${id}`;

  try {
    // Check cache first
    const cachedResponse = await getCachedData(cacheKey);
    
    if (cachedResponse && Object.keys(cachedResponse).length > 0) {
      console.log(`[Cache Hit] Anime info served from cache for ID: ${id}`);
      return res.status(200).json({
        success: true,
        data: cachedResponse,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[Cache Miss] Fetching fresh data for anime ID: ${id}`);
    
    // Parallel fetching of anime info and seasons
    const [seasons, data] = await Promise.all([
      extractSeasons(id),
      extractAnimeInfo(id),
    ]);

    // Validate response data
    if (!data || !seasons) {
      throw new Error("Incomplete data received from external sources");
    }

    const responseData = { 
      data: data, 
      seasons: seasons 
    };

    // Set cache with 1 hour expiration (3600 seconds)
    await setCachedData(cacheKey, responseData, 3600)
      .then(() => console.log(`[Cache Update] Cached data for anime ID: ${id}`))
      .catch((err) => {
        console.error(`[Cache Error] Failed to cache data for ${id}:`, err);
        // Don't fail the request just because caching failed
      });

    return res.status(200).json({
      success: true,
      data: responseData,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[Error] Failed to get anime info for ${id}:`, error);
    
    return res.status(500).json({ 
      success: false,
      error: "An error occurred while fetching anime information",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};
