# Weather Dashboard Application

## Project Title
**Weather Dashboard** - a responsive web app that shows the current weather for any city, built with HTML, CSS and vanilla JavaScript using the free Open-Meteo API (no API key needed).

## Introduction
This project lets a user type a city name and instantly see its current weather: temperature, condition, icon, humidity, wind, cloud cover, pressure, location details and the city's local date and time.
It demonstrates API integration, asynchronous programming (`async/await`, Promises, `fetch()`), JSON processing, DOM manipulation, event handling, error handling and responsive design.

## Problem Statement
Build a weather dashboard that uses a public weather API, displays current conditions, searches weather by city, handles invalid input and API/network errors, and shows asynchronous programming and API integration (with AI-assisted development and debugging).

## Objectives
- Use a public REST API (Open-Meteo) with `fetch()`.
- Convert a city name into coordinates (geocoding), then coordinates into weather.
- Use `async`, `await`, Promises and `try / catch / finally`.
- Validate user input and show friendly error messages.
- Update the page dynamically (DOM) without reloading.
- Build a responsive, accessible interface.
- Document the AI-assisted workflow, testing and Git usage.

## Features
- City search by **Search button** or **Enter key**; spaces are trimmed (`" Chennai "` -> `"Chennai"`)
- Quick buttons for Chennai, Hyderabad, Bangalore, Mumbai, Delhi, London, Tokyo, New York, Paris
- Default city (Chennai) shown automatically on page load
- Current weather: temperature, "feels like", condition, icon (day/night aware), humidity, wind speed, wind direction, cloud cover, pressure
- Location: city, country, region, latitude, longitude
- Date and time in the **searched city's own time zone**
- Loading spinner; Search button disabled while loading; duplicate requests blocked
- Friendly errors for empty input, unknown city, no internet, API failure and unexpected errors
- Background colour changes with the weather (sunny, night, cloudy, fog, rain, snow, storm)
- Responsive (320px to 1920px), keyboard accessible, reduced-motion support

## Technologies Used
| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure (semantic elements) |
| CSS3 | Styling: variables, Flexbox, Grid, gradients, animations, media queries |
| JavaScript (vanilla) | API calls, logic, DOM updates |
| Open-Meteo APIs | Free weather and geocoding data |
| VS Code + Live Server | Editing and running |
| Git | Version control |

## APIs Used
Both are free for non-commercial use and need **no API key**. Please keep the "Weather data by Open-Meteo.com" credit in the footer.

| API | Address | Purpose |
|-----|---------|---------|
| Geocoding API | `https://geocoding-api.open-meteo.com/v1/search` | City name -> latitude, longitude, country, region |
| Weather Forecast API | `https://api.open-meteo.com/v1/forecast` | Latitude + longitude -> current weather |

## API Architecture
```
Browser (index.html + script.js)
        |
        |  1. GET geocoding-api.open-meteo.com/v1/search?name=Chennai&count=1
        v
Open-Meteo Geocoding API  --->  JSON: { results: [ { name, latitude, longitude, country, admin1 } ] }
        |
        |  2. GET api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=...&timezone=auto
        v
Open-Meteo Weather API    --->  JSON: { timezone, current: { temperature_2m, weather_code, ... } }
        |
        v
script.js converts the weather code, updates the page (DOM)
```

## How the API Works
**What is an API?** An *Application Programming Interface* is a way for programs to talk to each other. Our JavaScript asks Open-Meteo a question over the internet and gets an answer.

**What is a REST API?** A REST API uses normal web addresses (URLs) and HTTP requests. We use `GET` ("give me data"). Extra information goes after `?` in the URL as `name=value` pairs, e.g. `?name=Chennai&count=1`.

**What is JSON?** JSON (JavaScript Object Notation) is a text format for data, e.g. `{"temperature_2m": 31.4}`. `response.json()` turns it into a JavaScript object so we can write `data.current.temperature_2m`.

**Step 1 - Geocoding (city -> coordinates).** A weather service needs a *place on the map*, not a name. The geocoding API turns `Chennai` into latitude `13.08` and longitude `80.27`. Example answer (shortened; exact numbers will differ):
```json
{ "results": [ { "name": "Chennai", "latitude": 13.08784, "longitude": 80.27847,
                 "country": "India", "admin1": "Tamil Nadu", "timezone": "Asia/Kolkata" } ] }
```
If the city does not exist, the answer has **no `results` list at all**, so we check for that before using it.

