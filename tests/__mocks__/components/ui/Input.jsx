const React = require('react');

const Input = React.forwardRef(({ label, error, className, ...props }, ref) => {
    return React.createElement('div', { className },
        label && React.createElement('label', null, label),
        React.createElement('input', { ref, className: 'input-mock', ...props }),
        error && React.createElement('p', { className: 'error' }, error)
    );
});
Input.displayName = 'Input';

const Textarea = React.forwardRef(({ label, error, className, ...props }, ref) => {
    return React.createElement('div', { className },
        label && React.createElement('label', null, label),
        React.createElement('textarea', { ref, className: 'textarea-mock', ...props }),
        error && React.createElement('p', { className: 'error' }, error)
    );
});
Textarea.displayName = 'Textarea';

const Select = React.forwardRef(({ label, options, error, className, ...props }, ref) => {
    return React.createElement('div', { className },
        label && React.createElement('label', null, label),
        React.createElement('select', { ref, className: 'select-mock', ...props },
            (options || []).map((opt, i) => 
                React.createElement('option', { key: i, value: opt.value || opt }, opt.label || opt)
            )
        ),
        error && React.createElement('p', { className: 'error' }, error)
    );
});
Select.displayName = 'Select';

module.exports = {
    default: Input,
    Input,
    Textarea,
    Select,
};
