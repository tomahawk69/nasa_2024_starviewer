Night Dreamers' Exosky

Explore the night sky from anywhere in the universe!

This project was initially a part of Nasa 2024 Challenge, and was created by the team Night Dreamers (https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/night-dreamers/?tab=details)

Run app: npx vite. By default, the app will launch the night sky view of Earth and open in your web browser at http://localhost:5173/. In the eb it can be found at:
- https://limy.tech/version-test/space?earth
- https://space-dreamers-exosky.s3.eu-north-1.amazonaws.com/index.html


You can explore the night sky from various locations in the universe by adding a parameter to the URL:

- Earth: http://localhost:5173/?set=earth_bsc5p_3d_min
- Sweeps-04: http://localhost:5173/?set=sweeps-4-min
- Alfa Centauri Bb: http://localhost:5173/?set=alpha-cent-b-min

App Features

Zooming: Change the field of view (FOV) to zoom in or out on the sky.

Rotating: Click and hold the left mouse button to rotate the sky view freely.

Drawing Constellations (Beta Feature):
- Press "Enter drawing mode" to activate.
- Click on a star to add it to your drawing.
- Click on a selected star again to remove it.
Note: This feature is still under development.

- Star Information: Stars with names will display information when clicked. (Currently only available for stars visible from Earth)

Adding New Star Sets

New star sets can be easily added by creating a JSON file following a specific format. These files can be served by the application without any code changes.

Technical Details

Framework: Vite.js
3D Library: Three.js
Star Data Source: https://github.com/frostoven/BSC5P-JSON-XYZ
Future Development

We plan to improve the drawing constellation feature and add more celestial bodies to explore!