**Step 2 - Weather (coordinates -> weather).** We send the coordinates and ask for the current values we want (`current=temperature_2m,weather_code,...`). `timezone=auto` makes the API tell us the city's time zone. Example (shortened; values illustrative):
```json
{ "timezone": "Asia/Kolkata",
  "current_units": { "wind_speed_10m": "km/h", "pressure_msl": "hPa" },
  "current": { "temperature_2m": 31.4, "relative_humidity_2m": 65, "apparent_temperature": 36.2,
               "is_day": 1, "weather_code": 2, "cloud_cover": 10,
               "pressure_msl": 1008.6, "wind_speed_10m": 12.3, "wind_direction_10m": 45 } }
```

**Weather codes.** The API sends a number such as `2`. `getWeatherCondition()` converts it to words and an emoji (0 = Clear sky, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast, 45/48 = Fog, 51-57 = Drizzle, 61-67 = Rain, 71-77 = Snow, 80-82 = Rain showers, 85/86 = Snow showers, 95 = Thunderstorm, 96/99 = Thunderstorm with hail).

**How `fetch()` works.** `fetch(url)` sends the request and immediately returns a *Promise* - a promise that an answer will arrive later. `await` pauses *that function* until the answer comes. The rest of the page stays responsive.

## Asynchronous Programming
- **Synchronous** code runs line by line and waits for each line. **Asynchronous** code can start a slow job (like an internet request) and let the browser do other things until it finishes.
- **Promise:** an object that represents a result that is not ready yet. It ends up either *fulfilled* (success) or *rejected* (error).
- **`fetch()`:** starts a network request and returns a Promise.
- **`async`:** put before a function (`async function getWeather()`) so it can use `await` and so it always returns a Promise.
- **`await`:** waits for a Promise to finish and gives you its value: `const response = await fetch(url);`
- **`try / catch`:** if a Promise is rejected, `await` throws an error. `catch` handles it so the app does not break.
- **`finally`:** runs **always**, success or failure. We use it to hide the spinner and re-enable the button.

Pattern used in `searchWeather()`:
```javascript
try {
    const place = await getCoordinates(city);
    const weather = await getWeather(place.latitude, place.longitude);
    displayWeather(place, weather);
} catch (error) {
    console.error(error);            // for developers
    showError(getFriendlyMessage(error)); // for users
} finally {
    hideLoading();                   // always runs
}
```

## Project Structure
```
Weather_Dashboard/
├── index.html                   # Page structure
├── css/
│   └── style.css                # All styling + responsive rules
├── js/
│   └── script.js                # API calls, logic, DOM updates
├── images/
│   └── weather-placeholder.png  # Optional picture (the app does NOT need it)
├── docs/
│   ├── GUIDE.md                 # VS Code setup, screenshots, beginner explanations
│   └── PROJECT_REPORT.md        # Report for submission
├── .gitignore
└── README.md
```
`docs/` and `.gitignore` are extras. The app uses emoji icons, so it works without any image files.

## Installation
1. Install **VS Code** from <https://code.visualstudio.com/> (the default options are fine).
2. Unzip `Weather_Dashboard.zip`.
3. In VS Code: **File > Open Folder...** and choose `Weather_Dashboard`.
4. Install the **Live Server** extension: `Ctrl + Shift + X`, search **Live Server** (Ritwick Dey), click **Install**.

No Node.js, no `npm install`, no API key.

## Running the Project
- **Best:** right-click `index.html` in VS Code > **Open with Live Server** (opens at `http://127.0.0.1:5500`).
- **Also works:** double-click `index.html` to open it in Chrome/Edge.
- You need an **internet connection**, because the weather comes from Open-Meteo.

## VS Code Setup
See the 15-step guide in [`docs/GUIDE.md`](docs/GUIDE.md).

## Error Handling
| Situation | What happens | Message shown |
|-----------|--------------|---------------|
| Empty input (or only spaces) | No API request is made | Please enter a city name. |
| City does not exist | Geocoding returns no `results` | City not found. Please check the spelling and try again. |
| No internet / timeout (10 s) | `fetch()` rejects | Unable to connect to the weather service. Please check your internet connection. |
| Server error (HTTP 4xx/5xx) or unreadable JSON | `response.ok` is false | Weather service is temporarily unavailable. Please try again later. |
| Anything else | Caught by `catch` | Something went wrong. Please try again. |

