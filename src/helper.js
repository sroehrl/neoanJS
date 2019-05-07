const Helper = function () {
    this.isFunction = (obj, key) => obj && typeof obj[key] === 'function';
    this.embrace = (template) => {
        let matches = template.match(/{{[a-z0-9\.]+}}/img);
        return matches ? matches.map((m) => m.substring(2, m.length - 2)) : [];
    };
    this.slotEmbrace = (template,slots) =>{
        return  template.replace(/\[\[[a-z0-9\.]+\]\]/img, (hit)=>{
            return slots[hit.substring(2,hit.length-2)] || ''
        });
    };
    this.computeState = (key, fn) => state => state[key] = fn({...state});
    this.filterTemplate = (ele) => {
        return !ele.hasAttribute('is-template')&&!ele.hasAttribute('is-slot')
    };
    this.registerId = (entityType) => {
        return 'neoan-' + entityType + '-' + Math.random().toString(36).substring(7)
    };
    this.firstObjectKey = (obj) => {
        return Object.keys(obj)[0]
    };
    this.objToFlatArray = (obj) => {
        let res = [], pusher, key;
        Object.keys(obj).forEach((level) => {
            pusher = {};
            if (typeof obj[level] === 'object' && obj[level] !== null) {
                this.objToFlatArray(obj[level]).forEach((deep, k) => {
                    key = this.firstObjectKey(deep);
                    pusher = {};
                    pusher[level + '.' + key] = obj[level][key];
                    res.push(pusher);
                });

            } else {
                pusher[level] = obj[level];
                res.push(pusher);
            }
        });
        return res;
    };
    this.deepFlatten = (declaration, obj) => {
        return declaration.split('.').reduce((xs, x) => (xs && xs[x]) ? xs[x] : '', obj)
    };
    this.compareObjects = (obj1, obj2) => {
        return Object.entries(obj1).toString() === Object.entries(obj2).toString();
    };
    this.kebabToCamel = (str)=>{
        return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    };
    this.camelToKebab = function(str){
        return str.replace(/[A-Z]/g,(hit)=>{return '-'+hit.toLowerCase()});
    }
};
const helper = new Helper();
export default helper;
