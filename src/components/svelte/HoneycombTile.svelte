<script lang="ts">
    import { scale, fly } from 'svelte/transition'
    import { quadInOut as easing } from 'svelte/easing'

    interface Props {
        href?: string
        target?: string
        rel?: string
        bg?: string
        labelColor?: string
        underConstruction?: boolean
        theme?: 'main' | 'lab' | 'correlaidx'
        children?: import('svelte').Snippet
    }

    let {
        href,
        target,
        rel,
        bg,
        labelColor,
        underConstruction = false,
        theme = 'main',
        children
    }: Props = $props()

    const isExternal = $derived(href?.startsWith('http') || href?.startsWith('//'))
    const finalTarget = $derived(target ?? (isExternal ? '_blank' : undefined))
    const finalRel = $derived(rel ?? (isExternal ? 'noopener noreferrer' : undefined))

    let isHovered = $state(false)
</script>

<div
    class="hex-wrapper"
    class:under-construction={underConstruction}
    class:theme-lab={theme === 'lab'}
    style:--bg-color={bg}
    style:--label-color={labelColor}>
    {#if href}
        <a
            class="hex-tile plain-href"
            {href}
            target={finalTarget}
            rel={finalRel}
            onpointerenter={() => (isHovered = true)}
            onpointerleave={() => (isHovered = false)}
            data-astro-prefetch={href.startsWith('/') ? 'hover' : undefined}>
            <div class="hex-content">
                {@render children?.()}
            </div>
        </a>
    {:else}
        <div
            class="hex-tile plain-href"
            role="button"
            tabindex="0"
            onpointerenter={() => (isHovered = true)}
            onpointerleave={() => (isHovered = false)}>
            <div class="hex-content">
                {@render children?.()}
                {#if underConstruction && isHovered}
                    <div
                        class="hex-label-hint"
                        in:fly={{ y: -20, duration: 250, easing }}
                        out:scale={{ duration: 100 }}>
                        TBA
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    {#if underConstruction}
        <svg class="hex-outline" viewBox="-1 -1 102 117.47" aria-hidden="true">
            <polygon points="50,0 100,28.87 100,86.60 50,115.47 0,86.60 0,28.87" />
        </svg>
    {/if}
</div>

<style>
    .hex-wrapper {
        --local-bg-color: var(--bg-color);
        --local-label-color: var(--label-color);

        position: relative;
        pointer-events: none;
        transition:
            transform 0.25s ease,
            filter 0.25s ease,
            opacity 0.25s ease;
        
        /* The grid-row or margin-top is handled by the parent grid */

        &.theme-lab {
            filter: drop-shadow(1px 1px 3px #a1a1a1);
        }

        &.under-construction {
            --local-bg-color: var(--color-white) !important;
            --local-label-color: #7a7a7a !important;

            & .hex-label-hint {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 0.5rem;
                pointer-events: none;
                font-size: 14px;
            }

            & .hex-content {
                background: white;
                will-change: transform;
            }

            &:has(:hover) {
                --local-label-color: var(--color-black) !important;
            }
        }

        & .hex-outline {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;

            & polygon {
                fill: none;
                stroke: var(--local-label-color, --color-gray-muted);
                stroke-width: 3;
                vector-effect: non-scaling-stroke;
                stroke-dasharray: 0 8;
                stroke-linecap: round;
            }
        }

        & .hex-tile {
            position: relative;
            width: 100%;
            aspect-ratio: 1 / 1.1547;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
            background-color: var(--local-bg-color);
            text-decoration: none;
            pointer-events: auto;
            transition:
                transform 0.25s ease,
                filter 0.25s ease,
                opacity 0.25s ease;

            & .hex-content {
                position: relative;
                will-change: transform;
            }
        }

        &:has(:hover) {
            transform: scale(1.08);
            filter: drop-shadow(0 0 6px var(--local-bg-color));
        }

        &:has(:focus-visible) {
            & .hex-tile {
                outline: 2px solid var(--color-correlaidx-red-fill);
            }
        }
    }
</style>
