<script lang="ts">
	import { grayScaleImageData, pickColor, toImage } from "$lib/image";
	import { pitchToMidi } from "$lib/midi";
	import { onMount } from "svelte";
	import { Midi } from "@tonejs/midi"

	let canvas: HTMLCanvasElement;
	let input: HTMLInputElement;
	let ctx: CanvasRenderingContext2D | null;
	let link: HTMLAnchorElement;

	let pixelSizeX = 16 * 4;
	let pixelSizeY = pitchToMidi("G8") - pitchToMidi("C3") + 1;

	onMount(() => {
		ctx = canvas.getContext("2d");
	});

	const uploadImage = () => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const imageUrl = e.target!.result;
			const img = new Image();
			if (typeof imageUrl === "string") img.src = imageUrl;

			img.onload = () => {
				if (!ctx) return;
				ctx.canvas.width = img.width;
				ctx.canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				const src = ctx.getImageData(0, 0, img.width, img.height);
        const grayed = grayScaleImageData(ctx, src);
				ctx.putImageData(grayed, 0, 0);

				toImage(grayed).then((i) => {
					if (!ctx) return;
					ctx.canvas.width = pixelSizeX;
					ctx.canvas.height = pixelSizeY;
					ctx.drawImage(i, 0, 0, pixelSizeX, pixelSizeY);
					const imgData = ctx.getImageData(0, 0, pixelSizeX, pixelSizeY);

					// generate midi
					const midi = new Midi();
					const track = midi.addTrack();

					const duration = 1 / 8;
					const midiMax = pitchToMidi("G8");

					for (let y = 0; y < imgData.height; y++) {
						for (let x = 0; x < imgData.width; x++) {
							const velocity = pickColor(imgData, x, y)[0] / 256;
							track.addNote({
								midi : midiMax - y,
								time : x * duration * 2,
								duration: duration * 2,
								velocity: Math.max(velocity, 1 / 127)
							})
						}
					}

					const blob = new Blob([midi.toArray().buffer], { type: "audio/midi"});

					// complete task!
					link.href = URL.createObjectURL(blob);
					link.download = "output.mid";
					link.style.display = "block";
				})
			};
		};

		if (input.files) reader.readAsDataURL(input.files[0]);
	};
</script>

<main>
	<h1>MIDI art (wip)</h1>
	<p>1. Upload your image.</p>

	<input
		bind:this={input}
		type="file"
		aria-label="Upload image"
		on:change={() => uploadImage()}
		accept="image/*"
	/>

	<p>preview</p>
	<canvas bind:this={canvas} />

	<!-- <p>Setting</p>
	<p>width: [ 4bar ], note length: [ 1/16 ]</p>
	<p>height: [ C1 ] to [ G8 ]</p> -->

	<p><a bind:this={link} href="#" download style="display: none;">Download MIDI</a></p>

	<p>2. Open midi file in your DAW.</p>
</main>

<footer>&copy; 2023 mimoz</footer>
