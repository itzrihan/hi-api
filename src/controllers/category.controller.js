import { extractor } from "../extractors/category.extractor.js";
import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export const getCategory = async (req, res, routeType) => {
  // Fix typo in "martial-arts" (if provided as "marial-arts")
  if (routeType === "genre/martial-arts") {
    routeType = "genre/martial-arts";
  }

  // Parse page number (default: 1)
  const requestedPage = parseInt(req.query.page) || 1;
  if (requestedPage < 1) {
    return res.status(400).json({
      success: false,
      error: "Page number must be at least 1.",
    });
  }

  // Generate cache key (e.g., "genre_martial_arts_page_1")
  const cacheKey = `${routeType.replace(/\//g, "_")}_page_${requestedPage}`;

  try {
    // Check if data exists in cache
    const cachedResponse = await getCachedData(cacheKey);
    if (cachedResponse && Object.keys(cachedResponse).length > 0) {
      console.log(`[Cache Hit] Serving ${routeType} (Page ${requestedPage}) from cache.`);
      return res.status(200).json({
        success: true,
        fromCache: true,
        ...cachedResponse,
      });
    }

    // Fetch fresh data if not in cache
    console.log(`[Cache Miss] Fetching ${routeType} (Page ${requestedPage}) from source.`);
    const { data, totalPages } = await extractor(routeType, requestedPage);

    // Validate if requested page exists
    if (requestedPage > totalPages) {
      return res.status(404).json({
        success: false,
        error: `Requested page (${requestedPage}) exceeds total available pages (${totalPages}).`,
      });
    }

    // Prepare response
    const responseData = {
      totalPages: totalPages,
      currentPage: requestedPage,
      data: data,
    };

    // Cache the response (with 1-hour expiry)
    await setCachedData(cacheKey, responseData, 3600)
      .then(() => console.log(`[Cache Updated] Cached ${routeType} (Page ${requestedPage}).`))
      .catch((err) => console.error("[Cache Error]", err));

    // Return successful response
    return res.status(200).json({
      success: true,
      fromCache: false,
      ...responseData,
    });

  } catch (error) {
    console.error(`[API Error] ${routeType} (Page ${requestedPage}):`, error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || "An error occurred while fetching category data.",
    });
  }
};
