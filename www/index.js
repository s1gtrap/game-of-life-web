// We only need `startup` here which is the main entry point
// In theory, we could also use all other functions/struct types from Rust which we have bound with
// `#[wasm_bindgen]`
const { startup } = wasm_bindgen;

async function run_wasm() {
    // Load the wasm file by awaiting the Promise returned by `wasm_bindgen`
    // `wasm_bindgen` was imported in `index.html`
    //await wasm_bindgen('./pkg/game_of_life_web_bg.wasm');

    const width = 5;
    const height = 5;

    const w = new Worker('./worker.js');
    let c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    c.style.width = '100%';
    c.style.height = '100%';
    c.style['image-rendering'] = 'pixelated';
    let ctx = c.getContext('2d');
    let id = new ImageData(width, height);
    //id.data.set([120, 180, 44, 255, 99, 110, 255, 255, 0, 0, 255, 255, 255, 0, 0, 255])
    //ctx.putImageData(id, 0, 0);
    w.addEventListener('message', (e) => {
        id.data.set(e.data);
        ctx.putImageData(id, 0, 0);
    });
    const states = [
        0, 0, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 0, 0,
    ].map((d) => [0, 0, 0, d * 255]).flat();
    console.log(states.length);
    w.postMessage({ width, height, states });
    document.body.addEventListener('click', () => {
        w.postMessage(null);
    })
    document.body.appendChild(c);

    // Run main WASM entry point
    // This will create a worker from within our Rust code compiled to WASM
    //startup();
}

run_wasm();
