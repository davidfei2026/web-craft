import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";


// ============================================================
// WEBCRAFT V2
// ============================================================

const game = document.getElementById("game");


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

game.appendChild(renderer.domElement);


// ============================================================
// LIGHTING
// ============================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(20, 30, 10);

scene.add(sun);

const ambient = new THREE.AmbientLight(
    0xffffff,
    0.6
);

scene.add(ambient);


// ============================================================
// BLOCK TYPES
// ============================================================

const BLOCK_TYPES = [
    {
        name: "Grass",
        color: 0x55aa33
    },
    {
        name: "Dirt",
        color: 0x8b5a2b
    },
    {
        name: "Stone",
        color: 0x777777
    },
    {
        name: "Wood",
        color: 0x8b4513
    },
    {
        name: "Leaves",
        color: 0x228b22
    }
];


// ============================================================
// BLOCK MATERIALS
// ============================================================

const materials = BLOCK_TYPES.map(
    block =>
        new THREE.MeshLambertMaterial({
            color: block.color
        })
);


// ============================================================
// BLOCK GEOMETRY
// ============================================================

const blockGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );


// ============================================================
// WORLD
// ============================================================

const blocks = [];


// ============================================================
// CREATE BLOCK
// ============================================================

function createBlock(
    x,
    y,
    z,
    type
) {

    const block =
        new THREE.Mesh(
            blockGeometry,
            materials[type]
        );

    block.position.set(
        x,
        y,
        z
    );

    block.userData.type = type;

    block.userData.isBlock = true;

    scene.add(block);

    blocks.push(block);

    return block;
}


// ============================================================
// REMOVE BLOCK
// ============================================================

function removeBlock(block) {

    const index =
        blocks.indexOf(block);

    if (index !== -1) {

        blocks.splice(
            index,
            1
        );
    }

    scene.remove(block);
}


// ============================================================
// TERRAIN
// ============================================================

const WORLD_SIZE = 24;


function terrainHeight(x, z) {

    return Math.floor(

        Math.sin(
            x * 0.25
        ) * 1.2

        +

        Math.cos(
            z * 0.22
        ) * 1.2

        +

        Math.sin(
            (x + z) * 0.12
        )
    );
}


for (
    let x = -WORLD_SIZE;
    x <= WORLD_SIZE;
    x++
) {

    for (
        let z = -WORLD_SIZE;
        z <= WORLD_SIZE;
        z++
    ) {

        const height =
            terrainHeight(
                x,
                z
            );

        for (
            let y = -3;
            y <= height;
            y++
        ) {

            let type;

            if (
                y === height
            ) {

                type = 0;

            }
            else if (
                y >= height - 2
            ) {

                type = 1;

            }
            else {

                type = 2;

            }

            createBlock(
                x,
                y,
                z,
                type
            );
        }
    }
}


// ============================================================
// TREES
// ============================================================

function createTree(
    x,
    z
) {

    const ground =
        terrainHeight(
            x,
            z
        );


    for (
        let y = 1;
        y <= 4;
        y++
    ) {

        createBlock(
            x,
            ground + y,
            z,
            3
        );
    }


    for (
        let dx = -2;
        dx <= 2;
        dx++
    ) {

        for (
            let dz = -2;
            dz <= 2;
            dz++
        ) {

            for (
                let dy = 3;
                dy <= 5;
                dy++
            ) {

                if (
                    Math.abs(dx) +
                    Math.abs(dz) <= 3
                ) {

                    createBlock(
                        x + dx,
                        ground + dy,
                        z + dz,
                        4
                    );
                }
            }
        }
    }
}


createTree(-8, -8);
createTree(8, -7);
createTree(-10, 8);
createTree(9, 9);


// ============================================================
// PLAYER
// ============================================================

const player = {

    position:
        new THREE.Vector3(
            0,
            6,
            8
        ),

    velocity:
        new THREE.Vector3(),

    speed: 5,

    jumpPower: 8,

    onGround: false
};


camera.position.copy(
    player.position
);


// ============================================================
// KEYBOARD
// ============================================================

const keys = {};

let selectedBlock = 0;


window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;


        // NUMBER KEYS

        if (
            event.code === "Digit1"
        ) {

            selectBlock(0);
        }

        if (
            event.code === "Digit2"
        ) {

            selectBlock(1);
        }

        if (
            event.code === "Digit3"
        ) {

            selectBlock(2);
        }

        if (
            event.code === "Digit4"
        ) {

            selectBlock(3);
        }

        if (
            event.code === "Digit5"
        ) {

            selectBlock(4);
        }


        // JUMP

        if (
            event.code === "Space" &&
            player.onGround
        ) {

            player.velocity.y =
                player.jumpPower;

            player.onGround =
                false;
        }
    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;
    }
);


// ============================================================
// HOTBAR
// ============================================================

function selectBlock(index) {

    if (
        index < 0 ||
        index >= BLOCK_TYPES.length
    ) {

        return;
    }

    selectedBlock = index;

    const slots =
        document.querySelectorAll(
            ".slot"
        );

    slots.forEach(
        (slot, i) => {

            slot.classList.toggle(
                "selected",
                i === index
            );
        }
    );

    console.log(
        "Selected:",
        BLOCK_TYPES[index].name
    );
}


selectBlock(0);


// ============================================================
// MOUSE LOOK
// ============================================================

let yaw = 0;

let pitch = 0;

let mouseLocked = false;


renderer.domElement.addEventListener(
    "click",
    () => {

        document.body.requestPointerLock();

    }
);


document.addEventListener(
    "pointerlockchange",
    () => {

        mouseLocked =
            document.pointerLockElement ===
            document.body;

    }
);


