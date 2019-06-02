import neoan from '../neoan.js';

neoan.directive('src', {
    run(element, scope, value, context) {
        this.elementIterator(element, '[data-src="' + scope + '"]').forEach((ele) => {
            ele.src = value;
        })
    }
});
