/*
  script.js - Weather Dashboard
  Uses the free Open-Meteo APIs (no API key needed).

  Sections (each one matches a Git commit - see README):
    1. Settings (default city, API addresses, messages)
    2. Page elements (DOM)
    3. Weather code -> description + icon
    4. Helper functions (loading, errors, formatting)
    5. API functions (fetch + async/await)
    6. Display function (update the page)
    7. Main search function
    8. Event listeners + start-up
*/

/* =====================================================
   1. SETTINGS
   ===================================================== */

// >>> CHANGE THE DEFAULT CITY HERE <<<
// This city is shown automatically when the page opens.
const DEFAULT_CITY = "Chennai";

// API addresses (called "endpoints")
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"; // city name -> coordinates
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";           // coordinates -> weather

// Stop waiting for the internet after 10 seconds
const REQUEST_TIMEOUT_MS = 10000;

// Messages shown to the user (never raw technical errors)
const MESSAGES = {
    EMPTY: "Please enter a city name.",
    NOT_FOUND: "City not found. Please check the spelling and try again.",
    NETWORK: "Unable to connect to the weather service. Please check your internet connection.",
    API_FAILURE: "Weather service is temporarily unavailable. Please try again later.",
    UNKNOWN: "Something went wrong. Please try again."
};

// true while a request is running (used to block duplicate searches)
let isLoading = false;
// time zone of the city on screen (used by the live clock)
let currentTimezone = null;

/* =====================================================
   2. PAGE ELEMENTS (DOM)
   ===================================================== */
const cityForm = document.getElementById("cityForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const quickCities = document.getElementById("quickCities");
const loadingBox = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");
const weatherSection = document.getElementById("weatherSection");

const locationName = document.getElementById("locationName");
const locationSub = document.getElementById("locationSub");
const localDate = document.getElementById("localDate");
const localTime = document.getElementById("localTime");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const windDirection = document.getElementById("windDirection");
const cloudCover = document.getElementById("cloudCover");
const pressure = document.getElementById("pressure");
const region = document.getElementById("region");
const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");

/* =====================================================
   3. WEATHER CODE -> DESCRIPTION + ICON
   Open-Meteo sends a number (WMO weather code). We turn it into words and an emoji.
   ===================================================== */
function getWeatherCondition(code, isDay) {
    // isDay is 1 (daytime) or 0 (night) - used to pick a moon icon at night
    const day = isDay !== 0;

    if (code === 0) {
        return day
            ? { description: "Clear sky", icon: "☀️", theme: "clear-day" }
            : { description: "Clear sky", icon: "🌙", theme: "clear-night" };
    } else if (code === 1) {
        return day
            ? { description: "Mainly clear", icon: "🌤️", theme: "clear-day" }
            : { description: "Mainly clear", icon: "🌙", theme: "clear-night" };
    } else if (code === 2) {
        return { description: "Partly cloudy", icon: "⛅", theme: "cloudy" };
    } else if (code === 3) {
        return { description: "Overcast", icon: "☁️", theme: "cloudy" };
    } else if (code === 45 || code === 48) {
        return { description: "Fog", icon: "🌫️", theme: "fog" };
    } else if (code >= 51 && code <= 55) {
        return { description: "Drizzle", icon: "🌦️", theme: "rain" };
    } else if (code === 56 || code === 57) {
        return { description: "Freezing drizzle", icon: "🌧️", theme: "rain" };
    } else if (code >= 61 && code <= 65) {
        return { description: "Rain", icon: "🌧️", theme: "rain" };
    } else if (code === 66 || code === 67) {
        return { description: "Freezing rain", icon: "🌧️", theme: "rain" };
    } else if (code >= 71 && code <= 75) {
        return { description: "Snow", icon: "❄️", theme: "snow" };
    } else if (code === 77) {
        return { description: "Snow grains", icon: "❄️", theme: "snow" };
    } else if (code >= 80 && code <= 82) {
        return { description: "Rain showers", icon: "🌦️", theme: "rain" };
    } else if (code === 85 || code === 86) {
        return { description: "Snow showers", icon: "🌨️", theme: "snow" };
    } else if (code === 95) {
        return { description: "Thunderstorm", icon: "⛈️", theme: "storm" };
    } else if (code === 96 || code === 99) {
        return { description: "Thunderstorm with hail", icon: "⛈️", theme: "storm" };
    }
    // Any code we do not know
    return { description: "Unknown", icon: "🌡️", theme: "cloudy" };
}

/* =====================================================
   4. HELPER FUNCTIONS
   ===================================================== */

// Create an Error that carries a short "code" (NOT_FOUND, NETWORK, ...)
function createError(code) {
    const error = new Error(code);
    error.code = code;
    return error;
}

// Show the spinner and lock the search controls
function showLoading() {
    isLoading = true;
    loadingBox.hidden = false;
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    setQuickButtonsDisabled(true);
    weatherSection.hidden = true;
}

// Hide the spinner and unlock the search controls
function hideLoading() {
    isLoading = false;
    loadingBox.hidden = true;
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
    setQuickButtonsDisabled(false);
}

function setQuickButtonsDisabled(disabled) {
    const buttons = quickCities.querySelectorAll("button");
    buttons.forEach(function (button) {
        button.disabled = disabled;
    });
}

function showError(message) {
    errorText.textContent = message;
    errorBox.hidden = false;
}

function clearError() {
    errorText.textContent = "";
    errorBox.hidden = true;
}

// Turn any error into a friendly message
function getFriendlyMessage(error) {
    if (error && MESSAGES[error.code]) {
        return MESSAGES[error.code];
    }
    return MESSAGES.UNKNOWN;
}

// Show "N/A" if the API did not send a value
function formatValue(value, unit) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "N/A";
    }
    return value + " " + unit;
}

