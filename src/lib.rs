use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Handle(game_of_life::Handle);

#[wasm_bindgen]
pub fn init(w: usize, h: usize, s: &[u8]) -> Handle {
    Handle(game_of_life::init(w, h, s))
}

#[wasm_bindgen]
pub fn step(h: &mut Handle, buf: &mut [u8]) {
    game_of_life::step(&mut h.0, buf);
}

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();

    wasm_logger::init(wasm_logger::Config::default());
}
