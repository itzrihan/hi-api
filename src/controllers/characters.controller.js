import extractCharacter from "../extractors/characters.extractor.js";
import { getCachedData, setCachedData } from "../helper/cache.helper.js";

const getCharacter = async (req, res) => {
  const id = req.params.id;

  // Validate ID
  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid character ID. Must be a non-empty string.",
    });
  }

  const cacheKey = `character_${id}`;

  try {
    // Check cache first
    const cachedData = await getCachedData(cacheKey);
    if (cachedData && cachedData.results?.data?.length > 0) {
      console.log(`[Cache Hit] Character ${id} served from cache.`);
      return res.status(200).json({
        success: true,
        fromCache: true,
        ...cachedData,
      });
    }

    // Fetch fresh data if not in cache
    console.log(`[Cache Miss] Fetching character ${id} from source.`);
    const characterData = await extractCharacter(id);

    // Validate response
    if (!characterData || characterData.results?.data?.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Character not found.",
      });
    }

    // Cache the response (1 hour expiry)
    await setCachedData(cacheKey, characterData, 3600)
      .then(() => console.log(`[Cache Updated] Cached character ${id}.`))
      .catch((err) => console.error("[Cache Error]", err));

    // Return successful response
    return res.status(200).json({
      success: true,
      fromCache: false,
      ...characterData,
    });

  } catch (error) {
    console.error(`[API Error] Failed to fetch character ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || "An error occurred while fetching character data.",
    });
  }
};

export default getCharacter;
