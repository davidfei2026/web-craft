import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";


// ============================================================
// GAME SETUP
// ============================================================

const game =
    document.getElementById("game");


// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
            window.innerHeight,
        0.1,
        1000
    );


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

game.appendChild(
    renderer.domElement
);


// ============================================================
// LIGHTING
// ============================================================

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sun.position.set(
    20,
    30,
    10
);

scene.add(sun);


const ambient =
    new THREE.AmbientLight(
        0xffffff,
        0.55
    );

scene.add(ambient);


// ============================================================
// BLOCK TYPES
// ============================================================

const BLOCKS = {

    grass: {
        name: "Grass",
        color: 0x55aa33
    },

    dirt: {
        name: "Dirt",
        color: 0x8b5a2b
    },

    stone: {
        name: "Stone",
        color: 0x777777
    },

    wood: {
        name: "Wood",
        color: 0x8b4513
    },

    leaves: {
        name: "Leaves",
        color: 0x228b22
    }

};


// ============================================================
// MATERIALS
// ============================================================

const materials = {};

for (
    const type in BLOCKS
) {

    materials[type] =
        new THREE.MeshLambertMaterial({
            color:
                BLOCKS[type].color
        });

}


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
// WORLD DATA
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

    block.userData.type =
        type;

    block.userData.isBlock =
        true;

    scene.add(block);

    blocks.push(block);

    return block;
}


// ============================================================
// REMOVE BLOCK
// ============================================================

function removeBlock(
    block
) {

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


function terrainHeight(
    x,
    z
) {

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

                type = "grass";

            }

            else if (
                y >= height - 2
            ) {

                type = "dirt";

            }

            else {

                type = "stone";

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
            "wood"
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
                    Math.abs(dz)
                    <= 3
                ) {

                    createBlock(
                        x + dx,
                        ground + dy,
                        z + dz,
                        "leaves"
                    );

                }

            }

        }

    }

}


createTree(
    -8,
    -8
);

createTree(
    8,
    -7
);

createTree(
    -10,
    8
);

createTree(
    9,
    9
);


// ============================================================
// PLAYER
// ============================================================

const player = {

    position:
        new THREE.Vector3(
            0,
            5,
            8
        ),

    velocity:
        new THREE.Vector3(),

    speed: 5,

    jumpPower: 8,

    onGround: false,

    height: 1.8

};


camera.position.copy(
    player.position
);


// ============================================================
// INPUT
// ============================================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;


        // Number keys

        if (
            event.code >= "Digit1" &&
            event.code <= "Digit5"
        ) {

            const number =
                Number(
                    event.code
                        .replace(
                            "Digit",
                            ""
                        )
                );

            selectBlock(
                number - 1
            );

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.code] =
            false;

    }
);


// ============================================================
// HOTBAR
// ============================================================

const hotbarTypes = [

    "grass",
    "dirt",
    "stone",
    "wood",
    "leaves"

];


let selectedBlock = 0;


function selectBlock(
    index
) {

    if (
        index < 0 ||
        index >= hotbarTypes.length
    ) {

        return;

    }

    selectedBlock =
        index;


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

}


// ============================================================
// MOUSE LOOK
// ============================================================

let yaw = 0;

let pitch = 0;


document.body.addEventListener(
    "click",
    () => {

        if (
            document.pointerLockElement !==
            document.body
        ) {

            document.body.requestPointerLock();

        }

    }
);


document.addEventListener(
    "mousemove",
    event => {

        if (
            document.pointerLockElement !==
            document.body
        ) {

            return;

        }


        yaw -=
            event.movementX *
            0.002;


        pitch -=
            event.movementY *
            0.002;


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
// RAYCASTING
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


    // Don't allow removing
    // blocks underneath the world.

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
// PLAYER COLLISION CHECK
// ============================================================

function blockWouldHitPlayer(
    position
) {

    const playerBox =
        new THREE.Box3().setFromCenterAndSize(

            new THREE.Vector3(
                player.position.x,
                player.position.y,
                player.position.z
            ),

            new THREE.Vector3(
                0.8,
                1.8,
                0.8
            )

        );


    const blockBox =
        new THREE.Box3().setFromCenterAndSize(

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
        hit.face.normal;


    const position =
        block.position.clone();


    position.add(
        normal
    );


    // Prevent placing
    // inside the player.

    if (
        blockWouldHitPlayer(
            position
        )
    ) {

        return;

    }


    // Prevent duplicate
    // blocks at the same location.

    const occupied =
        blocks.some(
            existing => {

                return (
                    existing.position.x ===
                        position.x &&

                    existing.position.y ===
                        position.y &&

                    existing.position.z ===
                        position.z
                );

            }
        );


    if (
        occupied
    ) {

        return;

    }


    createBlock(
        position.x,
        position.y,
        position.z,
        hotbarTypes[
            selectedBlock
        ]
    );

}


// ============================================================
// MOUSE BUTTONS
// ============================================================

window.addEventListener(
    "mousedown",
    event => {

        if (
            document.pointerLockElement !==
            document.body
        ) {

            return;

        }


        if (
            event.button === 0
        ) {

            breakBlock();

        }


        if (
            event.button === 2
        ) {

            placeBlock();

        }

    }
);


// Disable browser
// right-click menu.

window.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


// ============================================================
// MOUSE WHEEL
// ============================================================

window.addEventListener(
    "wheel",
    event => {

        if (
            event.deltaY > 0
        ) {

            selectedBlock++;

        } else {

            selectedBlock--;

        }


        if (
            selectedBlock < 0
        ) {

            selectedBlock =
                hotbarTypes.length - 1;

        }


        if (
            selectedBlock >=
            hotbarTypes.length
        ) {

            selectedBlock = 0;

        }


        selectBlock(
            selectedBlock
        );

    }
);


// ============================================================
// JUMP
// ============================================================

window.addEventListener(
    "keydown",
    event => {

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


// ============================================================
// MOVEMENT
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


    // Gravity

    player.velocity.y -=
        20 * delta;


    player.position.y +=
        player.velocity.y *
        delta;


    // Simple terrain collision

    const ground =
        terrainHeight(
            Math.round(
                player.position.x
            ),
            Math.round(
                player.position.z
            )
        );


    const minimumHeight =
        ground + 2;


    if (
        player.position.y <
        minimumHeight
    ) {

        player.position.y =
            minimumHeight;

        player.velocity.y =
            0;

        player.onGround =
            true;

    } else {

        player.onGround =
            false;

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
