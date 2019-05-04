import helper from "./helper.js";

const Directives = function(){
    const directives = ['Input','Click'];
    this.listeners = {};

    const setInputValue = (sc,ele,context) =>{
        context.data[sc] = ele.value;
    };
    const provideWithId = (el) =>{
        if(!el.hasAttribute('id')){
            el.id = helper.registerId('click');
        }
    };

    this.checkListener = function(sc,ele){
        if(typeof this.listeners[sc] === 'undefined'){
            this.listeners[sc] = [];
        }
        let res = this.listeners[sc].filter((s)=>{return s.id === ele.id}).length<1;
        if(res){
            this.listeners[sc].push({id:ele.id,node:ele});
        }
        return res;
    };

    const elementIterator = (element,pattern)=>{
        return element.querySelectorAll(pattern);
    };
    this.binder = (element,scope,value,context)=>{
        directives.forEach((dir)=>{
            this['directive'+dir](element,scope,value,context);
        })
    };
    this.directiveClick = (element,scope,value,context)=>{
        elementIterator(element,'[data-click]').forEach((ele)=>{
            let handler = (ev) =>{
                ev.preventDefault();
                ev.stopPropagation();
                context[ele.dataset.click].call(context);
            };
            provideWithId(ele);
            if(this.checkListener(ele.id,ele)){
                ele.addEventListener('click',handler);
            }
        });
    };
    this.directiveInput = (element,scope,value,context)=>{
        elementIterator(element,'[data-n="'+scope+'"]').forEach((ele)=>{
            if(ele.nodeName === 'INPUT'|| ele.nodeName === 'TEXTAREA'){
                ele.setAttribute('value',value);
                provideWithId(ele);
                if(this.checkListener(scope,ele)){
                    ele.addEventListener('input',(ev) =>setInputValue(scope,ele,context));
                }
            }
        });
    };
};
const directives = new Directives();
Object.freeze(directives);
export default directives;
