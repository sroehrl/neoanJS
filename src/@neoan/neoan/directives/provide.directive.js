import neoan from '../neoan.js';
import helper from "../helper.js";

neoan.directive('provide', {
    run(element, scope, value, context) {
        this.elementIterator(element, '[data-provide]').forEach((ele) => {

            let candidate = neoan.components[helper.kebabToCamel(ele.tagName.toLowerCase())].filter((e) => {
                return e.id === ele.id
            });
            if (candidate.length > 0) {
                candidate[0].data._provided = helper.deepFlatten(ele.dataset.provide.replace(/({{)|(}})/g,''), context.data)
            }
        })
    }
});