// Same idea for percentages: 65 -> "65%"
function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "N/A";
    }
    return value + "%";
}

// Wind comes as degrees (0-360). Convert to N, NE, E, ...
function getWindDirection(degrees) {
    if (degrees === null || degrees === undefined) {
        return "N/A";
    }
    const names = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                   "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(degrees / 22.5) % 16;   // 360 / 16 = 22.5 degrees per name
    return names[index] + " (" + Math.round(degrees) + "°)";
}

// Date and time in the searched city's own time zone
function formatLocalDateTime(timezone) {
    const now = new Date();
    const options = { timeZone: timezone };
    let dateText;
    let timeText;
    try {
        dateText = new Intl.DateTimeFormat("en-US", {
            ...options, weekday: "long", year: "numeric", month: "long", day: "numeric"
        }).format(now);
        timeText = new Intl.DateTimeFormat("en-US", {
            ...options, hour: "numeric", minute: "2-digit", hour12: true
        }).format(now);
    } catch (error) {
        // If the time zone name is not understood, use the computer's time zone
        dateText = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        timeText = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return { date: dateText, time: timeText };
}

function updateClock() {
    if (!currentTimezone) {
        return;
    }
    const result = formatLocalDateTime(currentTimezone);
    localDate.textContent = result.date;
    localTime.textContent = result.time;
}

/* =====================================================
   5. API FUNCTIONS (fetch + async/await)
   ===================================================== */

// Download JSON from a URL. Throws a NETWORK or API_FAILURE error if something is wrong.
async function fetchJSON(url) {
    const controller = new AbortController();                          // lets us cancel slow requests
    const timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);

    let response;
    try {
        // await = wait here until the server answers (the page does not freeze)
        response = await fetch(url, { signal: controller.signal });
    } catch (error) {
        // fetch() only fails like this when there is no internet, DNS problem or timeout
        console.error("Network error:", error);
        throw createError("NETWORK");
    } finally {
        clearTimeout(timer);
    }

    // The server answered, but with an error status (404, 500, ...)
    if (!response.ok) {
        console.error("Server responded with status", response.status, "for", url);
        throw createError("API_FAILURE");
    }

    try {
        return await response.json();        // convert the response text into a JavaScript object
    } catch (error) {
        console.error("Could not read JSON:", error);
        throw createError("API_FAILURE");
    }
}

// STEP 1: city name -> latitude + longitude (Geocoding API)
async function getCoordinates(city) {
    const params = new URLSearchParams({
        name: city,
        count: 1,            // we only need the best match
        language: "en",
        format: "json"
    });
    const data = await fetchJSON(GEOCODING_URL + "?" + params.toString());

    // If no city matches, the API sends NO "results" list - check before using it!
    if (!data.results || data.results.length === 0) {
        throw createError("NOT_FOUND");
    }

    const place = data.results[0];
    if (typeof place.latitude !== "number" || typeof place.longitude !== "number") {
        throw createError("API_FAILURE");
    }

    return {
        name: place.name,
        country: place.country || "",
        region: place.admin1 || "",
        latitude: place.latitude,
        longitude: place.longitude
    };
}

