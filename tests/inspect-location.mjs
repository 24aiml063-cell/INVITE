import { JSDOM } from "jsdom";
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { runScripts: "dangerously" });
const { window } = dom;
const desc = Object.getOwnPropertyDescriptor(window.location, "reload");
console.log("own descriptor:", desc ? JSON.stringify({configurable: desc.configurable, writable: desc.writable}) : "none");
const proto = Object.getPrototypeOf(window.location);
const protoDesc = Object.getOwnPropertyDescriptor(proto, "reload");
console.log("proto descriptor:", protoDesc ? JSON.stringify({configurable: protoDesc.configurable, writable: protoDesc.writable}) : "none");
// Try to see if we can navigate via window
console.log("location href:", window.location.href);
