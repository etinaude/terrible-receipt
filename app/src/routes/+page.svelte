<script lang="ts">
	import { Printer, WebUSB, Align, Style, Image, type ImageData } from 'escpos-buffer';
	import { fade, slide } from 'svelte/transition';
	import wrap from 'word-wrap';
	let loaded = false;

	let printer: Printer | undefined = undefined;
	const connect = async () => {
		const device = await navigator.usb.requestDevice({
			filters: [
				// {
				// 	vendorId: 0x0456
				// }
			]
		});
		const connection = new WebUSB(device);
		printer = await Printer.CONNECT('POS-80', connection);
		await printer.setColumns(32);
		loaded = true;
	};
	let processing = false;
	const print = async () => {
		if (processing) return;
		processing = true;
		const desc = await fetch('/api/idea').then((r) => r.json());
		ideas = [...ideas, desc];
		processing = false;
		if (!printer) {
			console.log(desc);
			return;
		}
		try {
			await printer.withStyle(
				{
					// italic: true,
					align: Align.Center
				},
				async () => {
					const lines = wrap(desc.replaceAll(/[^\x00-\x7F]+/g, ' '), {
						width: 30,
						trim: true
					}).split('\n');
					for (const line of lines) {
						await printer!.writeln(line);
					}
				}
			);
			await printer.feed(5);
			await printer.cutter();
		} catch (error) {
			console.log("Wow, looks like the printer didn't work!", error);
			return;
		}
	};

	let ideas: string[] = [];
</script>

<svelte:window
	on:keydown={(e) => {
		if ((e.key === 'b' || e.key === 'PageDown') && loaded) {
			print();
		}
	}}
/>

<main class="receipt receipt-after">
	<h1>Terrible Receipt Printer</h1>
	<p>
		Welcome! This is a hastily-made app to print out receipts of all the terrible ideas you could
		possibly dream up. View the source here:
		<a href="https://github.com/hexacubist/terrible-receipt" target="_blank"
			>hexacubist/terrible-receipt</a
		>
	</p>
	{#if loaded}
		<div in:fade>
			<p class="text-center font-bold mt-3">Press "B" or "PageDown" to print an idea!</p>
			<button class="mx-auto block text-center mt-2 bg-green-600" on:click={() => print()}
				>Or, click here!</button
			>
		</div>
	{:else}
		<div class="pt-3 flex flex-wrap gap-3 justify-center">
			<button
				on:click={() => {
					connect();
				}}>Connect to printer</button
			>
			<button
				on:click={() => {
					loaded = true;
				}}>Skip</button
			>
		</div>
	{/if}
	{#if processing}
		<div
			class="absolute inset-0 bg-white bg-opacity-80 backdrop-blur flex justify-center align-middle items-center"
			transition:fade
		>
			<div class="text-6xl text-center animate-bounce">❤️‍🔥</div>
		</div>
	{/if}
</main>

{#each ideas.reverse().slice(0, Math.min(ideas.length, 3)) as idea (idea)}
	<div class="receipt receipt-after receipt-before" in:slide>
		<q class="text-center block font-mono text-lg">{idea}</q>
	</div>
{/each}

<style lang="postcss">
	:global(body) {
		@apply bg-cover bg-fixed;
		background-image: linear-gradient(135deg, #ccffff 0%, #ffffcc 50%, #ffccff 100%);
	}
	h1 {
		@apply mb-4 text-center text-4xl font-bold;
	}
	a {
		@apply text-blue-600 underline;
	}
	.receipt {
		@apply m-4 mx-auto w-full max-w-prose rounded bg-white px-7 py-6 drop-shadow-md;
		--zag-size: 0.8rem;
		&.receipt-after {
			@apply rounded-b-none;
			&:after {
				@apply absolute left-0 top-full block w-full;
				@apply bg-left-bottom bg-repeat-x;
				height: var(--zag-size);
				background: linear-gradient(-45deg, transparent var(--zag-size), #fff var(--zag-size)),
					linear-gradient(45deg, transparent var(--zag-size), #fff 0);
				background-size: var(--zag-size) var(--zag-size);
				content: ' ';
			}
		}
		&.receipt-before {
			@apply mt-10 rounded-t-none;
			&:before {
				@apply absolute bottom-full left-0 block w-full;
				@apply bg-left-bottom bg-repeat-x;
				height: var(--zag-size);
				background: linear-gradient(-45deg, #fff calc(var(--zag-size) / 2), transparent 0),
					linear-gradient(45deg, #fff calc(var(--zag-size) / 2), transparent 0);
				background-size: var(--zag-size) var(--zag-size);
				content: ' ';
			}
		}
	}
	main {
		@apply mt-16;
	}
	button {
		@apply rounded bg-black bg-opacity-100 px-4 py-2 font-bold text-white transition;
		&:hover {
			@apply bg-opacity-70;
		}
	}
</style>