document.addEventListener(
    "mousemove",
    event => {

        if (!mouseLocked) {
            return;
        }

        yaw -=
            event.movementX * 0.002;

        pitch -=
            event.movementY * 0.002;


        const limit =
            Math.PI / 2 - 0.05;


        pitch =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    pitch
                )
            );
    }
);


// ============================================================
// RAYCASTER
// ============================================================

const raycaster =
    new THREE.Raycaster();

const center =
    new THREE.Vector2(
        0,
        0
    );


function getTargetBlock() {

    raycaster.setFromCamera(
        center,
        camera
    );

    const hits =
        raycaster.intersectObjects(
            blocks,
            false
        );

    if (
        hits.length === 0
    ) {

        return null;
    }

    return hits[0];
}


// ============================================================
// BREAK BLOCK
// ============================================================

function breakBlock() {

    const hit =
        getTargetBlock();


    if (!hit) {

        return;
    }


    const block =
        hit.object;


    if (
        block.position.y <= -3
    ) {

        return;
    }


    removeBlock(
        block
    );
}


// ============================================================
// BLOCK EXISTS
// ============================================================

function blockExists(
    position
) {

    return blocks.some(
        block =>

            block.position.x ===
                position.x &&

            block.position.y ===
                position.y &&

            block.position.z ===
                position.z
    );
}


// ============================================================
// PLAYER COLLISION
// ============================================================

function blockIntersectsPlayer(
    position
) {

    const playerBox =
        new THREE.Box3();

    playerBox.setFromCenterAndSize(

        player.position.clone().add(
            new THREE.Vector3(
                0,
                -0.9,
                0
            )
        ),

        new THREE.Vector3(
            0.8,
            1.8,
            0.8
        )
    );


    const blockBox =
        new THREE.Box3();

    blockBox.setFromCenterAndSize(

        position,

        new THREE.Vector3(
            1,
            1,
            1
        )
    );


    return playerBox.intersectsBox(
        blockBox
    );
}


// ============================================================
// PLACE BLOCK
// ============================================================

function placeBlock() {

    const hit =
        getTargetBlock();


    if (!hit) {

        return;
    }


    const block =
        hit.object;


    const normal =
        hit.face.normal.clone();


    normal.transformDirection(
        block.matrixWorld
    );


    const position =
        block.position.clone();


    position.add(
        normal
    );


    position.x =
        Math.round(
            position.x
        );

    position.y =
        Math.round(
            position.y
        );

    position.z =
        Math.round(
            position.z
        );


    if (
        blockIntersectsPlayer(
            position
        )
    ) {

        return;
    }


    if (
        blockExists(
            position
        )
    ) {

        return;
    }


    createBlock(
        position.x,
        position.y,
        position.z,
        selectedBlock
    );
}


// ============================================================
// MOUSE CONTROLS
// ============================================================

document.addEventListener(
    "mousedown",
    event => {

        if (
            !mouseLocked
        ) {

            return;
        }


        // LEFT CLICK

        if (
            event.button === 0
        ) {

            event.preventDefault();

            breakBlock();
        }


        // RIGHT CLICK

        if (
            event.button === 2
        ) {

            event.preventDefault();

            placeBlock();
        }
    }
);


// ============================================================
// RIGHT CLICK MENU
// ============================================================

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


// ============================================================
// MOUSE WHEEL
// ============================================================

document.addEventListener(
    "wheel",
    event => {

        if (
            !mouseLocked
        ) {

            return;
        }


        if (
            event.deltaY > 0
        ) {

            selectedBlock++;

        }
        else {

            selectedBlock--;
        }


        if (
            selectedBlock < 0
        ) {

            selectedBlock =
                BLOCK_TYPES.length - 1;
        }


        if (
            selectedBlock >=
            BLOCK_TYPES.length
        ) {

            selectedBlock = 0;
        }


        selectBlock(
            selectedBlock
        );
    }
);


// ============================================================
// PLAYER MOVEMENT
// ============================================================

function updatePlayer(
    delta
) {

    const movement =
        new THREE.Vector3();


    if (
        keys["KeyW"]
    ) {

        movement.z -= 1;
    }


    if (
        keys["KeyS"]
    ) {

        movement.z += 1;
    }


    if (
        keys["KeyA"]
    ) {

        movement.x -= 1;
    }


    if (
        keys["KeyD"]
    ) {

        movement.x += 1;
    }


    if (
        movement.lengthSq() > 0
    ) {

        movement.normalize();


        movement.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            yaw
        );


        player.position.x +=
            movement.x *
            player.speed *
            delta;


        player.position.z +=
            movement.z *
            player.speed *
            delta;
    }


    // GRAVITY

    player.velocity.y -=
        20 * delta;


    player.position.y +=
        player.velocity.y *
        delta;


    // GROUND

    const ground =
        terrainHeight(
            Math.round(
                player.position.x
            ),
            Math.round(
                player.position.z
            )
        );


    const floor =
        ground + 2;


    if (
        player.position.y <
        floor
    ) {

        player.position.y =
            floor;

        player.velocity.y = 0;

        player.onGround = true;

    }
    else {

        player.onGround = false;
    }
}


// ============================================================
// CAMERA
// ============================================================

function updateCamera() {

    camera.position.copy(
        player.position
    );


    camera.rotation.order =
        "YXZ";


    camera.rotation.y =
        yaw;


    camera.rotation.x =
        pitch;
}


// ============================================================
// GAME LOOP
// ============================================================

const clock =
    new THREE.Clock();


function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    updatePlayer(
        delta
    );


    updateCamera();


    renderer.render(
        scene,
        camera
    );
}


gameLoop();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
