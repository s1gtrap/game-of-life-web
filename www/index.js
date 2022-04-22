// We only need `startup` here which is the main entry point
// In theory, we could also use all other functions/struct types from Rust which we have bound with
// `#[wasm_bindgen]`
const { startup } = wasm_bindgen;

async function run_wasm() {
    // Load the wasm file by awaiting the Promise returned by `wasm_bindgen`
    // `wasm_bindgen` was imported in `index.html`
    //await wasm_bindgen('./pkg/game_of_life_web_bg.wasm');

    const width = 1000;
    const height = 1000;

    const w = new Worker('./worker.js');
    console.log('index.js loaded');
    let c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    let ctx = c.getContext('2d');
    let id = new ImageData(width, height);
    w.onmessage = (e) => {
        id.data.set(e.data[1]);
        ctx.putImageData(id, 0, 0);
    };
    document.body.addEventListener('click', () => {
        w.postMessage(null);
    })
    document.body.appendChild(c);

    // Run main WASM entry point
    // This will create a worker from within our Rust code compiled to WASM
    //startup();
}

run_wasm();