- Technical details go to `console.error()` (press `F12` > Console); users only see the friendly message.
- `finally` always resets the loading state, so the Search button can never get stuck.
- After an API error the old weather card is hidden so you never see data for the wrong city. An empty-input message leaves the current weather on screen.

## Responsive Design
- **Mobile-friendly units:** `clamp()` for fluid text sizes, `minmax()` grid columns, `min-width: 0` on inputs.
- **Breakpoints:** 768px (tablet), 600px, 480px (phones: search box stacks, cards become one column), 360px (very small phones).
- `overflow-wrap: anywhere` stops long city names from breaking the layout.
- Checked with an automated browser test at 1920, 1440, 1024, 768, 600, 480, 375 and 320px: no horizontal scrolling.

## Accessibility
- Semantic HTML: `header`, `nav`, `main`, `section`, `article`, `form`, `footer`
- A real `<label>` for the search box and real `<button>` elements
- The search works fully by keyboard (Tab, Enter); a "Skip to weather" link; visible yellow focus outline
- `role="alert"` on errors, `role="status"` on loading, `aria-live="polite"` on the weather section, `aria-label` on the weather icon
- Dark text on white cards and white text on dark gradients for good contrast
- `prefers-reduced-motion` turns off animations

## AI-Assisted Development
AI was used as a helper for API integration, debugging, responsiveness, error analysis and documentation. I reviewed, ran and tested all generated code. Use these prompts, then write down what the AI answered and what you changed or learned (take screenshots of your own AI chat for the report).

**AI Prompt 1 - API Integration**
```text
Help me integrate the Open-Meteo public weather API into a vanilla JavaScript weather dashboard. Explain the geocoding request, weather request, fetch(), async/await, JSON parsing, and error handling step by step.
```
*Used for:* `getCoordinates()`, `getWeather()`, `fetchJSON()`.

**AI Prompt 2 - Debugging**
```text
My weather dashboard is not displaying the API response. Analyze the JavaScript API request, JSON parsing, DOM selectors, and error handling and identify possible problems and fixes.
```
*Used for:* checking property names (`data.current.temperature_2m`) and element IDs.

**AI Prompt 3 - Responsive Design**
```text
Analyze my weather dashboard CSS and improve its responsiveness for desktop, tablet, and mobile. Make sure there is no horizontal scrolling and the weather cards stack properly on small screens.
```
*Used for:* the media queries and `minmax()` / `clamp()` rules.

**AI Prompt 4 - Error Analysis**
```text
Explain this weather API error in beginner-friendly language. Determine whether the issue is caused by user input, the API request, network connectivity, JSON parsing, or DOM manipulation.
```
*Used for:* deciding which of the five messages (empty, not found, network, API failure, unknown) fits each failure.

**AI Prompt 5 - Documentation**
```text
Generate beginner-friendly documentation for my Weather Dashboard project, including API integration, asynchronous programming, error handling, testing, Git usage, AI-assisted development, and future enhancements.
```
*Used for:* this README and the report.

**Important:** AI can be wrong. Open the browser console, test every feature yourself, and make sure you can explain each function in a viva.

## AI Debugging
These three are **example scenarios** (they show how to debug with AI), not necessarily bugs you will hit.

**Problem 1 - Weather data does not appear.**
*Possible reason:* a wrong JSON property name (e.g. `data.temperature` instead of `data.current.temperature_2m`) or a wrong element ID in `getElementById`.
*AI-assisted solution:* `console.log(data)` and paste the result into the AI chat; compare the real response with the properties your code reads; check the Console for `null` / `undefined` errors.

**Problem 2 - Invalid city crashes the app.**
*Possible reason:* the geocoding API returned no `results`, and the code did `data.results[0]` on something that does not exist (`Cannot read properties of undefined`).
*Solution:* check `if (!data.results || data.results.length === 0)` first, then show "City not found" (this project does exactly that).

**Problem 3 - Search button stays disabled.**
*Possible reason:* the loading state was only reset after success, so an error skipped it.
*Solution:* put `hideLoading()` in a `finally` block, which runs after success *and* error.

