const Helper = function () {
    this.isFunction = (obj, key) => obj && typeof obj[key] === 'function';
    this.embrace = (template) => {
        return template
            .match(/{{[a-z0-9\.]+}}/im)
            .map((m) => m.substring(2, m.length - 2));
    },
    this.computeState = (key, fn) => state => state[key] = fn({...state})
};
const helper = new Helper();
export default helper;