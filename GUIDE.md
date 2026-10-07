# Guide: VS Code Setup, Screenshots and Beginner Explanations

## Part 1 - VS Code setup (Windows)

1. **Install VS Code.** Download from <https://code.visualstudio.com/>, run the installer, keep the defaults, finish.
2. **Create the folder.** If you unzipped `Weather_Dashboard.zip`, you already have it. (Starting from scratch? Make a folder named `Weather_Dashboard` in Documents.)
3. **Open the folder in VS Code.** *File > Open Folder...* > choose `Weather_Dashboard` > *Select Folder*. Click "Yes, I trust the authors" if asked.
4. **Files you should see** (create them yourself only if you are typing the project manually):
   ```
   index.html
   css/style.css
   js/script.js
   README.md
   ```
   To create: right-click in the Explorer > *New File* (type `css/style.css` to create the folder and file together).
5. **Copy the code** into each file (skip this if you use the zip). Save each file with `Ctrl + S`.
6. **Install Live Server.** Click the Extensions icon (or `Ctrl + Shift + X`), search **Live Server** by Ritwick Dey, click *Install*.
7. **Run.** Right-click `index.html` > **Open with Live Server**. The browser opens `http://127.0.0.1:5500`.
8. **Test `Chennai`.** It loads automatically; also type `Chennai` and press Search.
9. **Test `London`.** Type it and click Search; the temperature, time and background should change.
10. **Test an invalid city.** Type `xyzabc123` > you should see *City not found. Please check the spelling and try again.*
11. **Test empty input.** Clear the box (or type only spaces) > Search > *Please enter a city name.*
12. **Press Enter** instead of clicking Search (type `Paris` then press `Enter`).
13. **Test mobile responsiveness.** In Chrome press `F12` > click the phone/tablet icon (or `Ctrl + Shift + M`) > choose *iPhone SE* (375px), then drag the width down to 320px. Make sure nothing scrolls sideways.
14. **Check the console.** `F12` > **Console** tab. There should be no red errors on a normal search. (A red `console.error` message after an invalid city or offline test is expected: that is our developer debugging output.) To test offline: `F12` > **Network** tab > set throttling to **Offline** > search.
15. **Take your screenshots** (Part 2).

**Troubleshooting**
| Problem | Fix |
|---------|-----|
| No styling / no weather | Check folder names are exactly `css` and `js`; files `style.css` and `script.js` |
| "Unable to connect..." on every search | Check your internet; a college/office network may block `open-meteo.com` (try mobile hotspot) |
| Live Server option missing | Install the extension, then restart VS Code |
| Changes not showing | Save (`Ctrl + S`) and hard refresh (`Ctrl + F5`) |
| Emoji icons look different | Normal: emojis depend on your operating system |

---

## Part 2 - Screenshots to capture

| # | Screenshot | Where / how |
|---|------------|-------------|
| 1 | VS Code project folder | VS Code with the Explorer panel open and all folders expanded |
| 2 | Homepage | Browser window right after the page loads (header + search area) |
| 3 | Chennai weather result | Full page showing Chennai's card and detail cards (use browser zoom 80% to fit) |
| 4 | Another city weather result | Search `London` or `Tokyo`; capture the full result (the background colour may change) |
| 5 | Search input | Type a city in the box (e.g. `Hyderabad`) *before* pressing Search; show the cursor/text and quick-city buttons |
| 6 | Invalid city error | Search `xyzabc123`; capture the red error message |
| 7 | Empty input validation | Clear the box, click Search; capture "Please enter a city name." |
| 8 | Loading state | Hard to catch because it is fast. In DevTools > Network tab choose **Slow 3G**, search, and capture the spinner quickly |
| 9 | Mobile responsive design | DevTools device mode at 375px (and optionally 320px); capture the full screen |
| 10 | Browser developer console | `F12` > Console tab showing no red errors after a successful search |
| 11 | Git commit history | Terminal (`Ctrl + ~` in VS Code): run `git log --oneline` |
| 12 | README documentation | VS Code: right-click `README.md` > *Open Preview*; capture the rendered preview |

Extra useful ones: Network tab showing the two API calls (geocoding then forecast), and the Offline error message.

---

## Part 3 - Beginner explanations

**HTML.** HTML is the skeleton of the page. In `index.html` it defines the header, the search form, the loading spinner, the error box and the empty weather cards. JavaScript later fills the empty cards with real values.

**CSS.** CSS is the appearance: colours, fonts, spacing, the gradient background, rounded cards, hover effects, animations and the media queries that rearrange the layout on small screens.

**JavaScript.** JavaScript is the behaviour. It listens for the search, checks the input, talks to the API, converts the answer into readable weather and updates the page.

**API.** An API (Application Programming Interface) lets one program ask another for data. Our page asks Open-Meteo for weather, like ordering from a menu: you send a request, you get a response.

**REST API.** A REST API is an API that works over normal web URLs using HTTP methods. We use `GET` to read data. Inputs are written in the URL after `?`, such as `?name=Chennai&count=1`.

**JSON.** JSON is a text format for structured data: `{"temperature_2m": 31.4}`. It looks like a JavaScript object. `await response.json()` converts it so we can use `data.current.temperature_2m`.

**Fetch API.** `fetch(url)` sends a request from the browser and returns a Promise. When the server answers we get a `response` with `response.ok` (true for success) and `response.json()` (the data).

**Promise.** A Promise is a "will be ready later" value. It starts *pending* and ends *fulfilled* (success) or *rejected* (error). `fetch()` returns one.

**async / await.** `async` marks a function that waits for slow tasks; `await` pauses that function until a Promise finishes. Without them we would need nested `.then()` callbacks. With them, the code reads top to bottom like normal steps, while the page stays responsive.

**DOM.** The DOM (Document Object Model) is the browser's live copy of your HTML as objects. `document.getElementById("temperature").textContent = "31°C"` changes what is on the screen without reloading the page.

**Event listener.** `addEventListener("submit", ...)` runs a function when something happens. Our `<form>` fires a `submit` event both when you click **Search** and when you press **Enter** inside the box; `event.preventDefault()` stops the browser from reloading the page.

**try / catch.** Things go wrong (no internet, unknown city). Code inside `try { }` that throws an error jumps to `catch { }`, where we show a friendly message instead of letting the app break.

**finally.** `finally { }` runs whether the `try` succeeded or failed. We put `hideLoading()` there so the spinner always disappears and the Search button always works again.

**Responsive design.** A responsive page adapts to the screen size. CSS media queries such as `@media (max-width: 480px) { ... }` apply different rules on small screens (stack the search box, one column of cards). Flexible units like `clamp()` and `minmax()` let text and cards resize smoothly.

---

## Part 4 - Viva questions to practise
1. Why do we need two API calls? (name -> coordinates -> weather)
2. What happens if the geocoding API finds no city? (no `results` -> NOT_FOUND message)
3. What does `await` do, and what happens if you remove `async`? (syntax error: `await` only works inside async functions)
4. Why is `finally` used? (always reset loading)
5. How do both the button and Enter key work? (the form's submit event)
6. How is the user's input cleaned? (`trim()`)
7. How do you change the default city? (`DEFAULT_CITY` at the top of `script.js`)
8. Why use `textContent` instead of `innerHTML`? (it treats API text as plain text, which is safer)
