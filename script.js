// JavaScript for handling tile placement and export
const grid = document.getElementById('grid');
const tilePicker = document.getElementById('tile-picker');
const output = document.getElementById('output');
const exportButton = document.getElementById('export');
const mapIdInput = document.getElementById('map-id'); // New input for map ID

// Define the size of each texture in the spritesheet
const textureSize = 16; // Each sprite is 16x16 pixels

// Define the sprite coordinates for each tile type
const spriteMap = {
    water: { x: 85, y: 160 },
    ground: { x: 0, y: 143 },

    wall: { x: 355, y: 96 },
    wallTopRight: { x: 338, y: 96, width: 16, height: 16 },
    wallTopLeft: { x: 370, y: 96, width: 16, height: 16 },
    wallBottomRight: { x: 306, y: 96, width: 16, height: 16 },
    wallBottomLeft: { x: 322, y: 96, width: 16, height: 16 },
    wallTop:{ x: 314, y: 96, width: 16, height: 16 },

    greenBush: { x: 290, y: 96, width: 16, height: 16 },

    warp: { x: 136, y: 211 },
    caveground: { x: 136, y: 194 },
    caveWall: { x: 119, y: 211 },
    // Add more tiles here, specifying their top-left corner coordinates
};
tilePicker.innerHTML = '';
// Dynamically populate the tile picker with tiles from the spritesheet
Object.entries(spriteMap).forEach(([tileType, position]) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.setAttribute('data-tile', tileType);
    tile.style.backgroundImage = `url('images/sprites.bmp')`;
    tile.style.backgroundSize = `auto`;
    tile.style.backgroundPosition = `-${position.x}px -${position.y}px`;
    tilePicker.appendChild(tile);
    tile.addEventListener('click', () => {
        selectedTile = tileType;
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected'); // Highlight the selected tile
    });
});

// Populate the grid with empty tiles
for (let i = 0; i < 16 * 11; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    grid.appendChild(cell);
}

let selectedTile = null; // Store the currently selected tile type
let isPainting = false; // Track whether the user is painting

// Add functionality to place tiles by clicking on the grid
grid.querySelectorAll('.grid-cell').forEach(cell => {
    // Place a tile on click
    cell.addEventListener('click', () => {
        if (selectedTile) {
            paintTile(cell);
        }
    });

    // Start painting on mousedown
    cell.addEventListener('mousedown', () => {
        if (selectedTile) {
            isPainting = true;
            paintTile(cell);
        }
    });

    // Continue painting on mousemove
    cell.addEventListener('mousemove', () => {
        if (isPainting) {
            paintTile(cell);
        }
    });
});

// Stop painting when mouse is released
document.addEventListener('mouseup', () => {
    isPainting = false;
});

// Helper function to paint a tile
function paintTile(cell) {
    const position = spriteMap[selectedTile];
    cell.setAttribute('data-tile', selectedTile);
    cell.style.backgroundImage = `url('images/sprites.bmp')`;
    cell.style.backgroundSize = `auto`;
    cell.style.backgroundPosition = `-${position.x}px -${position.y}px`;
}

// Create a modal for warp details
const warpModal = document.createElement('div');
warpModal.id = 'warp-modal';
warpModal.style.display = 'none';
warpModal.innerHTML = `
    <div class="modal-content">
        <label for="warp-destination">Destination:</label>
        <input type="text" id="warp-destination" placeholder="Enter map ID">
        <label for="warp-x">X Coordinate:</label>
        <input type="number" id="warp-x" placeholder="Enter X">
        <label for="warp-y">Y Coordinate:</label>
        <input type="number" id="warp-y" placeholder="Enter Y">
        <label for="warp-texture">Texture:</label>
        <input type="text" id="warp-texture" placeholder="Enter texture type">
        <button id="save-warp">Save</button>
        <button id="cancel-warp">Cancel</button>
    </div>
`;
document.body.appendChild(warpModal);

