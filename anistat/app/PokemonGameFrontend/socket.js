const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const host = window.location.host;
export const socket = new WebSocket(`${protocol}://${host}`);
