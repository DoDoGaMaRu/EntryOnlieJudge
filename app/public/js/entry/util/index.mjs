const defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
    },
};

async function fetchWithBaseUrl(url, options) {
    const API_BASE_URL = '/rookie';
    const response = await fetch(
        `${API_BASE_URL}${url}`,
        Object.assign({}, defaultOptions, options)
    );
    return response.json();
}

async function fetchUploadWithBaseUrl(url, options) {
    const API_BASE_URL = '/rookie';
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    return response.json();
}

export { fetchWithBaseUrl, fetchUploadWithBaseUrl };
