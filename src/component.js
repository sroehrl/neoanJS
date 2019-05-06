import neoan from "./neoan.js";
import helper from "./helper.js"
import onChange from './onchange.js';
import directives from './directives.js';
import renderer from './renderer.js';

export default function Component(name, component = {}) {
    const blocked = ['data', 'template', 'loaded', 'updated', 'store'];
    const proxies = {};
    const context = {};
    let masterTemplate = null;
    const configuration = {
        data: {},
        template: null,
        loaded: () => {
        },
        updated: () => {
        },
        ...component
    };
    const rendering = function () {
        stateArray = helper.objToFlatArray(stateObj);
        if (elements) {
            stateArray.forEach((x) => {
                elements.forEach((element) => {
                    if (helper.filterTemplate(element)) {
                        updateDirectives(element, helper.firstObjectKey(x), helper.deepFlatten(helper.firstObjectKey(x), stateObj));
                        renderer.process(element, helper.firstObjectKey(x),helper.deepFlatten(helper.firstObjectKey(x), stateObj));
                    }
                })
            });
        }
    };
    const updateDirectives = (el, n, val) => {
        directives.binder(el, n, val, context[el.id],proxies);
    };

    const elements = document.querySelectorAll(name);
    this.registeredIds = [];

    const methods = Object.keys(configuration)
    // .filter(k => !blocked.includes(k))
        .filter(k => helper.isFunction(configuration, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration[cK]}), {});
    const stateObj = Object.keys(configuration.data)
        .filter(k => !helper.isFunction(configuration.data, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration.data[cK]}), {});
    let stateArray = helper.objToFlatArray(stateObj);
    if (elements) {
        elements.forEach((element) => {
            if (element.nodeType === 1) {
                if (element.hasAttribute('is-template')) {
                    masterTemplate = element.cloneNode(true);
                    element.style.display = 'none';
                }
                let regId = helper.registerId(name);
                element.id = regId;
                this.registeredIds.push(regId);

                if (component.template) {
                    element.innerHTML = component.template;
                }
                if (helper.filterTemplate(element)) {
                    proxies[element.id] = onChange(stateObj, () => {

                        rendering();
                        setTimeout(() => configuration.updated.call(context[element.id]));
                    });
                    let data = proxies[element.id];
                    context[element.id] = {...methods, elements, data, rendering};
                    neoan.components[name].push({id:regId, proxy:data});
                }
            }

        });

        if (masterTemplate) {
            elements.forEach((e, i) => {
                if (e.innerHTML === masterTemplate.innerHTML) {
                    e.parentNode.removeChild(e);
                    delete elements[i];
                } else {
                    e.innerHTML = masterTemplate.innerHTML;
                }

            });
        }
    }


   /* if (elements) {
        elements.forEach((e) => {
            if (helper.filterTemplate(e)) {
                // add provided scope
                if(typeof e.dataset.provide !== 'undefined'){
                    /!*
                    * TODO: FIND parent's proxy*!/
                    console.log(e.parentNode);
                    // stateObj.concat(e.dataset.value);
                }
                proxies[e.id] = onChange(stateObj, () => {

                    rendering();
                    setTimeout(() => configuration.updated.call(context[e.id]));
                });
                let data = proxies[e.id];
                context[e.id] = {...methods, elements, data, rendering};
            }
        })
    }*/

    if (component.template) {
        let addToState = helper.embrace(component.template);
        addToState.forEach((match) => {
            if (typeof stateObj[match] === 'undefined') {
                stateObj[match] = '';
            }
        });

    }
    const fireWhenDone = () => {
        rendering();
        if (elements) {
            elements.forEach((e) => {
                if (helper.filterTemplate(e)) {
                    configuration.loaded.call(context[e.id]);
                }
            })
        }
    };

    document.removeEventListener('DOMContentLoaded', fireWhenDone);
    document.addEventListener('DOMContentLoaded', fireWhenDone);
}
