### Naval Sim Project - Detailed User Story Checklist

This checklist provides a granular breakdown of each user story into one-story-point tasks. The checklist is designed for an AI Coding Agent to autonomously implement the application.

**Epic 1: Web Interface and Core Foundation**

*   **Feature: Web Interface Access (F01)**

    *   US01: As a user, I want to access the application via a web browser, so that I can start playing the game.

        *   [X] Task 1.1: Create basic HTML structure (head, body, title)
            *   [X] Specify doctype: `<!DOCTYPE html>`
            *   [X] Set `<title>` to "Naval Sim"
        *   [X] Task 1.2: Create a basic CSS file and link it to the HTML.
            *   [X] Name the CSS file `style.css`
            *   [X] Basic CSS resets (margin, padding, box-sizing)
        *   [X] Task 1.3: Create a JavaScript file and link it to the HTML.
            *   [X] Name the JS file `app.js`
            *   [X] Ensure the script tag is placed before the closing `</body>` tag
        *   [X] Task 1.4: Create a loading spinner element.
            *   [X] Add a simple CSS animation for the spinner.
        *   [X] Task 1.5: Display a "Loading..." message while the application loads.
            *   [X] Use JavaScript to hide the loading message after page load.
        *   [X] Task 1.6: Check compatibility with modern browsers (Chrome, Firefox, Safari, Edge).
            *   [x] Verify correct rendering in each browser.

*   **Feature: WebSocket Communication (F12)**

    *   US02: As a frontend developer, I want to establish a persistent WebSocket connection, so that the game can communicate with the server in real-time.

        *   [X] Task 2.1: Create a `WebSocketService` class/module in `app.js`.
            *   [X] Implement a `connect()` method that creates a new WebSocket object.
                *   [X] Set the WebSocket URL to `ws://localhost:8080` (configurable later)
            *   [X] Implement `onopen`, `onclose`, `onmessage`, `onerror` handlers.
                *   [X] Log connection status to the console.
                *   [X] Handle connection errors gracefully (retry mechanism).
            *   [X] Implement a `send(message)` method that sends data to the server.
            *   [X] Implement a `close()` method to close the WebSocket connection.
        *   [X] Task 2.2: Implement a retry mechanism for failed connections.
            *   [X] Use exponential backoff strategy for retries.
            *   [X] Limit the maximum number of retries.
        *   [X] Task 2.3: Display connection status to the user (e.g., "Connecting...", "Connected", "Disconnected").
        *   [X] Task 2.4: Handle incoming messages from the server and log them to the console.

**Epic 2: Map and Ship Visualization**

*   **Feature: 2D Tactical Map Rendering (F02)**

    *   US03: As a user, I want to see a 2D map, so that I can orient myself in the tactical environment.

        *   [X] Task 3.1: Include the OpenLayers library via CDN.
            *   [X] Add the necessary `<link>` and `<script>` tags in the HTML.
        *   [X] Task 3.2: Create a `MapService` class/module in `app.js`.
            *   [X] Implement a `createMap(target)` method that creates a new OpenLayers map.
                *   [X] Set the map target to an HTML element with ID "map".
                *   [X] Use a default tile layer (e.g., OpenStreetMap).
                *   [X] Set the initial view (center coordinates, zoom level).
            *   [X] Implement methods to zoom and pan the map.
        *   [X] Task 3.3: Create a `div` element with ID "map" in the HTML.
            *   [X] Style the map container to fill the viewport.
        *   [X] Task 3.4: Initialize the map when the application loads.
            *   [X] Call the `createMap()` method from `app.js`.
        *   [X] Task 3.5: Ensure smooth zooming and panning.
            *   [X] Optimize OpenLayers configuration for performance.

