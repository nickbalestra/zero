'use strict';

const deliver = deliverModule => {
  return [
    { method: 'tokenField', type: 'string' },
    { method: 'addressField', type: 'string' },
    { method: 'send', type: 'function' }
  ].every(api => typeof deliverModule[api.method] === api.type);
};

module.exports = {
  deliver
};
