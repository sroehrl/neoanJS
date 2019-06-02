import neoan from '../neoan.js';

neoan.directive('show', {
    run(element, scope, value, context) {
        if(typeof this._memory.showHide === 'undefined'){
            this._memory.showHide ={};
        }

        this.elementIterator(element, '[data-show]').forEach((ele) => {
            if(typeof this._memory.showHide[ele.dataset.show] === 'undefined'){
                this._memory.showHide[ele.dataset.show] = ele;
            }
            if(!context.data[ele.dataset.show]){
                ele.style.display = 'none';
            } else {
                ele.style.display = 'initial';
            }
        });
    }
});
neoan.directive('hide', {
    run(element, scope, value, context) {
        if(typeof this._memory.showHide === 'undefined'){
            this._memory.showHide ={};
        }
        this.elementIterator(element, '[data-hide]').forEach((ele) => {
            if(typeof this._memory.showHide[ele.dataset.hide] === 'undefined'){
                this._memory.showHide[ele.dataset.hide] = ele;
            }
            if(context.data[ele.dataset.hide]){

                ele.style.display = 'none';
            } else {
                ele.style.display = 'initial';
            }
        });
    }
});
