const Directives = function(){
    const directives = ['Input','Click'];
    const listeners = {};

    const setInputValue = (sc,ele,context) =>{
        context.data[sc] = ele.value;
    };

    const checkListener = function(sc,ele,context){
        if(typeof listeners[sc] === 'undefined'){
            listeners[sc] = [];
        }
        if(listeners[sc].filter((node)=>{return node === ele}).length<1){
            listeners[sc].push(ele);
            if(ele.nodeName === 'INPUT' || ele.nodeName === 'TEXTAREA'){
                ele.addEventListener('input',(ev) =>setInputValue(sc,ele,context));
                ele.addEventListener('blur',(ev) =>{
                    delete listeners[sc];
                    ele.removeEventListener('input',(ev)=>setInputValue(sc,ele,context));
                    console.log('TODO: event-binding lost after "dirty"')
                });
            }
        }
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
            ele.addEventListener('click',(ev) =>{
                context[ele.dataset.click].call(context);
            });
        });
    };
    this.directiveInput = (element,scope,value,context)=>{
        elementIterator(element,'[data-n="'+scope+'"]').forEach((ele)=>{
            if(ele.nodeName === 'INPUT'){
                ele.setAttribute('value',value);
                checkListener(scope,ele,context);
            }
        });
    };
};
const directives = new Directives();
export default directives;
