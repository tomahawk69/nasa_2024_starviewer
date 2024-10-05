import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import starfieldBlackbody from "./starfieldBlackbody.glsl.js";

const NEAR = 0.000001, FAR = 1e27, CUBE_ASPECT = 1, FOV = 50, FOV_MAX = 100, FOV_MIN = 25, MAX_POINTS = 500;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);

const container = document.getElementById('canvas');

const CANVAS_WIDTH = container.clientWidth;
const CANVAS_HEIGHT = container.clientHeight;
const CANVAS_TOP = container.getBoundingClientRect().top;


let intersects = []
let hovered = {}

let _stars = []
let _starnames = {}
let _selected = [];

let drawCount;
let line;

camera.position.set(0, 0, 1);
camera.lookAt(0, 0, 0);

camera.layers.disableAll()
camera.layers.enable(0)

const renderer = new THREE.WebGLRenderer({
    alpha: false,
    antialias: true,
    // canvas: canvas
    preserveDrawingBuffer: true,
    powerPerformance: "high-performance"
});

renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.saveState();

controls.autoRotate = false;
controls.enablePan = false;
controls.enableZoom = false;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// line
function setupLines() {
    // line
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 0);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
    line = new THREE.Line(geometry, material);
    // line.layers.set(1)
    scene.add(line);
}

console.log("top", container.getBoundingClientRect());

window.addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / CANVAS_WIDTH) * 2 - 1, -((e.clientY - CANVAS_TOP) / CANVAS_HEIGHT) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    intersects = raycaster.intersectObjects(scene.children, true);

    Object.keys(hovered).forEach((key) => {
        const hit = intersects.find((hit) => hit.object.uuid === key)
        if (hit === undefined) {
            const hoveredItem = hovered[key]
            if (hoveredItem.object.onPointerOver) hoveredItem.object.onPointerOut(hoveredItem)
            delete hovered[key]
        }
    });

    intersects.forEach((hit) => {
        // If a hit has not been flagged as hovered we must call onPointerOver
        if (!hovered[hit.object.uuid]) {
            hovered[hit.object.uuid] = hit
            if (hit.object.onPointerOver) hit.object.onPointerOver(hit)
        }
        // Call onPointerMove
        if (hit.object.onPointerMove) hit.object.onPointerMove(hit)
    });
});

window.addEventListener('click', (e) => {
    let min = undefined;
    let index = undefined;
    intersects.forEach((hit) => {
        if (!min || min < _stars[hit.index].p) {
            min = _stars[hit.index].p;
            index = hit.index;
        }
        console.debug("Click on", _stars[hit.index]);
    })
    if (index) {
        if (!_selected.find(e => e === index)) {
            _selected.push(index);
            addStar(index);
        }
    }

})


function addStar(index) {
    if (_selected.length < 3) {
        document.getElementById("draw-constellation").disabled = true;
    } else {
        document.getElementById("draw-constellation").disabled = false;
    }
    const parent = document.getElementById('stars');
    if (_selected.length == 1) {
        parent.innerText = '';
    }

    const star_element = document.createElement("span");
    const star = _stars[index];
    const star_name = _starnames[star.n];
    star_element.innerText = star_name ? star_name.name : star.n;
    star_element.className = 'star';
    star_element.setAttribute("idx", index);
    star_element.setAttribute("title", "Click to center view on star");
    parent.appendChild(star_element);
}


document.getElementById("stars").addEventListener("click", centerOnSelection);

function centerOnSelection(event) {
    event.stopPropagation();
    const index = event.target.getAttribute("idx");
    if (!index) return;
    controls.target = new THREE.Vector3(_stars[index].x, _stars[index].y, _stars[index].z);
    controls.update();
}

document.getElementById("selection-reset").addEventListener("click", clearSelection);

function clearSelection(event) {
    _selected = [];
    document.getElementById("draw-constellation").disabled = true;
    document.getElementById('stars').textContent = 'Click on star to add to selection';
    event.stopPropagation();
}

document.getElementById("camera-reset").addEventListener("click", resetCamera);

function resetCamera(event) {
    controls.reset();
    camera.fov = FOV;
    camera.updateProjectionMatrix();
    event.stopPropagation();
}

document.getElementById("camera-zoom-in").addEventListener("click", zoomIn);

function zoomIn(event) {
    event.stopPropagation();
    if (camera.fov == FOV_MIN) {
        return;
    }
    camera.fov--;
    camera.updateProjectionMatrix();
    configureZoomButtons();
}

document.getElementById("camera-zoom-out").addEventListener("click", zoomOut);

function zoomOut(event) {
    event.stopPropagation();
    if (camera.fov == FOV_MAX) {
        return;
    }
    camera.fov++;
    camera.updateProjectionMatrix();
    configureZoomButtons();
}

