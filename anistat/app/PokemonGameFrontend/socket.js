const protocol = window.location.protocol === "https:" ? "wss" : "ws";
export const socket = new WebSocket(`${protocol}://anistat-api.mercantec.tech`);