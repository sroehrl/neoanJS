import neoan from "./neoan.js";
export default function Service(name, service = {}) {
    neoan.services[name] = service;
}
