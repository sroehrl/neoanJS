const Helper = function () {
    this.isFunction = (obj, key) => obj && typeof obj[key] === 'function';
    this.embrace = (template) => {
        let matches =  template.match(/{{[a-z0-9\.]+}}/im);
        return matches ? matches.map((m) => m.substring(2, m.length - 2)) : [];
    };
    this.computeState = (key, fn) => state => state[key] = fn({...state});
    this.registerId = (entityType) =>{return 'neoan-'+entityType+'-'+Math.random().toString(36).substring(7)};
    this.firstObjectKey = (obj)=> {return Object.keys(obj)[0]};
    this.objToFlatArray = (obj) =>{
        let res=[],pusher,key;
        Object.keys(obj).forEach((level)=>{
            pusher = {};
            if(typeof obj[level] === 'object' && obj[level] !== null){
                this.objToFlatArray(obj[level]).forEach((deep,k)=>{
                    key = this.firstObjectKey(deep);
                    pusher = {};
                    pusher[level+'.'+key] = obj[level][key];
                    res.push(pusher);
                });

            } else {
                pusher[level] = obj[level];
                res.push(pusher);
            }
        });
        return res;
    };
    this.deepFlatten = (declaration,obj) =>{
        return declaration.split('.').reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj)
    }
};
const helper = new Helper();
export default helper;
