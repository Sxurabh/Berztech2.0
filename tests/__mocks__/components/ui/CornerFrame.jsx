const React = require('react');

function CornerFrame({ children, className, ...props }) {
  return React.createElement('div', { className, 'data-testid': 'corner-frame', ...props }, children);
}

module.exports = { CornerFrame };
