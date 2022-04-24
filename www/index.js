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

    function load(w, h, s) {
        const data = Array(w * h * 4);
        const lines = s.split('\n');
        if (lines.length >= h) {
            throw new Error('game of life map height out of bounds');
        }
        for (let [i, line] of Object.entries(lines)) {
            if (line.length >= w) {
                throw new Error(`game of life map width at line ${i} out of bounds`);
            }
            for (let j = 0; j < line.length; j++) {
                console.log(line[j]);
                data[i * w * 4 + j * 4 + 3] = line[j] === ' ' ? 0 : 255;
            }
        }
        return data;
    }

    const states = load(oc.width, oc.height, ` #
 #
 #

        ###

      #     #
      #     #
      #     #

        ###


 `);
    console.log(states);

    w.postMessage({ type: 'init', width: oc.width, height: oc.height, states });
    w.postMessage({ type: 'step' });

    document.body.addEventListener('click', () => {
        t = performance.now();
        w.postMessage({ type: 'step' });
    });

    document.body.appendChild(c);
}

run_wasm();
