import helper from "./helper.js";
import rerenderer from './renderer.js';
import neoan from './neoan.js';

const Directives = function () {
    this.registeredDirectives = ['Input', 'Click', 'For', 'Provide'];
    this.listeners = {};
    this.dirty = {};

    const setInputValue = (sc, ele, context) => {
        context.data[sc] = ele.value;
    };
    const provideWithId = (el, type) => {
        if (!el.dataset.id) {
            el.dataset.id = helper.registerId(type);
            return true;
        }
        return false;
    };

    this.checkListener = function (ele, type) {
        if(!ele.dataset.id){
            provideWithId(ele, type);
        }
        if (typeof this.listeners[ele.dataset.id] === 'undefined') {
            this.listeners[ele.dataset.id] = [];
        }
        let res = this.listeners[ele.dataset.id].filter((s) => {
            return s.type === type
        }).length < 1;
        if (res) {
            this.listeners[ele.dataset.id].push({type: type, node: ele});
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
    this.directiveProvide = (element, scope, value, context) => {
        elementIterator(element, '[data-provide]').forEach((ele) => {
            let candidate = neoan.components[helper.kebabToCamel(ele.tagName.toLowerCase())].filter((e) => {
                return e.id === ele.id
            });
            if (candidate.length > 0) {
                candidate[0].data._parent = helper.deepFlatten(ele.dataset.provide, context.data)
            }
        });
    };
    this.directiveClick = (element, scope, value, context) => {
        elementIterator(element, '[data-click]').forEach((ele) => {

            let rawCall = ele.dataset.click.split(':');
            let call = '';
            if (rawCall.length < 2) {
                call = helper.kebabToCamel(context.name + '-' + rawCall.join('-'));
                if (typeof context[call] !== 'undefined') {
                    let handler = (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        context[call].call(context);
                    };

                    if (this.checkListener(ele, 'click')) {
                        ele.addEventListener('click', handler);
                    }
                }
            } else {
                let targets = neoan.components[rawCall[0]];
                if (targets.length > 0) {
                    targets.forEach((target) => {
                        call = helper.kebabToCamel(rawCall.join('-'));
                        if (typeof target[call] !== 'undefined') {
                            let handler = (ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                target[call].call(target);
                            };
                            provideWithId(ele, 'click');
                            ele.removeEventListener('click', handler);
                            ele.addEventListener('click', handler);
                            /*if (this.checkListener(ele.id, ele)) {
                                ele.addEventListener('click', handler);
                            }*/
                        }
                    })
                }

            }


        });
    };
    this.directiveInput = (element, scope, value, context) => {
        elementIterator(element, '[data-bind="' + scope + '"]').forEach((ele) => {
            if (ele.nodeName === 'INPUT' || ele.nodeName === 'TEXTAREA') {
                if (value.trim() !== '') {
                    ele.value = value;
                }
                if (this.checkListener(ele, 'input')) {
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
                        id: helper.registerId('item-' + i),
                        content: Object.assign({}, item)
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
                        this.dirty[iterator.dataset.for].dirtyCheck[i] = {
                            id: helper.registerId('item-' + i),
                            content: Object.assign({}, item)
                        };
                    }
                    let unChanged = helper.compareObjects(
                        this.dirty[iterator.dataset.for].dirtyCheck[i].content,
                        Object.assign({}, item));

                    if (initial || !unChanged) {
                        if (!unChanged) {
                            elementIterator(iterator, '[data-item-id="' + this.dirty[iterator.dataset.for].dirtyCheck[i].id + '"]').forEach((child) => {
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
                        Array.from(iterator.children).forEach((child, k) => {
                            if (k === Array.from(iterator.children).length - 1) {
                                child.dataset.itemId = this.dirty[iterator.dataset.for].dirtyCheck[i].id;
                            }
                            if (k > i) {
                                iterator.removeChild(child);
                                delete this.dirty[iterator.dataset.for].dirtyCheck[i];
                            }
                        });
                    }

                });


            })

        });
    }
};
const directives = new Directives();
Object.freeze(directives);
export default directives;
