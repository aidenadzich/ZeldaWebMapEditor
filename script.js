// JavaScript for handling tile placement and export
const grid = document.getElementById('grid');
const tilePicker = document.getElementById('tile-picker');
const output = document.getElementById('output');
const exportButton = document.getElementById('export');
const mapIdInput = document.getElementById('map-id'); // New input for map ID

// Define the size of each texture in the spritesheet
const textureSize = 16; // Each sprite is 16x16 pixels

// Populate the grid with empty tiles
for (let i = 0; i < 16 * 11; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    grid.appendChild(cell);
}

let selectedTile = null; // Store the currently selected tile type
let isPainting = false; // Track whether the user is painting

// Add functionality to select a tile from the picker
tilePicker.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
        selectedTile = tile.getAttribute('data-tile');
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected'); // Highlight the selected tile
    });
});

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
    const position = getSpritePosition(selectedTile);
    cell.setAttribute('data-tile', selectedTile);
    cell.style.backgroundImage = `url('images/sprites.bmp')`;
    cell.style.backgroundSize = `auto`;
    cell.style.backgroundPosition = `-${position.x}px -${position.y}px`;
}

// Get sprite position based on tile type
function getSpritePosition(tileType) {
    const spriteMap = {
        water: { x: 85, y: 160 },
        ground: { x: 1, y: 144 },
        wall: { x: 355, y: 96 },
        cave: { x: 136, y: 194 },
        // Add more tiles here, specifying their top-left corner coordinates
    };
    return spriteMap[tileType] || { x: 0, y: 0 };
}

// Export map data in the desired format
exportButton.addEventListener('click', () => {
    const mapData = [];
    let currentRow = [];

    grid.querySelectorAll('.grid-cell').forEach((cell, index) => {
        // Convert tile types to specific values
        const tileType = cell.getAttribute('data-tile');
        const tileValue = 
        tileType === "wall" ? "'1'" : 
        tileType === "ground" ? "'0'" : 
        tileType === "water" ? "'W'" : 
        tileType === "cave" ? "'WC'" : 
        
        
        
        null;
        currentRow.push(tileValue);

        if ((index + 1) % 16 === 0) {
            mapData.push(currentRow);
            currentRow = [];
        }
    });

    const mapId = mapIdInput.value || "map"; // Get the map ID from the input box
    const exportFormat = `"${mapId}" => [\n` + mapData.map(row => `    [${row.join(', ')}]`).join(",\n") + `\n];`;

    output.value = exportFormat; // Output the formatted string
});