*   **Feature: Ship Visualization (Player & AI) (F03)**

    *   US04: As a user, I want to see my ship represented on the map, so that I know my position.

        *   [X] Task 4.1: Create a `ShipService` class/module in `app.js`.
            *   [X] Task 4.1.1: Implement a `createShip(coordinates, isPlayer, sidc, properties)` method.
                *   [X] Create an OpenLayers feature representing the ship.
                *   [X] Use a default SIDC of 'SFSPN----K' for the player unit
                *   [X] Use the `generateMilStdSymbol()` to create the initial SVG.
                *   [X] The `createShip` function must accept `sidc` and other properties as parameters and pass them to the `generateMilStdSymbol` function.
                *   [X] Use a simple, distinct color for the player (e.g. blue).
            *   [ ] Task 4.1.2 Implement a `moveShip(shipFeature, coordinates)` method.
                *   [ ] Handles re-positioning of unit symbol.
            *   [ ] Task 4.1.3 Implement a `setShipHeading(shipFeature, heading)` method
                *   [ ] Updates internal heading for icon rotation.
                *   [ ] Re-renders the SVG to update the heading.
            *   [ ] Task 4.1.4 Implement a method to add ship features to a Vector layer.
                *   [ ] Must create a vector layer for the `shipFeature` object.
        *   [ ] Task 4.2: Modify the OpenLayers `VectorLayer` to use a custom rendering function for military symbols (MIL-STD-2525D).
            *   [ ] Use the `milSymbolStyle` function.
        *   [ ] Task 4.3: Implement `milSymbolStyle(feature)` Function
            *   [ ] Creates a custom style function for military symbols
            *   [ ] Gets the properties of the feature
            *   [ ] Extracts the Standard Identity Code
            *   [ ] Generates SVG for the symbol using `generateMilStdSymbol()`
            *   [ ] Creates an Icon style with the SVG
                *   [ ] Sets the scale to 0.5
                *   [ ] Rotates the icon using `properties.heading`
                *   [ ] Adds a text style for the unit designator if it exists.
        *   [ ] Task 4.4: Create Vector layer to host ships.
        *   [ ] Task 4.5: Add the player ship to the map at a default starting location.
            *   [ ] Use `ShipService.createShip()` and `ShipService.addShipToMap()`.
            *   [ ] Set the `isPlayer` flag to `true`.
        *   [ ] Task 4.6: Ensure the ship remains within the map bounds.
            *   [ ] Clamp to boundary

    *   US05: As a user, I want to see AI ships represented on the map, so that I can track the enemy.

        *   [ ] Task 5.1: Modify the `ShipService` to handle multiple AI ships.
        *   [ ] Task 5.2: Create a method to generate random AI ship starting locations.
        *   [ ] Task 5.3: Add AI ships to the map at random locations.
            *   [ ] Use `ShipService.createShip()` and `ShipService.addShipToMap()`.
            *   [ ] Set the `isPlayer` flag to `false`.
        *   [ ] Task 5.4: Implement a mechanism to periodically update AI ship locations (simple random movement).
            *   [ ] Use `ShipService.moveShip()`.

    *   US5.5: As a developer, create `generateMilStdSymbol(symbolCode, options)` Function
        *   [ ] Task 5.5.1 Research existing Javascript MIL-STD-2525D symbol libraries.
        *   [ ] Task 5.5.2 Implement the baseline function call if one is present or implement one.
        *   [ ] Task 5.5.3 Function must: Accept a symbol code.
        *   [ ] Task 5.5.4 Function must: Accept an option object with: size, mobility, status, etc.
        *   [ ] Task 5.5.5 Function must: Render SVG based on passed code.

**Epic 3: Radar and Intercept Mechanics**

