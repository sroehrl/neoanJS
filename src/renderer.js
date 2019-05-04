import helper from "./helper.js";

const Renderer = function(){
    const bindings = {};
    this.process = (el, s, v) => {
        if (typeof bindings[s] === 'undefined') {
            bindings[s] = [];
        }
        let currentNode = null, nodes = [], binder = `{{${s}}}`;
        bindings[s].forEach((clone) => {
            let cNode = el.querySelector('[data-id="' + clone.dataset.id + '"]');
            if (cNode !== null) {
                cNode.innerHTML = clone.innerHTML.replace(new RegExp(binder, 'g'), v);
            }
        });
        let xpath = "//*[contains(text(),'" + binder + "')]";
        let find = document.evaluate(xpath, el, null, XPathResult.ANY_TYPE, null);
        while (currentNode = find.iterateNext()) {
            nodes.push(currentNode);
        }
        nodes.forEach((applyNode) => {
            applyNode.dataset.id = helper.registerId('bind');
            bindings[s].push(applyNode.cloneNode(true));
            applyNode.innerHTML = applyNode.innerHTML.replace(new RegExp(binder, 'g'), v);
        });
    }
};
const renderer = new Renderer();
Object.freeze(renderer);
export default renderer;