<script lang="ts">
	import HoneycombTile from './HoneycombTile.svelte'
	import { fadeInAttach } from '@utils/fade-in'

	type Theme = 'main' | 'lab' | 'correlaidx'

	interface Item {
		title?: string
		content?: string
		href?: string
		target?: string
		rel?: string
		bg?: string
		labelColor?: string
	}

	interface Props {
		items?: Item[]
		colorMode?: 'manual' | 'gradient'
		theme?: Theme
		children?: import('svelte').Snippet
	}

	let {
		items = [],
		colorMode = 'gradient',
		theme = 'lab',
		children
	}: Props = $props()

	const themeStops: Record<Theme, { r: number; g: number; b: number }[]> = {
		main: [
			{ r: 71, g: 135, b: 229 }, // #4787e5
			{ r: 137, g: 204, b: 150 }, // #89cc96
			{ r: 196, g: 227, b: 138 } // #c4e38a
		],
		lab: [
			{ r: 71, g: 135, b: 229 }, // #4787e5
			{ r: 255, g: 164, b: 190 } // #ffa4be
		],
		correlaidx: [
			{ r: 233, g: 69, b: 83 }, // #e94553
			{ r: 179, g: 90, b: 117 }, // #b35a75
			{ r: 91, g: 102, b: 158 }, // #5b669e
			{ r: 33, g: 79, b: 143 } // #214f8f
		]
	}

	const defaultColors = [
		{ bg: 'var(--color-primary)' },
		{ bg: 'var(--color-tertiary)', labelColor: 'var(--color-text)' },
		{ bg: 'var(--color-lab-pink-medium)', labelColor: 'var(--color-lab-text-on-light)' },
		{ bg: 'var(--color-lab-blue-medium)', labelColor: 'var(--color-black)' },
		{ bg: 'var(--color-secondary)', labelColor: 'var(--color-text)' },
		{ bg: 'var(--color-lab-blue-dark)' }
	]

	let isDesktop = $state(false)

	import { onMount } from 'svelte'
	onMount(() => {
		const mq = window.matchMedia('(width > 500px)')
		isDesktop = mq.matches
		const handler = (e: MediaQueryListEvent) => (isDesktop = e.matches)
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	})

	function interpolateColor(ratio: number): string {
		const stops = themeStops[theme]
		const alpha = theme === 'lab' ? 0.6 : 1.0

		if (stops.length < 2) return `rgba(${stops[0].r}, ${stops[0].g}, ${stops[0].b}, ${alpha})`

		const scaledRatio = ratio * (stops.length - 1)
		const i = Math.floor(scaledRatio)
		const nextI = Math.min(i + 1, stops.length - 1)
		const factor = scaledRatio - i

		const c1 = stops[i]
		const c2 = stops[nextI]

		const r = Math.round(c1.r + (c2.r - c1.r) * factor)
		const g = Math.round(c1.g + (c2.g - c1.g) * factor)
		const b = Math.round(c1.b + (c2.b - c1.b) * factor)

		return `rgba(${r}, ${g}, ${b}, ${alpha})`
	}

	function getRatio(i: number) {
		if (isDesktop) {
			const rowMod = i % 6
			const cols = [1, 3, 5, 2, 4, 6]
			return (cols[rowMod] - 1) / 5
		} else {
			const rowMod = i % 3
			const cols = [2, 3, 1]
			return (cols[rowMod] - 1) / 2
		}
	}
</script>

