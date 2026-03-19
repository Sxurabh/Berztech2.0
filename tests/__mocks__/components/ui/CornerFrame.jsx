const React = require('react');

function CornerFrame({ children, className, ...props }) {
  return React.createElement('div', { className, 'data-testid': 'corner-frame', ...props }, children);
}

function ProjectCard({ children, className, ...props }) {
  return React.createElement('article', { className, ...props }, children);
}

function FeaturedProject({ children, className, ...props }) {
  return React.createElement('div', { className, ...props }, children);
}

module.exports = { CornerFrame, ProjectCard, FeaturedProject };
