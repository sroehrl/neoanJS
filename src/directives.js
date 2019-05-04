import helper from "./helper.js";
import rerenderer from './renderer.js';
const Directives = function(){
    this.registeredDirectives = ['Input','Click','For'];
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
        this.registeredDirectives.forEach((dir)=>{
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
                ele.value = value;
                provideWithId(ele);
                if(this.checkListener(scope,ele)){
                    ele.addEventListener('input',(ev) =>setInputValue(scope,ele,context));
                    ele.addEventListener('change',(ev) =>{
                        ele.value = context.data[scope];
                    });
                }
            }
        });
    };
    this.directiveFor = (element,scope,value,context)=>{
        let deflatten = scope.split('.');
        let last = deflatten[deflatten.length-1];
        let target = '{{'+deflatten[0].substring(0,deflatten[0].length-1);
        if(!isNaN(last)){
            deflatten.pop();
            elementIterator(element,'[data-for="'+deflatten.join('.')+'"]').forEach((ele) =>{
                // remove all existing elements
                Array.from(ele.children).forEach((child)=>{
                    if(child.nodeName !== 'TEMPLATE'){
                        ele.removeChild(child);
                    }
                });
                let tmpl = ele.querySelector('template');
                let DataCube = context.data;
                let partString = '';
                deflatten.forEach((part)=>{
                    DataCube = DataCube[part];
                    partString = part+'.';
                });
                DataCube.forEach((item,i)=>{
                    let newEle = tmpl.innerHTML.replace(target,'{{'+partString+i);
                    ele.append(document.createRange().createContextualFragment(newEle));
                });
            });
            setTimeout(() => {
                rerenderer.process(element, scope, value);
            })
        }

    }
};
const directives = new Directives();
Object.freeze(directives);
export default directives;
