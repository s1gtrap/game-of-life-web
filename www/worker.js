// The worker has its own scope and no direct access to functions/objects of the
// global scope. We import the generated JS file to make `wasm_bindgen`
// available which we need to initialize our WASM code.
importScripts('./pkg/game_of_life_web.js');

// In the worker, we have a different struct that we want to use as in
// `index.js`.
const { init, step } = wasm_bindgen;

async function init_wasm_in_worker() {
    // Load the wasm file by awaiting the Promise returned by `wasm_bindgen`.
    await wasm_bindgen('./pkg/game_of_life_web_bg.wasm');
    console.log('loaded');
    const width = 2;
    const height = 2;

    // Create a new object of the `NumberEval` struct.
    let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.random() * 255;
    }
    for (let i = 3; i < width * height * 4; i += 4) {
        if (Math.random() > 0.01) {
            arr[i] = ~arr[i];
        }
    }
    let h = init(width, height, arr);
    let data = new Uint8Array(width * height * 4);

    console.log('loaded2');
    // Set callback to handle messages passed to the worker.
    self.onmessage = (e) => {
        console.log('STEO');
        step(h, data);
        self.postMessage([performance.now(), data]);
    };
};

self.addEventListener('message', async ({ data: { width, height, states } }) => {
    console.log('init');
    const gol = await wasm_bindgen('./pkg/game_of_life_web_bg.wasm');
    let h = init(width, height, states);
    let data = new Uint8Array(width * height * 4);
    data.set(states);
    self.addEventListener('message', (e) => {
        console.log('step');
        step(h, data);
        self.postMessage(data);
    });
}, {
    once: true,
});

//init_wasm_in_worker();
