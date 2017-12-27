'use strict';

const records = [
  { id: 1, username: 'john', displayName: 'John', email: 'jack@example.com' },
  { id: 2, username: 'jane', displayName: 'Jane', email: 'jane@example.com' }
];

const findByEmail = email =>
  new Promise(resolve => {
    setTimeout(
      () => resolve(records.find(user => user.email === email) || false),
      50
    );
  });

const findById = id =>
  new Promise(resolve => {
    setTimeout(() => resolve(records[id - 1] || false), 50);
  });

module.exports = {
  users: {
    findByEmail,
    findById
  }
};
