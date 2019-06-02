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
                this.applyChange(cNode,binding,binder,v);
                // cNode.innerHTML = binding.clone.innerHTML.replace(new RegExp(binder, 'g'), v);
            }
            binding.oldVal = v
        });
        // get bindings in text
        let pathInner = "//*[contains(text(),'" + binder + "')]";
        let find = document.evaluate(pathInner, el, null, XPathResult.ANY_TYPE, null);
        while (currentNode = find.iterateNext()) {
            nodes.push({node:currentNode,type:'innerHTML'});
        }
        // get bindings in attributes
        let potential = ['href','src','data-provide'];
        potential.forEach((selector)=>{
            let pathAttribute = "//"+el.nodeName.toLowerCase()+"//*[@"+selector+"='"+binder+"']";
            find = document.evaluate(pathAttribute, el, null, XPathResult.ANY_TYPE, null);
            while (currentNode = find.iterateNext()) {
                nodes.push({node:currentNode,type:selector});
            }
        });


        nodes.forEach((applyNode) => {
            if(!applyNode.node.dataset.id){
                applyNode.node.dataset.id = helper.registerId('bind');
            } else {
                console.warn('NeoanJS: Reflow-warning. Consider wrapping {{'+s+'}} in an element (@'+el.tagName+')')
            }
            let newBinding = {oldVal:v,clone:applyNode.node.cloneNode(true),type:applyNode.type};
            bindings[s].push(newBinding);
            this.applyChange(applyNode.node,newBinding,binder,v);
            // applyNode.innerHTML = applyNode.innerHTML.replace(new RegExp(binder, 'g'), v);
        });
    };
    this.applyChange = function (node,binding,binder,v) {
        if(binder === '{{picture}}'){
            console.log(binding.clone[binding.type].replace(new RegExp(binder, 'g'), v));
        }
        node[binding.type] = binding.clone[binding.type].replace(new RegExp(binder, 'g'), v);
    }
};
const renderer = new Renderer();
Object.freeze(renderer);
export default renderer;