**A real issue found while building this project:** the page background gradient stopped part-way down the page. The cause was `background-attachment: fixed`, which is unreliable on some phones and in full-page captures. Removing it made the gradient cover the whole page.

## Git Commit Messages
```bash
git init
git add .
git commit -m "Initial project setup"
```
Check your history with `git log --oneline`. If Git asks who you are, run once:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

The code is already complete, so the most realistic history is made by building the project **section by section** (the numbered sections in `script.js` and `style.css` match these commits). Run `git add .` and `git commit -m "..."` after each stage:

| # | Commit message | What it represents |
|---|----------------|--------------------|
| 1 | `Initial project setup` | Folders, `.gitignore`, empty files |
| 2 | `Create weather dashboard UI` | `index.html` and the basic `style.css` (header, search, cards) |
| 3 | `Add city search functionality` | Form submit listener, input trimming, `searchWeather()` |
| 4 | `Integrate geocoding API` | `getCoordinates()` (city -> latitude/longitude) |
| 5 | `Integrate weather API` | `getWeather()` (coordinates -> JSON) |
| 6 | `Implement async weather fetching` | `async/await`, `fetchJSON()`, `displayWeather()` |
| 7 | `Add weather condition mapping` | `getWeatherCondition()` (codes -> text + emoji) |
| 8 | `Add loading state` | Spinner, `showLoading()`, `hideLoading()`, `finally` |
| 9 | `Add error handling` | `try/catch`, `MESSAGES`, `showError()`, `clearError()` |
| 10 | `Improve responsive design` | Media queries, `clamp()`, grid tweaks |
| 11 | `Add accessibility improvements` | Labels, ARIA, focus styles, skip link, reduced motion |
| 12 | `Update README documentation` | README and `docs/` |

## Testing
I ran an automated browser test with the **weather API replaced by fake (mock) responses**, because my testing environment had no internet access. It checked all the logic below plus layout widths. **You must now test with the real internet** and fill in the last column.

| Test Case | Input | Expected Result | Status | My result (fill in) |
|---|---|---|---|---|
| Valid city | Chennai | Weather displayed | Pass (mocked API) | |
| Valid city | London | Weather displayed | Pass (mocked API) | |
| Empty input | Empty | "Please enter a city name." and no API request | Pass | |
| Invalid city | xyzabc123 | "City not found..." | Pass (mocked API) | |
| Spaces | `   Chennai   ` | Request uses `Chennai`; correct weather | Pass (mocked API) | |
| Enter key | Chennai + Enter | Search performed | Pass | |
| Network issue | Offline | Network error message; button re-enabled | Pass (simulated) | |
| Server error | HTTP 500 | "Weather service is temporarily unavailable..." | Pass (simulated) | |
| Duplicate click | Click twice quickly | Only one request is made | Pass | |
| Responsive | 320 to 1920px | No horizontal scroll; cards stack on phones | Pass (checked at 8 widths) | |
| Mobile | 375px | Responsive layout | Pass | |

**Please update the Status column yourself after you test the real app** (Live Server, then Chrome DevTools). To test "Offline": `F12` > **Network** tab > change *No throttling* to **Offline**, then search.

## Advantages
- Free and easy: no API key, no installation, no backend.
- Real, live data instead of hard-coded values.
- Simple, commented code suitable for beginners.
- Friendly error handling; works on phones and desktops.

## Limitations
- Requires an internet connection.
- Depends on Open-Meteo being available (free use has fair-use limits and is for non-commercial projects).
- Weather accuracy depends on the API.
- Shows only current weather (no forecast yet).
- Only the best-matching city is used, so a name shared by several cities (e.g. "Springfield") shows just one.
- No user accounts and no database; nothing is saved.

## Future Enhancements
5-day forecast, hourly forecast, current location detection (Geolocation API), favourite cities, search history (localStorage), Celsius/Fahrenheit switch, dark/light mode, weather charts, air quality, sunrise/sunset, weather alerts.

## Conclusion
The Weather Dashboard combines HTML, CSS and JavaScript to build a complete, responsive web application. It shows how to call REST APIs with `fetch()`, process JSON, use `async/await` and Promises, handle errors with `try/catch/finally` and update the page with the DOM. Building it, with AI as an assistant and my own testing, gave practical experience with real-world web development.