function configureZoomButtons() {
    console.debug("fov", camera.fov);
    if (camera.fov == FOV_MAX) {
        document.getElementById("camera-zoom-out").disabled = true;
    } else {
        document.getElementById("camera-zoom-out").disabled = false;
    }
    if (camera.fov == FOV_MIN) {
        document.getElementById("camera-zoom-in").disabled = true;
    } else {
        document.getElementById("camera-zoom-in").disabled = false;
    }
    document.getElementById("zoom").innerText = (FOV - camera.fov + 1) + "X";
}

document.addEventListener('mousewheel', onDocumentMouseWheel, false);

function onDocumentMouseWheel(event) {
    if (event.deltaY > 0) {
        zoomOut(event)
    } else if (event.deltaY < 0) {
        zoomIn(event)
    }
}

// document.getElementById("show-stars-names").addEventListener("click", showStarsNames);

// function showStarsNames(event) {
//     event.stopPropagation();
//     _showStarsNames = event.target.checked;
//     if (_showStarsNames) {
//         console.debug("hide start names")
//         camera.layers.disable(1)
//     } else {
//         console.debug("show stars names")
//         camera.layers.enable(1)
//     }
// }


document.getElementById("draw-constellation").addEventListener("click", drawConstellation);

function drawConstellation(event) {
    camera.layers.enable(1);
    event.stopPropagation();
    if (_selected.length < 3) {
        console.debug("Not enough lines to draw constellation")
    }

    line.material.color.setHSL(Math.random(), 1, 0.5);


    const positions = line.geometry.attributes.position.array;

    let index = 0;

    for (let i = 0; i < _selected.length; i++) {
        const star = _stars[_selected[i]];
        positions[index++] = star.x;
        positions[index++] = star.y;
        positions[index++] = star.z;
    }
    const star = _stars[_selected[0]];
    positions[index++] = star.x;
    positions[index++] = star.y;
    positions[index++] = star.z;
    line.geometry.setDrawRange(0, _selected.length + 1);
    line.geometry.attributes.position.needsUpdate = true;
}

function drawLine(next, first) {

}

function render() {
    line.geometry.attributes.position.needsUpdate = true;
    raycaster.setFromCamera(pointer, camera);
    controls.update();
    renderer.render(scene, camera);
}

const spectralCombinations = {};

function loadStars() {
    fetch("bsc5p_3d_min.json")
        .then(response => response.json())
        .then(json => filterStars(json))
        .then(stars => renderStars(stars));
}

function loadStarNames() {
    fetch("star_names.json")
        .then(response => response.json())
        .then(json => parseStarNames(json))
        .then(i => loadStars)
    // .then(stars => renderStars(stars));
}

function parseStarNames(json) {
    for (let i = 0; i < json.length; i++) {
        const star = json[i];
        if (star.hid) {
            const id = star.hid.replace(' ', '');
            _starnames[id] = star;
        }
    }
}


function filterStars(json) {

    console.log("starnames", _starnames)

    const validStars = [];
    for (let i = 0; i < json.length; i++) {
        const star = json[i];
        const parsecs = star.p;
        if (parsecs) {
            const spectralType = star.s;
            if (!spectralCombinations[spectralType]) {
                spectralCombinations[spectralType] = 1;
            } else {
                spectralCombinations[spectralType]++;
            }
            validStars.push(star);
        }
    }
    return validStars;
}

function renderStars(stars) {

    const color = [];
    const glow = [];
    const luminosity = [];
    const distance = [];
    const vertices = [];

    const group = new THREE.Group()

    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // vertices.push(star.x * parsec, star.y * parsec, star.z * parsec);
        vertices.push(star.x, star.y, star.z);

        // bookm
        if (!star.K) {
            console.warn(star.n, 'has invalid colour; setting generic placeholder. Dump:', star);
            // 6400 K colour, medium white.
            star.K = { r: 1, g: 0.9357, b: 0.9396 };
        }

        glow.push(star.K.r);
        glow.push(star.K.g);
        glow.push(star.K.b);

        luminosity[i] = star.N;
        distance[i] = star.p;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
    geometry.setAttribute('glow', new THREE.Float32BufferAttribute(glow, 3));
    geometry.setAttribute('luminosity', new THREE.Float32BufferAttribute(luminosity, 1));
    geometry.setAttribute('distance', new THREE.Float32BufferAttribute(distance, 1));

    const { vertexShader, fragmentShader } = starfieldBlackbody;
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            alphaTest: { value: 0.9 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        extensions: {
            drawBuffers: true,
        },
    });

    const particles = new THREE.Points(geometry, material);
    particles.layers.set(0)
    scene.add(particles);

    _stars = stars;
}

renderer.setAnimationLoop(render);

setupLines()

configureZoomButtons();

loadStarNames();

loadStars();