import neoan from "./main.js";
import helper from "./helper.js"
import onChange from './onchange.js';
import directives from './directives.js';

export default function Component(name, component = {}) {
    const blocked = ['data', 'template', 'loaded', 'updated', 'store'];
    const configuration = {
        data: {},
        template: null,
        loaded: () => {
        },
        render: () => {
        },
        updated: () => {
        },
        ...component
    };

    const elements = document.querySelectorAll(name);
    let originalElement = false;
    this.registeredIds = [];

    const methods = Object.keys(configuration)
    // .filter(k => !blocked.includes(k))
        .filter(k => helper.isFunction(configuration, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration[cK]}), {});
    const stateObj = Object.keys(configuration.data)
        .filter(k => !helper.isFunction(configuration.data, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration.data[cK]}), {});
    const stateArray = Object.keys(configuration.data)
        .filter(k => helper.isFunction(configuration.data, k))
        .map(k => helper.computeState(k, configuration.data[k]));

    const bindDirectives = (element) => {
        Object.keys(stateObj).forEach((x) => {
            element = directives.formatDataN(element, x);
        });
        return element;
    };
    const directiveListener = (element) => {
        Object.keys(stateObj).forEach((x) => {
            directives.listenDataN(element, x,context);
        });
    };
    if (elements) {
        elements.forEach((element) => {
            if(element.hasAttribute('is-template')){
                element.style.display = 'none';
            }
            let regId = helper.registerId('c');
            element.id = regId;
            this.registeredIds.push(regId);
            neoan.components[name].push(regId);
            if (component.template) {
                element.innerHTML = component.template;
            }

        });
        originalElement = bindDirectives(elements[0]).cloneNode(true);
    }

    const rerenderElement = function (el, s) {
        let binder = `{{${s}}}`;
        if (originalElement.innerHTML.indexOf(binder) !== -1) {
            el.innerHTML = originalElement.innerHTML.replace(new RegExp(binder, 'g'), stateObj[s]);
        }
        directiveListener(el,s);

    };
    const rendering = function () {
        if (originalElement) {
            Object.keys(stateObj).forEach((x) => {
                elements.forEach((element) => {
                    rerenderElement(element, x);
                })
            });
        }
    };
    const updateState = (obj) => {
        console.log('no global scope attached');
    };
    const data = onChange(stateObj, () => {
        updateState(stateObj);
        rendering();
        setTimeout(() => configuration.updated.call(context));
    });
    const context = {...methods, elements, data, rendering};

    if (component.template) {

        let addToState = helper.embrace(component.template);
        addToState.forEach((match) => {
            if (typeof stateObj[match] === 'undefined') {
                stateObj[match] = '';
            }
        });

    }
    document.addEventListener('DOMContentLoaded', () => {
        // updateComputedState(state); // Make sure computed state are available
        rendering(false); // initial rendering
        configuration.loaded.call(context); // lifecycle: created
    });
}
