import helper from "./helper.js";

const Renderer = function(){
    const bindings = {};
    const attributes = ['href','class'];
    this.process = (el, s, v) => {
        if (typeof bindings[s] === 'undefined') {
            bindings[s] = [];
        }
        let currentNode = null, nodes = [], binder = `{{${s}}}`;
        bindings[s].forEach((binding) => {
            if(v==='dropdown'){
                console.log(binding);
            }
            let cNode = el.querySelector('[data-id="' + binding.clone.dataset.id + '"]');
            if (cNode !== null && binding.oldVal !== v) {
                applyScope(cNode,binding.clone,v,binder,binding.in);
            }

            binding.oldVal = v
        });
        // get bindings in text
        let pathInner = "//*[contains(text(),'" + binder + "')]";
        let find = document.evaluate(pathInner, el, null, XPathResult.ANY_TYPE, null);
        while (currentNode = find.iterateNext()) {
            nodes.push({in:'text',node:currentNode});
        }
        // get bindings in attributes
        attributes.forEach((selector)=>{
            let pathAttribute = "//"+el.nodeName.toLowerCase()+"//*[contains(@"+selector+",'"+binder+"')]";
            find = document.evaluate(pathAttribute, el, null, XPathResult.ANY_TYPE, null);

            while (currentNode = find.iterateNext()) {

                nodes.push({in:selector,node:currentNode});
            }
        });


        nodes.forEach((applyNode) => {
            if(!applyNode.node.dataset.id){
                applyNode.node.dataset.id = helper.registerId('bind');
            } else if(applyNode.in === 'text') {
                console.warn('NeoanJS: Reflow-warning. Consider wrapping {{'+s+'}} in an element (@'+el.tagName+')')
            }
            bindings[s].push({oldVal:v,clone:applyNode.node.cloneNode(true),in:applyNode.in});
            applyScope(applyNode.node,applyNode.node,v,binder,applyNode.in);
            // applyNode.node.innerHTML = applyNode.node.innerHTML.replace(new RegExp(binder, 'g'), v);
        });
    };
    const applyScope = (targetNode,templateNode,newV,binder,type)=>{
        switch (type) {
            case 'text':
                targetNode.innerHTML = templateNode.innerHTML.replace(new RegExp(binder, 'g'), newV);
                break;
            default:
                targetNode.setAttribute(type,templateNode.getAttribute(type).replace(new RegExp(binder, 'g'), newV));
                break;
        }
    }
};
const renderer = new Renderer();
Object.freeze(renderer);
export default renderer;
