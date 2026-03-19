const React = require('react');

const motion = {
  div: ({ children, ...props }) => React.createElement('div', props, children),
  span: ({ children, ...props }) => React.createElement('span', props, children),
  tr: ({ children, ...props }) => React.createElement('tr', props, children),
  button: ({ children, ...props }) => React.createElement('button', props, children),
  form: ({ children, ...props }) => React.createElement('form', props, children),
  article: ({ children, ...props }) => React.createElement('article', props, children),
};

const AnimatePresence = ({ children }) => children;

module.exports = {
  motion,
  AnimatePresence,
};
