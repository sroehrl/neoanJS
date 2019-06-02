import neoan from '../neoan.js';
import helper from "../helper.js";

neoan.directive('for',{
    run(element,scope,value, context){
        this.elementIterator(element, '[data-for]').forEach((iterator) => {
            // element not owner or destructed?
            if(typeof context.data[iterator.dataset.for] === 'undefined'){
                return;
            }

            // generate
            if (typeof this._memory.for[iterator.dataset.for] === 'undefined') {
                this._memory.for[iterator.dataset.for] = {
                    template: iterator.innerHTML.replace(/id="[a-z0-9\-]+"/g,''),
                    bindings: []
                };
                Array.from(iterator.children).forEach((child) => {
                    iterator.removeChild(child);
                });
            }

            context.data[iterator.dataset.for].forEach((item, i) => {
                // is bound|used?
                if (typeof item.__bound === 'undefined') {
                    //new
                    item.__bound = helper.registerId('item');
                    this._memory.for[iterator.dataset.for].bindings.push(Object.assign({}, item));
                    let node = document.createElement('template');
                    node.innerHTML = this._memory.for[iterator.dataset.for].template
                        .replace(/{{[a-zA-Z0-9]+\.[a-zA-Z0-9.]+}}/g, (hit) => {
                            let arr = hit.substring(2, hit.length - 2).split('.');
                            arr.shift();
                            return '{{' + iterator.dataset.for + '.' + i + '.' + arr.join('.') + '}}';
                        }).trim().replace(/\$i/g, i);
                    node.content.firstChild.dataset.id = item.__bound;
                    iterator.append(node.content.firstChild);
                } else {
                    // changed?
                    if (this._memory.for[iterator.dataset.for].bindings.filter((old) => {
                        return old.__bound === item.__bound && helper.compareObjects(old, Object.assign({}, item))
                    }).length !== 1) {
                        let targetElement = document.querySelector('[data-id="' + item.__bound + '"]');
                        if(targetElement){
                            targetElement.innerHTML =
                                this._memory.for[iterator.dataset.for].template
                                    .replace(/{{[a-zA-Z0-9]+\.[a-zA-Z0-9.]+}}/g, (hit) => {
                                        let arr = hit.substring(2, hit.length - 2).split('.');
                                        arr.shift();
                                        return '{{' + iterator.dataset.for + '.' + i + '.' + arr.join('.') + '}}';
                                    }).trim();
                        }


                    }

                }
            });
            // needs removal?
            if (this._memory.for[iterator.dataset.for].bindings.length > context.data[iterator.dataset.for].length) {
                this._memory.for[iterator.dataset.for].bindings.forEach((target, i) => {
                    if (context.data[iterator.dataset.for].filter((live) => {
                        return live.__bound === target.__bound
                    }).length < 1) {
                        this._memory.for[iterator.dataset.for].bindings.splice(i, 1);
                        let child = document.querySelector('[data-id="' + target.__bound + '"]');
                        child.parentNode.removeChild(child);
                    }

                })
            }


        });
    }
});
