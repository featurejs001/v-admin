import Cookies from "js-cookie";

const TokenKey = "Authorization";
const TENANT_ID = 'TENANT_ID';
const historyRoutesKey = 'historyRoutesCache'
function getDomain() {
	return location.hostname;
}

export function getToken() {
	return Cookies.get(TokenKey) || "";
}

export function setToken(token) {
	const domain = getDomain();
	if (domain) {
		return Cookies.set(TokenKey, token, { domain });
	} else {
		return Cookies.set(TokenKey, token);
	}
}

export function removeToken() {
	return Cookies.remove(TokenKey);
}

export function setHistoryRoutes(vals) {
	localStorage.setItem(historyRoutesKey, JSON.stringify(vals))
}

export function getHistoryRoutes() {
	const jsonData = localStorage.getItem(historyRoutesKey) || "";
	let data = [];
	try {
		data = JSON.parse(jsonData);
	} catch (e) {
	}
	return data;
}