// STEP 2: latitude + longitude -> current weather (Weather API)
async function getWeather(latitudeValue, longitudeValue) {
    const params = new URLSearchParams({
        latitude: latitudeValue,
        longitude: longitudeValue,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
        timezone: "auto"      // gives us the city's own time zone
    });
    const data = await fetchJSON(WEATHER_URL + "?" + params.toString());

    // Make sure the data we need is really there
    if (!data.current || typeof data.current.temperature_2m !== "number") {
        throw createError("API_FAILURE");
    }
    return data;
}

/* =====================================================
   6. DISPLAY FUNCTION (update the page)
   ===================================================== */
function displayWeather(place, weather) {
    const current = weather.current;
    const units = weather.current_units || {};
    const info = getWeatherCondition(current.weather_code, current.is_day);

    // Location
    locationName.textContent = place.country ? place.name + ", " + place.country : place.name;
    locationSub.textContent = place.region || "";
    region.textContent = place.region || "N/A";
    latitude.textContent = place.latitude.toFixed(2) + "°";
    longitude.textContent = place.longitude.toFixed(2) + "°";

    // Current weather
    weatherIcon.textContent = info.icon;
    weatherIcon.setAttribute("aria-label", info.description);
    temperature.textContent = Math.round(current.temperature_2m) + "°C";
    condition.textContent = info.description;
    feelsLike.textContent = "Feels like " + Math.round(current.apparent_temperature) + "°C";

    humidity.textContent = formatPercent(current.relative_humidity_2m);
    windSpeed.textContent = formatValue(current.wind_speed_10m, units.wind_speed_10m || "km/h");
    windDirection.textContent = getWindDirection(current.wind_direction_10m);
    cloudCover.textContent = formatPercent(current.cloud_cover);
    pressure.textContent = formatValue(Math.round(current.pressure_msl), units.pressure_msl || "hPa");

    // Date and time of that city
    currentTimezone = weather.timezone;
    updateClock();

    // Change the background to match the weather, then show the weather card
    document.body.setAttribute("data-theme", info.theme);
    weatherSection.hidden = false;
}

/* =====================================================
   7. MAIN SEARCH FUNCTION
   Flow: validate -> geocoding -> weather -> display
   ===================================================== */
async function searchWeather(rawCity) {
    // Do nothing if a search is already running (prevents duplicate requests)
    if (isLoading) {
        return;
    }

    // Remove spaces at the start and end: " Chennai " -> "Chennai"
    const city = (rawCity || "").trim();

    clearError();

    // Validate input BEFORE calling the API
    if (city === "") {
        showError(MESSAGES.EMPTY);
        cityInput.focus();
        return;
    }

    showLoading();

    try {
        const place = await getCoordinates(city);                            // 1. city -> coordinates
        const weather = await getWeather(place.latitude, place.longitude);   // 2. coordinates -> weather
        displayWeather(place, weather);                                      // 3. show on the page
    } catch (error) {
        console.error("Search failed:", error);   // technical details for developers (see F12 console)
        weatherSection.hidden = true;
        showError(getFriendlyMessage(error));     // friendly message for users
    } finally {
        hideLoading();                            // ALWAYS runs - success or error
    }
}

/* =====================================================
   8. EVENT LISTENERS + START-UP
   ===================================================== */

// Clicking Search AND pressing Enter both fire the form's "submit" event
cityForm.addEventListener("submit", function (event) {
    event.preventDefault();               // stop the page from reloading
    searchWeather(cityInput.value);
});

// Quick city buttons (one listener for all of them)
quickCities.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-city]");
    if (button) {
        cityInput.value = button.dataset.city;
        searchWeather(button.dataset.city);
    }
});

// Keep the clock fresh (every 30 seconds)
setInterval(updateClock, 30000);

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Show the default city when the page opens
cityInput.value = DEFAULT_CITY;
searchWeather(DEFAULT_CITY);
