import onChange from './onchange.js';
const Directives = function(){
    const directives = ['n'];
    this.bindDirectives = (element,value)=>{
        directives.forEach((dir) => {
            new Function(element,value, 'return bindData'+dir.toUpperCase())
        })
    };
    this.formatDataN = function(element,value){
        let elements = element.querySelectorAll('[data-n="'+value+'"]');
        elements.forEach((element,i)=>{
            if(element.nodeName === 'INPUT'){
                element.setAttribute('value','{{'+value+'}}');

            }
        });
        return element;
    };

    this.listenDataN = function(element,value,context){
        let elements = element.querySelectorAll('[data-n="'+value+'"]');
        elements.forEach((element,i)=>{
            if(element.nodeName === 'INPUT'){
                elements[i].addEventListener('blur',(ev) =>{
                    context.data[value] = element.value;
                });
            }
        });
    };
    const reportChange = function(){

    }
};
const directives = new Directives();
export default directives;
