let observer: IntersectionObserver | null = null

function getObserver() {
	if (!observer) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const callback = callbacks.get(entry.target)
						if (callback) {
							callback()
							callbacks.delete(entry.target)
						}
						observer!.unobserve(entry.target)
					}
				}
			},
			{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
		)
	}
	return observer
}

const callbacks = new Map<Element, () => void>()

/** Observe a node. Fires callback once when it enters the viewport. Returns cleanup. @public */
export function inView(node: Element, callback: () => void) {
	callbacks.set(node, callback)
	getObserver().observe(node)
	return () => {
		callbacks.delete(node)
		getObserver().unobserve(node)
	}
}
