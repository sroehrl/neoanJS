import helper from "./helper.js";
import neoan from './neoan.js';
import renderer from "./renderer.js";

const Directives = function () {
    this.registeredDirectives = ['Input', 'Click', 'For', 'Provide','Show','Hide','Src'];
    this.listeners = {};
    this.dirty = {};
    this._memory = {
        for: {},
        click: {},
        if: {},
        src: {}
    };

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
        if (!ele.dataset.id) {
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
        });
        // renderer.process(element,scope,value);
    };
    this.directiveSrc = (element, scope, value, context) =>{
        elementIterator(element, '[data-src="' + scope + '"]').forEach((ele) => {
            ele.src = value;
        })
    };
    this.directiveShow = (element, scope, value, context) => {
        elementIterator(element, '[data-show]').forEach((ele) => {
            if(typeof this._memory.if[ele.dataset.show] === 'undefined'){
                this._memory.if[ele.dataset.show] = ele;
            }

            if(!context.data[ele.dataset.show]){

                ele.style.display = 'none';
            } else {
                ele.style.display = 'initial';
            }
        });
    };
    this.directiveHide = (element, scope, value, context) => {
        elementIterator(element, '[data-hide]').forEach((ele) => {
            if(typeof this._memory.if[ele.dataset.hide] === 'undefined'){
                this._memory.if[ele.dataset.hide] = ele;
            }
            if(context.data[ele.dataset.hide]){

                ele.style.display = 'none';
            } else {
                ele.style.display = 'initial';
            }
        });
    };
    this.directiveProvide = (element, scope, value, context) => {
        elementIterator(element, '[data-provide]').forEach((ele) => {

            let candidate = neoan.components[helper.kebabToCamel(ele.tagName.toLowerCase())].filter((e) => {
                return e.id === ele.id
            });
            if (candidate.length > 0) {
                console.log(ele.dataset.provide.replace(/({{)|(}})/g,''));
                console.log(context.data);
                candidate[0].data._provided = helper.deepFlatten(ele.dataset.provide.replace(/({{)|(}})/g,''), context.data)
            }
        });
    };
    this.directiveClick = (element, scope, value, context) => {
        elementIterator(element, '[data-click]').forEach((ele) => {
            if (typeof ele.dataset.id !== 'undefined' && typeof this._memory.click[ele.dataset.id] === 'undefined') {
                this._memory.click[ele.dataset.id] = {};
            }
            let rawCall = ele.dataset.click.split('->');
            let passIns = [];
            rawCall[rawCall.length - 1] = rawCall[rawCall.length - 1].replace(/\([^)]+\)/, (hit) => {
                passIns = hit.substring(1, hit.length - 1).split(',');
                return '';
            });
            if (passIns.filter((arg) => {
                return arg.indexOf('{{') === -1 && arg.indexOf('$') === -1
            }).length >0 && typeof this._memory.click[ele.dataset.id] !== 'undefined') {
                passIns = passIns.join(',');
                let v;
                try {
                    v = eval('(' + passIns + ')');
                } catch (e) {
                    v = passIns;
                }

                this._memory.click[ele.dataset.id].passIns = v;
                /*console.log(eval('('+passIns+')'));
                passIns.forEach((arg,key)=>{
                    console.log(eval('('+arg+')'));
                    if(!isNaN(key)){
                        let ins = {};
                        ins[key] = arg[key];
                        this._memory.click[ele.dataset.id].passIns.push(ins)
                    } else {
                        this._memory.click[ele.dataset.id].passIns.push(eval(arg))
                    }

                });
                // this._memory.click[ele.dataset.id].passIns = [...passIns];
                console.log(this._memory.click[ele.dataset.id].passIns);*/
            }

            let call = '';
            if (rawCall.length < 2) {
                call = helper.kebabToCamel(context.name + '-' + rawCall.join('-'));
                if (typeof context[call] !== 'undefined') {
                    let handler = (ev) => {
                        if (ev.target.dataset.id === ele.dataset.id || ev.target.parentNode.dataset.id === ele.dataset.id) {
                            console.log(this._memory.click[ele.dataset.id].passIns);
                            ev.preventDefault();
                            ev.stopPropagation();
                            context.event = ev;
                            context.args = this._memory.click[ele.dataset.id].passIns;
                            context[call].call(context);
                        }

                    };

                    if (this.checkListener(ele, 'click')) {
                        document.addEventListener('click', handler);
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
                                target.event = ev;
                                context.arg = passIns;
                                target[call].call(target);
                            };
                            if (this.checkListener(ele, 'click')) {
                                ele.addEventListener('click', handler);
                            }

                        }
                    })
                }

            }


        });
    };
    this.directiveInput = (element, scope, value, context) => {
        elementIterator(element, '[data-bind="' + scope + '"]').forEach((ele) => {
            if (ele.nodeName === 'INPUT' || ele.nodeName === 'TEXTAREA' || ele.nodeName === 'SELECT') {
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
};
const directives = new Directives();
Object.freeze(directives);
export default directives;