*   **Feature: Radar Detection Simulation (F04)**

    *   US06: As a developer, I want to load radar parameters from `radars.json`, so that I can configure radar behavior.

        *   [ ] Task 6.1: Create a `DataService` class/module in `app.js`.
            *   [ ] Implement a `loadRadarData(url)` method that loads data from a JSON file.
                *   [ ] Use the `fetch()` API to load the data.
                *   [ ] Handle potential errors (file not found, invalid JSON).
            *   [ ] Store the loaded radar data in a variable.
        *   [ ] Task 6.2: Create a `radars.json` file with example data (RadarPower: 1000).
        *   [ ] Task 6.3: Load radar data when the application starts.
            *   [ ] Call `DataService.loadRadarData('radars.json')`.
            *   [ ] Store the loaded data for later use.

    *   US07: As a developer, I want to load missile RCS from `missiles.xlsx`, so that I can configure missile properties.

        *   [ ] Task 7.1: Research a JavaScript library to read XLSX files (e.g., SheetJS js-xlsx).
        *   [ ] Task 7.2: Include the XLSX library via CDN.
        *   [ ] Task 7.3: Implement a `loadMissileData(url)` method in `DataService`.
            *   [ ] Use the XLSX library to read the data from the file.
                *   [ ] Handle potential errors (file not found, invalid XLSX).
            *   [ ] Store the loaded missile data in a variable.
        *   [ ] Task 7.4: Create a `missiles.xlsx` file with example data (RCS: 1, Range: 50, Speed: 10).
            *   [ ] Ensure the XLSX file is in the correct format (column headers, data types).
        *   [ ] Task 7.5: Load missile data when the application starts.
            *   [ ] Call `DataService.loadMissileData('missiles.xlsx')`.
            *   [ ] Store the loaded data for later use.

    *   US08: As a developer, I want to calculate radar detection probability based on the equation (RadarPower \* RCS) / R^4, so that the game can simulate radar detection.

        *   [ ] Task 8.1: Create a `RadarService` class/module in `app.js`.
            *   [ ] Implement a `calculateDetectionProbability(radarPower, rcs, range)` method.
                *   [ ] Use the provided formula to calculate the probability.
                *   [ ] Handle potential errors (invalid input values).
        *   [ ] Task 8.2: Get the radar power and missile RCS from the loaded data.
        *   [ ] Task 8.3: Calculate the detection probability for each AI ship based on its range.
        *   [ ] Task 8.4: Generate a random number (0-1) to determine if the AI ship is detected.

    *   US09: As a user, I want to see a visual indication of detected targets, so that I am aware of potential threats.

        *   [ ] Task 9.1: Modify the `ShipService` to add a "detected" property to the ship feature.
        *   [ ] Task 9.2: Modify the `RadarService` to update the "detected" property based on the detection probability.
        *   [ ] Task 9.3: Modify the ship style to visually indicate detected ships (e.g., change color, add a blinking effect).
        *   [ ] Task 9.4: Update the ship style periodically to reflect the current detection status.
        *   [ ] Task 9.5: Visual indication only appears if probability check passes.

*   **Feature: Missile Flight Path Visualization (F05)**

    *   US10: As a developer, I want to load missile range and speed from `missiles.xlsx`, so that I can configure missile properties.

        *   [ ] (This task is covered by US07, as range and speed are loaded in that story)

    *   US11: As a user, I want to see missile flight paths visualized, so that I can understand the threat trajectory.

        *   [ ] Task 11.1: Create a `MissileService` class/module in `app.js`.
            *   [ ] Implement a `launchMissile(startCoordinates, targetCoordinates, speed, range)` method.
                *   [ ] Create an OpenLayers feature representing the missile path.
                *   [ ] Use a simple line style.
                *   [ ] Animate the missile movement along the path using `ol.animation`.
                    *   [ ] Update missile coordinates each frame.
                    *   [ ] Remove missile from map when range is exhausted.
                    *   [ ] Remove missile from map when target is hit.
                *   [ ] Implement calculation of impact coordinate based on speed, range and frame time.

*   **Feature: Intercept Zone Logic (F06)**

    *   US12: As a developer, I want to define 3 intercept zones (30-21, 20-11, 10-0 NM), so that I can implement layered defense.

        *   [ ] Task 12.1: Create a `ZoneService` class/module in `app.js`.
            *   [ ] Implement a `createZone(radius)` method that creates a circular OpenLayers feature.
                *   [ ] Specify the radius in nautical miles (NM).
            *   [ ] Implement a method to add the zone features to a Vector Layer.
        *   [ ] Task 12.2: Define the zone radii: 30, 21, 11, and 0 NM.
        *   [ ] Task 12.3: Use the Zone Service to create these zones.

    *   US13: As a user, I want to see the intercept zones visualized as arcs, so that I understand the intercept ranges.

        *   [ ] Task 13.1: Add methods to `ZoneService` to display circular zones as radial arcs.
        *   [ ] Task 13.2: Style arcs to differentiate them visually.
        *   [ ] Task 13.3: Add the zone arcs to the map, centered on the player's ship.

*   **Feature: Manual Intercept Authorization (F07)**

    *   US14: As a user, I want to be able to authorize intercept fire in Zones 1 & 2, so that I can defend against incoming missiles.

        *   [ ] Task 14.1: Create an "Intercept" button in the UI.
        *   [ ] Task 14.2: Implement an event handler for the "Intercept" button.
        *   [ ] Task 14.3: Check if the selected missile is within Zone 1 or 2.
            *   [ ] Implement a range-checking function.
        *   [ ] Task 14.4: If missile is within range, call a method to launch interceptor (to be created).
        *   [ ] Task 14.5: If the missile is not in range display error.

    *   US15: As a developer, I want the system to deduct SAMs from inventory when intercept is authorized manually, so that I can track remaining defensive resources.

        *   [ ] Task 15.1: Create a `SAMService` class/module in `app.js`.
            *   [ ] Implement a `getSAMInventory()` method to get current SAM quantity.
            *   [ ] Implement `decrementSAMs(number)` to reduce SAM quantity by `number` from inventory.
        *   [ ] Task 15.2: Initialize SAM inventory to 10.
        *   [ ] Task 15.3: In manual intercept event, call `SAMService.decrementSAMs()` before calling intercept.
        *   [ ] Task 15.4: After `SAMService.decrementSAMs()` completes, update the UI to reflect.

