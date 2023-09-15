<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let input: HTMLInputElement;
  let ctx: CanvasRenderingContext2D | null;
  let link: HTMLAnchorElement;

  onMount(() => {
    console.log("mount page");
    ctx = canvas.getContext('2d');
  });

  const uploadImage = () => {
    console.log("upload image");

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("onload image");

      const imageUrl = e.target!.result;
      const img = new Image();
      if (typeof imageUrl === "string") {
        img.src = imageUrl;
      }

      img.onload = () => {
        if (!ctx) { return }

        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let src = ctx.getImageData(0, 0, img.width, img.height);
        let dst = ctx.createImageData(img.width, img.height);

        for (let i = 0; i < src.data.length; i += 4) {
          let y = 0.2126 * src.data[i] +
                  0.7152 * src.data[i + 1] +
                  0.0722 * src.data[i + 2];
          y = parseInt(String(y), 10);
          dst.data[i] = y;
          dst.data[i + 1] = y;
          dst.data[i + 2] = y;
          dst.data[i + 3] = src.data[i + 3];
        }
        ctx.putImageData(dst, 0, 0);

        // complete task!
        link.style.display = "block";
      }
    }

    if (input.files) {
      reader.readAsDataURL(input.files[0]);
    }
  }
</script>

<main>
  <h1>MIDI art (wip)</h1>
  <p>1. Upload your image.</p>

  <input bind:this={input} type="file" aria-label="Upload image" on:change={() => uploadImage()} accept="image/*">

  <p>preview</p>
  <canvas bind:this={canvas}></canvas>

  <p>Setting</p>
  <p>width: [ 4bar ], note length: [ 1/16 ]</p>
  <p>height: [ C1 ] to [ G8 ]</p>

  <p><a bind:this={link} href="#" download style="display: none;">Download MIDI</a></p>

  <p>2. Open midi file in your DAW.</p>
</main>

<footer>
  &copy; 2023 mimoz
</footer>