// Add styles for the modal
const modalStyle = document.createElement('style');
modalStyle.innerHTML = `
    #warp-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #ccc;
        padding: 20px;
        z-index: 1000;
    }
    #warp-modal .modal-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    #warp-modal button {
        margin-top: 10px;
    }
`;
document.head.appendChild(modalStyle);

let selectedWarpCell = null; // Track the cell being edited

// Add click functionality for 'warp' tiles
grid.addEventListener('click', event => {
    const cell = event.target;
    if (cell.classList.contains('grid-cell') && cell.getAttribute('data-tile') === 'warp') {
        selectedWarpCell = cell;

        // Pre-fill modal with existing data
        const destination = cell.getAttribute('data-destination') || '';
        const x = cell.getAttribute('data-x') || '';
        const y = cell.getAttribute('data-y') || '';
        const texture = cell.getAttribute('data-texture') || '';

        document.getElementById('warp-destination').value = destination;
        document.getElementById('warp-x').value = x;
        document.getElementById('warp-y').value = y;
        document.getElementById('warp-texture').value = texture;

        warpModal.style.display = 'block';
    }
});

// Save warp details
document.getElementById('save-warp').addEventListener('click', () => {
    if (selectedWarpCell) {
        const destination = document.getElementById('warp-destination').value;
        const x = parseInt(document.getElementById('warp-x').value, 10);
        const y = parseInt(document.getElementById('warp-y').value, 10);
        const texture = document.getElementById('warp-texture').value;

        selectedWarpCell.setAttribute('data-destination', destination);
        selectedWarpCell.setAttribute('data-x', x);
        selectedWarpCell.setAttribute('data-y', y);
        selectedWarpCell.setAttribute('data-texture', texture);

        warpModal.style.display = 'none';
    }
});

// Cancel warp editing
document.getElementById('cancel-warp').addEventListener('click', () => {
    warpModal.style.display = 'none';
    selectedWarpCell = null;
});

// Export map data in the desired format
exportButton.addEventListener('click', () => {
    const mapData = [];
    let currentRow = [];

    grid.querySelectorAll('.grid-cell').forEach((cell, index) => {
        const tileType = cell.getAttribute('data-tile');
        let tileValue = null;

        if (tileType === 'warp') {
            const destination = cell.getAttribute('data-destination');
            const x = cell.getAttribute('data-x');
            const y = cell.getAttribute('data-y');
            const texture = cell.getAttribute('data-texture');

            if (destination && x && y) {
                tileValue = `new WarpTile("${destination}", { x: ${x}, y: ${y} }, "${texture}")`;
            } else {
                tileValue = 'UNDEFINED'; // Default value if no data
            }
        } else {
            tileValue = 
                tileType === "wall" ? "new WallTile()" : 
                tileType === "wallTopRight" ? "new WallTile('wallTopRight')" :
                tileType === "wallTopLeft" ? "new WallTile('wallTopLeft')" :
                tileType === "wallBottomRight" ? "new WallTile('wallBottomRight')" :
                tileType === "wallBottomLeft" ? "new WallTile('wallBottomLeft')" :
                tileType === "wallTop" ? "new WallTile('wallTop')" :
                tileType === "greenBush" ? "new WallTile('greenBush')" :

                tileType === "ground" ? "new GroundTile()" : 
                tileType === "water" ? "new WaterTile()" : 
                tileType === "caveground" ? "new GroundTile('cave')" :
                tileType === "caveWall" ? "new WallTile('caveWall')" :
                null;
        }

        currentRow.push(tileValue);

        if ((index + 1) % 16 === 0) {
            mapData.push(currentRow);
            currentRow = [];
        }
    });

    const mapId = mapIdInput.value || "map";
    const exportFormat = `"${mapId}": [\n` + mapData.map(row => `    [${row.join(', ')}]`).join(",\n") + `\n],`;

    output.value = exportFormat;
});