*   **Feature: Automatic Intercept (F08)**

    *   US16: As a developer, I want the system to automatically initiate intercept fire in Zone 3, so that the ship has a last-ditch defense.

        *   [ ] Task 16.1: Implement a function to continuously monitor missile positions.
        *   [ ] Task 16.2: If a missile enters Zone 3, call a method to launch interceptor (to be created).
        *   [ ] Task 16.3: Display message to user of auto-interception in zone 3.

    *   US17: As a developer, I want the system to deduct SAMs from inventory when intercept is authorized automatically, so that I can track remaining defensive resources.

        *   [ ] Task 17.1: In automatic intercept method, call `SAMService.decrementSAMs()` before calling intercept.
        *   [ ] Task 17.2: After `SAMService.decrementSAMs()` completes, update the UI to reflect.

**Epic 4: AI and Scoring**

*   **Feature: Basic AI Behavior (F09)**

    *   US18: As a developer, I want AI ships to launch missiles when their inventory is > 0, so that the player faces a threat.

        *   [ ] Task 18.1: Give each AI ship an missile inventory property.
        *   [ ] Task 18.2: Set AI missile count to a random number between 1 and 5 on generation.
        *   [ ] Task 18.3: Call the `MissileService.launchMissile()` every AI tick.
        *   [ ] Task 18.4: Reduce the inventory value by one each time launch.
        *   [ ] Task 18.5: Apply physics to missile launch based on ship speed and heading.

    *   US19: As a developer, I want AI ships to wait when their inventory is depleted, so that they don't fire indefinitely.

        *   [ ] Task 19.1: Check AI ship missile inventory before launching the missile.
        *   [ ] Task 19.2: Only launch the missile if inventory >0.

*   **Feature: Real-Time Scoring (F10)**

    *   US20: As a user, I want to see my score update in real-time, so that I get immediate feedback.

        *   [ ] Task 20.1: Create a `ScoreService` class/module in `app.js`.
            *   [ ] Implement a `getScore()` method.
            *   [ ] Implement `incrementScore(points)` method to increase score by `points`
        *   [ ] Task 20.2: In all intercept methods, call `ScoreService.incrementScore(points)` and update score based on intercept results.
        *   [ ] Task 20.3: Create a display element for the score in the UI.
        *   [ ] Task 20.4: Update the score element in the UI every time the score changes.

*   **Feature: SAM Inventory Tracking (F11)**

    *   US21: As a user, I want to see my SAM inventory update in real-time, so that I can manage my defensive resources effectively.

        *   [ ] (This is already covered by US15 and US17 in Feature F07/F08)

**Epic 5: Enhancements**

*   **Feature: Clearer Missile Type Visuals (F14)**

    *   US22: As a user, I want to distinguish missile types by unique colors, so that I can prioritize threats easily.

        *   [ ] Task 22.1: Expand missile data with a type property.
        *   [ ] Task 22.2: Expand `MissileService` class with visual customizations based on missile type.
        *   [ ] Task 22.3: Implement different visual colors for each missile type.

*   **Feature: Distinct Visual/UI for Detection/Track (F15)**

    *   US23: As a user, I want a different UI indication for detected and tracked targets, so that I understand their lock state.

        *   [ ] Task 23.1: Add another visual state on radar blips to reflect target lock.
        *   [ ] Task 23.2: Implement a method to determine whether there is line of sight.
*   **Feature: Accurate physical movement for units.**

    *   US24: As a developer, I want apply accurate physics to both ships and missiles, including realistic top speeds and rates of turn.
        *   [ ] 24.1 Research and apply realistic maximum ship and missile speeds.
        *   [ ] 24.2 Research and apply realistic turn rates to all units.

*   **Feature: Use precise positioning to drive unit movement modeling.**
        *   [ ] 25.1 Implement position to the 6th decimal place for units.
        *   [ ] 25.2 Model movement in very short timeslices.

**Post MVP To Do**
*  Path planning is too long for a single task.