function edit(a) {
  a.data[3] = 255;
}
(async () => {
  try {
    const game = await import('./pkg');

    const scale = 1;
    const c = document.createElement('canvas');
    document.body.style.margin = 0;
    const body = document.body;
    const html = document.documentElement;
    const dwidth = Math.max(body.scrollWidth, body.offsetWidth,
      html.clientWidth, html.scrollWidth, html.offsetWidth);
    const dheight = Math.max(body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight);
    const height2 = Math.floor(dheight / scale);
    const width2 = Math.floor(dwidth / scale);
    const width = width2, height = height2;
    //const width = 1000, height = 1000;
    c.width = width;
    c.height = height;
    c.style.width = `${dwidth}px`;
    c.style.height = `${dheight}px`;
    c.style['z-index'] = -1;
    c.style['image-rendering'] = 'pixelated';
    const ctx = c.getContext('2d');
    function drawBlinker(ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(2, 1, 1, 3);
    }
    function drawRandom(ctx) {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          ctx.fillStyle = "#000";
          if (Math.random() > 0.9) {
            ctx.fillRect(j, i, 1, 1);
          }
        }
      }
    }
    drawRandom(ctx);
    console.log(c.width, c.height);
    const id = ctx.getImageData(0, 0, width, height);

    const life = game.init(width, height, id.data);

    let i = 0;
    function frame() {
      if (i++ % 60 == 0) {
        const t0 = performance.now();
        game.step(life, id.data);
        console.log(performance.now() - t0);
        ctx.putImageData(id, 0, 0);
      }
      requestAnimationFrame(frame);
    }
    frame();

    document.body.appendChild(c);

    /*requestAnimationFrame(frame);*/

    /*const game = await import('./pkg');
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    console.log("test");
    game.step(ctx.getImageData(0, 0, 640, 480));*/
  } catch (e) {
    console.error(e);
  }
})();
