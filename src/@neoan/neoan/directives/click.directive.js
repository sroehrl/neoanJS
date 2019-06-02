import neoan from '../neoan.js';
import helper from "../helper.js";

neoan.directive('click',{
    run(element,scope,value, context){
        this.elementIterator(element, '[data-click]').forEach((ele) => {
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
                call = helper.kebabToCamel(rawCall.join('-'));
                // call = helper.kebabToCamel(context.name + '-' + rawCall.join('-'));
                if (typeof context[call] !== 'undefined') {
                    let handler = (ev) => {
                        if (ev.target.dataset.id === ele.dataset.id || ev.target.parentNode.dataset.id === ele.dataset.id) {
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
    }
});
