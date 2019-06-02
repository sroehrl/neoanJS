import neoan from '../neoan.js';

neoan.directive('input', {
    run(element, scope, value, context) {
        this.elementIterator(element, '[data-bind="' + scope + '"]').forEach((ele) => {
            if (ele.nodeName === 'INPUT' || ele.nodeName === 'TEXTAREA' || ele.nodeName === 'SELECT' ) {
                if (value.trim() !== '') {
                    ele.value = value;
                }
                if (this.checkListener(ele, 'input')) {
                    ele.addEventListener('input', (ev) => this.setInputValue(scope, ele, context));
                    ele.addEventListener('change', (ev) => {
                        ele.value = context.data[scope];
                    });
                }
            }
        });
    },
    setInputValue(sc, ele, context){
        context.data[sc] = ele.value;
    }
});
