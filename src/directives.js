import helper from "./helper.js";
import rerenderer from './renderer.js';

const Directives = function () {
    this.registeredDirectives = ['Input', 'Click', 'For'];
    this.listeners = {};
    this.dirty = {};

    const setInputValue = (sc, ele, context) => {
        context.data[sc] = ele.value;
    };
    const provideWithId = (el) => {
        if (!el.hasAttribute('id')) {
            el.id = helper.registerId('click');
        }
    };

    this.checkListener = function (sc, ele) {
        if (typeof this.listeners[sc] === 'undefined') {
            this.listeners[sc] = [];
        }
        let res = this.listeners[sc].filter((s) => {
            return s.id === ele.id
        }).length < 1;
        if (res) {
            this.listeners[sc].push({id: ele.id, node: ele});
        }
        return res;
    };

    const elementIterator = (element, pattern) => {
        return element.querySelectorAll(pattern);
    };
    this.binder = (element, scope, value, context) => {
        this.registeredDirectives.forEach((dir) => {
            this['directive' + dir](element, scope, value, context);
        })
    };
    this.directiveClick = (element, scope, value, context) => {
        elementIterator(element, '[data-click]').forEach((ele) => {
            let handler = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                context[ele.dataset.click].call(context);
            };
            provideWithId(ele);
            if (this.checkListener(ele.id, ele)) {
                ele.addEventListener('click', handler);
            }
        });
    };
    this.directiveInput = (element, scope, value, context) => {
        elementIterator(element, '[data-n="' + scope + '"]').forEach((ele) => {
            if (ele.nodeName === 'INPUT' || ele.nodeName === 'TEXTAREA') {
                ele.value = value;
                provideWithId(ele);
                if (this.checkListener(scope, ele)) {
                    ele.addEventListener('input', (ev) => setInputValue(scope, ele, context));
                    ele.addEventListener('change', (ev) => {
                        ele.value = context.data[scope];
                    });
                }
            }
        });
    };
    this.directiveFor = (element, scope, value, context) => {
        elementIterator(element, '[data-for]').forEach((iterator) => {
            // dirty-check
            // initial
            let initial = typeof this.dirty[iterator.dataset.for] === 'undefined';
            if (initial) {
                this.dirty[iterator.dataset.for] = {
                    node: iterator,
                    template: iterator.innerHTML,
                    data: context.data[iterator.dataset.for],
                    dirtyCheck: []
                };
                this.dirty[iterator.dataset.for].data.forEach((item, i) => {
                    this.dirty[iterator.dataset.for].dirtyCheck[i] = {
                        id:helper.registerId('item-'+i),
                        content:Object.assign({}, item)
                    };
                });
                // remove
                Array.from(iterator.children).forEach((child) => {
                    iterator.removeChild(child);
                });
            }
            // generate
            let flats = helper.embrace(this.dirty[iterator.dataset.for].template);
            flats.forEach((declaration) => {
                let dec = declaration.substring(declaration.indexOf('.') + 1);
                let end = dec.split('.').pop();
                this.dirty[iterator.dataset.for].data.forEach((item, i) => {
                    if (typeof this.dirty[iterator.dataset.for].dirtyCheck[i] === 'undefined') {
                        initial = true;
                        this.dirty[iterator.dataset.for].dirtyCheck[i] ={
                            id:helper.registerId('item-'+i),
                            content:Object.assign({}, item)
                        };
                    }
                    let unChanged = helper.compareObjects(
                        this.dirty[iterator.dataset.for].dirtyCheck[i].content,
                        Object.assign({}, item));

                    if (initial || !unChanged) {
                        if (!unChanged) {
                            elementIterator(iterator,'[data-item-id="'+this.dirty[iterator.dataset.for].dirtyCheck[i].id+'"]').forEach((child)=>{
                                iterator.removeChild(child);
                            })

                        }
                        this.dirty[iterator.dataset.for].dirtyCheck[i].content = Object.assign({}, item);
                        let between = dec.substring(0, dec.length - end.length - 1);
                        let finalDec = between + (between.length > 0 ? '.' : '') + i + '.' + end;
                        let val = helper.deepFlatten(
                            finalDec,
                            this.dirty[iterator.dataset.for].data);
                        let node = document.createRange().createContextualFragment(this.dirty[iterator.dataset.for].template
                            .replace('{{' + declaration + '}}', val));

                        iterator.append(node);
                        Array.from(iterator.children).forEach((child,k) => {
                            if(k === Array.from(iterator.children).length-1){
                                child.dataset.itemId = this.dirty[iterator.dataset.for].dirtyCheck[i].id;
                            }
                            if(k>i){
                                iterator.removeChild(child);
                                delete this.dirty[iterator.dataset.for].dirtyCheck[i];
                            }
                        });
                    }

                });


            })

        });

        /*
                let deflatten = scope.split('.');
                let last = deflatten[deflatten.length-1];
                let target = deflatten[0].substring(0,deflatten[0].length-1);
                if(!isNaN(last)){
                    deflatten.pop();
                    let targetElement = deflatten.join('.');
                    console.log(element);
                    console.log(targetElement);
                    console.log(elementIterator(element,'[data-for="'+targetElement+'"]'));
                    elementIterator(element,'[data-for="'+targetElement+'"]').forEach((ele) =>{
                        console.log('in');
                        // remove all existing elements
                        Array.from(ele.children).forEach((child)=>{
                            if(child.nodeName !== 'TEMPLATE'){
                                ele.removeChild(child);
                            }
                        });
                        let tmpl = ele.querySelector('template');
                        let DataCube = helper.objToFlatArray(context.data[deflatten[0]]);
                        console.log(helper.firstObjectKey(target));
                        console.log(DataCube);
                        /!*let partString = '';
                        deflatten.forEach((part)=>{
                            DataCube = DataCube[part];
                            partString = part+'.';
                        });
                        console.log(partString);*!/
                        DataCube.forEach((item,i)=>{
                            let newEle = tmpl.innerHTML.replace(target,'{{'+item+i);
                            let el = document.createRange().createContextualFragment(newEle);
                            ele.append(el);
                        });
                    });

                }
                setTimeout(() => {
                    rerenderer.process(element, scope, value);
                })*/
    }
};
const directives = new Directives();
Object.freeze(directives);
export default directives;
