export const keyFilter = (obj, filter, exclude = false) => {
	if (typeof obj !== 'object' || obj === null) {
		return;
	}

	if (Array.isArray(obj)) {
		for (let item of obj) {
			keyFilter(item, filter, exclude);
		}
	} else {
		for (let key in obj) {
			if (!filter.includes(key) ^ exclude) {
				delete obj[key];
			} else {
				keyFilter(obj[key], filter, exclude);
			}
		}
	}
}

export const typeNormalize = (obj, type) => {
	if (Array.isArray(obj)) {
		return obj.map(e => typeNormalize(e, type));
	}
	else if (obj !== null && typeof obj === 'object') {
		return Object.keys(obj).reduce((result, key) => {
			result[key] = typeNormalize(obj[key], type);
			return result;
		}, {});
	}

  try {
  	return type(obj);
  } catch (error) {
    return obj;
  }
}
