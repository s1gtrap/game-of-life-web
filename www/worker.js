importScripts('./pkg/game_of_life_web.js');

const { init, step } = wasm_bindgen;

let life, handle, data;
self.addEventListener('message', async (e) => {
    console.log('msg', e);
    switch (e.data.type) {
        case 'init':
            console.log(`init w=${e.data.width} h=${e.data.height} states.length=${e.data.states.length}`);
            await wasm_bindgen('./pkg/game_of_life_web_bg.wasm');
            handle = init(e.data.width, e.data.height, e.data.states);
            data = new Uint8Array(e.data.width * e.data.height * 4);
            data.set(e.data.states);
            break;

        case 'step':
            console.log('step');
            step(handle, data);
            self.postMessage(data);
            break;
    }
});
