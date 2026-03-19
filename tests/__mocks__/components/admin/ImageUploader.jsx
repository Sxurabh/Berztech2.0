const React = require('react');

function ImageUploader({ value, onChange }) {
    return React.createElement('div', { 'data-testid': 'image-uploader' },
        value ? 
            React.createElement('div', { className: 'preview' },
                React.createElement('button', { onClick: () => onChange(''), 'data-testid': 'remove-btn' }, 'Remove'),
                React.createElement('button', { 'data-testid': 'replace-btn' }, 'Replace')
            ) :
            React.createElement('div', { className: 'dropzone', 'data-testid': 'dropzone' }, 'Click to upload')
    );
}

module.exports = { default: ImageUploader, ImageUploader };
