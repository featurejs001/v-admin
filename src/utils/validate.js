import validator from "validator";
/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
	return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
	//   const valid_map = ['admin', 'editor']
	//   return valid_map.indexOf(str.trim()) >= 0
	if (!str) {
		return false;
	}
	return validator.isAlpha(str);
}

export function validEmail(str) {
	if (!str) {
		return false;
	}
	return validator.isEmail(str);
}

export function validMobile(str) {
	if (!str) {
		return false;
	}
	return validator.isMobilePhone(str);
}
