const { startup } = wasm_bindgen;

async function createGameOfLife() {
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

        //console.log(performance.now() - t);
        id.data.set(e.data);
        octx.putImageData(id, 0, 0);
        let p = ctx.createPattern(oc, 'repeat');
        ctx.fillStyle = p;
        ctx.fillRect(0, 0, c.width, c.height);

        //console.log('render');
        //console.log(performance.now() - t);
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
                data[i * w * 4 + j * 4 + 3] = line[j] === ' ' ? 0 : 255;
            }
        }
        return data;
    }

    let states = load(oc.width, oc.height, ` #
 #
 #

        ###

      #     #
      #     #
      #     #

        ###


 `);
    states = [...Array(oc.width * oc.height).keys()].map((d) => [0, 0, 0, Math.random() > 0.9 ? 255 : 0]).flat();

    id.data.set(states);
    octx.putImageData(id, 0, 0);
    let p = ctx.createPattern(oc, 'repeat');
    ctx.fillStyle = p;
    ctx.fillRect(0, 0, c.width, c.height);

    w.postMessage({ type: 'init', width: oc.width, height: oc.height, states });

    let t0 = 0;
    requestAnimationFrame(function frame(t) {
        if (t - t0 > 1000) {
            w.postMessage({ type: 'step' });
            t0 = t;
        }
        requestAnimationFrame(frame);
    });

    document.body.addEventListener('click', () => {
        //t = performance.now();
        //w.postMessage({ type: 'step' });
    });

    return c;
}

//(async () => document.body.appendChild(await createGameOfLife()))();
