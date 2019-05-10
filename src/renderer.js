import helper from "./helper.js";

const Renderer = function(){
    const bindings = {};
    this.process = (el, s, v) => {
        if (typeof bindings[s] === 'undefined') {
            bindings[s] = [];
        }
        let currentNode = null, nodes = [], binder = `{{${s}}}`;
        bindings[s].forEach((binding) => {
            let cNode = el.querySelector('[data-id="' + binding.clone.dataset.id + '"]');
            if (cNode !== null && binding.oldVal !== v) {
                cNode.innerHTML = binding.clone.innerHTML.replace(new RegExp(binder, 'g'), v);
            }
            binding.oldVal = v
        });
        // get bindings in text
        let pathInner = "//*[contains(text(),'" + binder + "')]";
        let find = document.evaluate(pathInner, el, null, XPathResult.ANY_TYPE, null);
        while (currentNode = find.iterateNext()) {
            nodes.push(currentNode);
        }
        // get bindings in attributes
        let potential = ['href'];
        potential.forEach((selector)=>{
            let pathAttribute = "//"+el.nodeName.toLowerCase()+"//*[@"+selector+"='"+binder+"']";
            find = document.evaluate(pathAttribute, el, null, XPathResult.ANY_TYPE, null);
            while (currentNode = find.iterateNext()) {
                nodes.push(currentNode);
            }
        });


        nodes.forEach((applyNode) => {
            if(!applyNode.dataset.id){
                applyNode.dataset.id = helper.registerId('bind');
            } else {
                console.warn('NeoanJS: Reflow-warning. Consider wrapping {{'+s+'}} in an element (@'+el.tagName+')')
            }
            bindings[s].push({oldVal:v,clone:applyNode.cloneNode(true)});
            applyNode.innerHTML = applyNode.innerHTML.replace(new RegExp(binder, 'g'), v);
        });
    }
};
const renderer = new Renderer();
Object.freeze(renderer);
export default renderer;
