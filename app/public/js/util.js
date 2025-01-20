// Iframe utils
export function postMessage(dest, type, payload, origin) {
	dest.postMessage({ type, payload }, origin)
}

export function postResponsiveMessage(dest, type, payload, origin) {
	return new Promise((resolve) => {
		const handler = (e) => {
			// if (e.origin !== 'https://your-trusted-origin.com') return;
			const { type, payload } = e.data;
			if (type === 'response') {
				window.removeEventListener('message', handler);
				resolve(payload);
			}
		}
		window.addEventListener('message', handler);
		dest.postMessage({ type, payload }, origin);
	})
}
// Iframe utils End