<div class="honeycomb">
	{#if items.length > 0}
		{#each items as item, i (i)}
			{@const backgroundColor =
				colorMode === 'gradient'
					? interpolateColor(getRatio(i))
					: item.bg || defaultColors[i % defaultColors.length].bg}
			{@const labelColor =
				item.labelColor ||
				(colorMode === 'manual' ? defaultColors[i % defaultColors.length].labelColor : undefined)}
			<div class="hex-grid-item" use:fadeInAttach={{ delay: i * 150 }}>
				<HoneycombTile
					href={item.href}
					target={item.target}
					rel={item.rel}
					bg={backgroundColor}
					{labelColor}
					underConstruction={!item.href}
					{theme}>
					<div class="tile-content">
						<strong>{@html item.title || item.content}</strong>
					</div>
				</HoneycombTile>
			</div>
		{/each}
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.honeycomb {
		--gap: 4px;
		--hex-width: calc((100cqi - 1.5 * var(--gap)) / 2.5);
		--hex-height: calc(var(--hex-width) * 1.1547);
		--interlock-step: calc(var(--hex-height) * 0.25);

		display: grid;
		container-type: inline-size;
		grid-template-columns: repeat(5, 1fr);
		grid-auto-flow: dense;
		column-gap: var(--gap);
		row-gap: calc(var(--gap) * 0.866);
		margin-block: 2rem;
		isolation: isolate;

		@media (width > 500px) {
			--gap: 12px;
			--hex-width: calc((100cqi - 2.5 * var(--gap)) / 3.5);
			grid-template-columns: repeat(7, 1fr);
		}

		/* Desaturate non-hovered hexes when any hex is hovered */
		:global(&:has(:hover) > *:not(:has(:hover))) {
			opacity: 0.4;
			filter: grayscale(100%) brightness(0.8);
		}

		/* Hovered item floats above all rows */
		:global(& > *:has(:hover)) {
			z-index: 20;
		}
	}

	.honeycomb > :global(*),
	.hex-grid-item {
		position: relative;
		pointer-events: none;
		transition:
			opacity 0.6s ease-in-out,
			filter 0.6s ease-in-out;

		/* -- MOBILE: period = 4 (2 per row, interlocking) -- */
		/* Columns */
		&:nth-child(4n + 1) {
			grid-column: 1 / span 2;
		}
		&:nth-child(4n + 2) {
			grid-column: 3 / span 2;
		}
		&:nth-child(4n + 3) {
			grid-column: 2 / span 2;
		}
		&:nth-child(4n + 4) {
			grid-column: 4 / span 2;
		}

		/* Rows: groups of 2. Negative margin-block-start on rows 2+ pulls them up into prior row (interlock) AND shrinks grid container so no trailing gap. */
		&:nth-child(n + 3) {
			margin-block-start: calc(-1 * var(--interlock-step));
		}
		&:nth-child(1),
		&:nth-child(2) {
			z-index: 10;
		}
		&:nth-child(3),
		&:nth-child(4) {
			z-index: 9;
		}
		&:nth-child(5),
		&:nth-child(6) {
			z-index: 8;
		}
		&:nth-child(7),
		&:nth-child(8) {
			z-index: 7;
		}
		&:nth-child(9),
		&:nth-child(10) {
			z-index: 6;
		}
		&:nth-child(11),
		&:nth-child(12) {
			z-index: 5;
		}
		&:nth-child(13),
		&:nth-child(14) {
			z-index: 4;
		}
		&:nth-child(15),
		&:nth-child(16) {
			z-index: 3;
		}
		&:nth-child(17),
		&:nth-child(18) {
			z-index: 2;
		}
		&:nth-child(19),
		&:nth-child(20) {
			z-index: 1;
		}

		/* -- DESKTOP: period = 6 (3 in Row A, 3 shifted in Row B) -- */
		@media (width > 500px) {
			/* Columns */
			&:nth-child(6n + 1) {
				grid-column: 1 / span 2;
			}
			&:nth-child(6n + 2) {
				grid-column: 3 / span 2;
			}
			&:nth-child(6n + 3) {
				grid-column: 5 / span 2;
			}
			&:nth-child(6n + 4) {
				grid-column: 2 / span 2;
			}
			&:nth-child(6n + 5) {
				grid-column: 4 / span 2;
			}
			&:nth-child(6n + 6) {
				grid-column: 6 / span 2;
			}

			/* Special centering for small counts (Desktop) */
			&:only-child {
				grid-column: 3 / span 2 !important;
			}
			&:first-child:nth-last-child(3) {
				grid-column: 3 / span 2 !important;
			}

			/* Rows: groups of 3. Reset mobile margin and apply per desktop rows. */
			&:nth-child(n + 3) {
				margin-block-start: 0;
			}
			&:nth-child(n + 4) {
				margin-block-start: calc(-1 * var(--interlock-step));
			}
			&:nth-child(-n + 3) {
				z-index: 10;
			}
			&:nth-child(n + 4):nth-child(-n + 6) {
				z-index: 9;
			}
			&:nth-child(n + 7):nth-child(-n + 9) {
				z-index: 8;
			}
			&:nth-child(n + 10):nth-child(-n + 12) {
				z-index: 7;
			}
			&:nth-child(n + 13):nth-child(-n + 15) {
				z-index: 6;
			}
			&:nth-child(n + 16):nth-child(-n + 18) {
				z-index: 5;
			}
			&:nth-child(n + 19):nth-child(-n + 21) {
				z-index: 4;
			}
			&:nth-child(n + 22):nth-child(-n + 24) {
				z-index: 3;
			}
		}
	}

	.tile-content {
		font-family: var(--font-family-accent);
		text-align: center;
		padding: 0.5rem 1rem;
		line-height: 1.2;
		color: var(--label-color, white);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		text-shadow:
			0 1px 2px color-mix(in srgb, var(--color-black), transparent 80%),
			0 2px 4px color-mix(in srgb, var(--color-black), transparent 90%);

		@media (width > 500px) {
			font-size: 1rem;
		}
	}
</style>
