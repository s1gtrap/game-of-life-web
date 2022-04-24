const { startup } = wasm_bindgen;

async function run_wasm() {
    let c = document.createElement('canvas');
    c.width = document.body.clientWidth;
    c.height = document.body.clientHeight;
    c.style['image-rendering'] = 'pixelated';

    let ctx = c.getContext('2d');
    let oc = new OffscreenCanvas(1024, 1024);
    let octx = oc.getContext('2d');

    let id = new ImageData(oc.width, oc.height);

    const w = new Worker('./worker.js');
    let t;
    w.addEventListener('message', (e) => {
        ctx.clearRect(0, 0, c.width, c.height);

        console.log(performance.now() - t);
        id.data.set(e.data);
        octx.putImageData(id, 0, 0);
        let p = ctx.createPattern(oc, 'repeat');
        ctx.fillStyle = p;
        ctx.fillRect(0, 0, c.width, c.height);

        console.log('render');
        console.log(performance.now() - t);
    });

    window.addEventListener('resize', (e) => {
        c.width = document.body.clientWidth;
        c.height = document.body.clientHeight;

        let p = ctx.createPattern(oc, 'repeat');
        ctx.fillStyle = p;
        ctx.fillRect(0, 0, c.width, c.height);
        console.log('render');
    });

    const states = [...Array(oc.width * oc.height).keys()].map((d) => [0, 0, 0, Math.random() > 0.9 ? 255 : 0]).flat();
    w.postMessage({ type: 'init', width: oc.width, height: oc.height, states });
    w.postMessage({ type: 'step' });

    document.body.addEventListener('click', () => {
        t = performance.now();
        w.postMessage({ type: 'step' });
    });

    document.body.appendChild(c);
}

run_wasm();
