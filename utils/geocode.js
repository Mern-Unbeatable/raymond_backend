const axios = require("axios");

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "RaymondRealEstateApp/1.0";

/**
 * Convert an address string to { latitude, longitude }.
 * Uses OpenStreetMap Nominatim — free, no API key required.
 */
const geocodeAddress = async (address) => {
  if (!address) return null;

  try {
    const response = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: {
        q: address,
        format: "json",
        limit: 1,
      },
      headers: { "User-Agent": USER_AGENT },
      timeout: 5000,
    });

    const results = response.data;
    if (!results || !results.length) {
      console.warn(`[Geocode] No results for "${address}"`);
      return null;
    }

    return {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    };
  } catch (err) {
    console.error(`[Geocode] Error for "${address}":`, err.message);
    return null;
  }
};

/**
 * Return up to `limit` address suggestions for a partial query string.
 * Used for frontend autocomplete / search-by-location.
 * Each result: { display, type, latitude, longitude }
 */
const getAddressSuggestions = async (query, limit = 8) => {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: {
        q: query,
        format: "json",
        limit: Math.min(limit, 10),
        addressdetails: 1,
        namedetails: 1,
        "accept-language": "en",
      },
      headers: { "User-Agent": USER_AGENT },
      timeout: 8000,
    });

    const seen = new Set();

    return (response.data || [])
      .map((r) => {
        const a = r.address || {};

        const placeName =
          a.neighbourhood || a.suburb || a.quarter || a.road || null;
        const city =
          a.city || a.town || a.village || a.municipality || a.county || null;
        const region = a.state_district || a.state || a.region || null;
        const country = a.country || null;

        const parts = [placeName, city, region, country].filter(Boolean);
        const deduped = parts.filter((p, i) => i === 0 || p !== parts[i - 1]);
        const display =
          deduped.length >= 2 ? deduped.join(", ") : r.display_name;

        return {
          display,
          type: r.type || r.class || "place",
          latitude: parseFloat(r.lat),
          longitude: parseFloat(r.lon),
        };
      })
      .filter((r) => {
        if (seen.has(r.display)) return false;
        seen.add(r.display);
        return true;
      });
  } catch (err) {
    console.error(`[Geocode] Suggestions error for "${query}":`, err.message);
    return [];
  }
};

module.exports = { geocodeAddress, getAddressSuggestions };
