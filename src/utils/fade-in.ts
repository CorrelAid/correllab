import type { Attachment } from 'svelte/attachments'
import { inView } from './in-view'

interface FadeInOptions {
	/** Delay before animation starts, in ms. Default: 0 */
	delay?: number
	/** Animation duration, in ms. Default: 600 */
	duration?: number
}

/** Observe a single node. Adds .is-visible when in viewport. Returns cleanup. @public */
export function fadeIn(node: HTMLElement, opts: FadeInOptions = {}) {
	if (opts.delay) {
		node.style.setProperty('--fade-delay', `${opts.delay}ms`)
	}
	if (opts.duration) {
		node.style.setProperty('--fade-duration', `${opts.duration}ms`)
	}
	return inView(node, () => {
		node.classList.add('is-visible')
	})
}

/** Svelte 5 attachment factory. Usage: {@attach fadeInAttach({ delay: 200 })} @public */
export function fadeInAttach(opts: FadeInOptions = {}): Attachment {
	return (node: Element) => fadeIn(node as HTMLElement, opts)
}

/** Query all [data-fade-in] elements and observe them. */
export function initFadeIn() {
	document
		.querySelectorAll<HTMLElement>('[data-fade-in]:not(.is-visible)')
		.forEach((el) => {
			const delay = Number(el.dataset.fadeDelay ?? 0)
			const duration = Number(el.dataset.fadeDuration ?? 0)
			fadeIn(el, {
				...(delay && { delay }),
				...(duration && { duration })
			})
		})
}
