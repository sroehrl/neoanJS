const Helper = function () {
    this.isFunction = (obj, key) => obj && typeof obj[key] === 'function';
    this.embrace = (template) => {
        let matches =  template.match(/{{[a-z0-9\.]+}}/im);
        return matches ? matches.map((m) => m.substring(2, m.length - 2)) : [];
    };
    this.computeState = (key, fn) => state => state[key] = fn({...state});
    this.registerId = (entityType) =>{return 'neoan-'+entityType+'-'+Math.random().toString(36).substring(7)};
};
const helper = new Helper();
export default helper;
