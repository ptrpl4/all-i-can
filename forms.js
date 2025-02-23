document.addEventListener('DOMContentLoaded', () => {
    // Test input types
    const inputTypes = [
        'color',
        'date',
        'datetime-local',
        'email',
        'month',
        'number',
        'range',
        'search',
        'tel',
        'time',
        'url',
        'week'
    ];

    const inputTests = document.getElementById('inputTests');
    
    inputTypes.forEach(type => {
        const input = document.createElement('input');
        input.type = type;
        // Check if the browser fell back to "text" type
        const isSupported = input.type === type;
        showResult(inputTests, `Input type: ${type}`, isSupported);
    });

    // Test form features
    const formFeatureTests = document.getElementById('formFeatureTests');
    
    // Test autocomplete
    const hasAutocomplete = 'autocomplete' in document.createElement('input');
    showResult(formFeatureTests, 'Autocomplete', hasAutocomplete);

    // Test autofocus
    const hasAutofocus = 'autofocus' in document.createElement('input');
    showResult(formFeatureTests, 'Autofocus', hasAutofocus);

    // Test placeholder
    const hasPlaceholder = 'placeholder' in document.createElement('input');
    showResult(formFeatureTests, 'Placeholder', hasPlaceholder);

    // Test multiple file upload
    const hasMultiple = 'multiple' in document.createElement('input');
    showResult(formFeatureTests, 'Multiple file upload', hasMultiple);

    // Test validation features
    const validationTests = document.getElementById('validationTests');
    
    // Test form validation API
    const hasValidation = typeof document.createElement('form').checkValidity === 'function';
    showResult(validationTests, 'Form Validation API', hasValidation);

    // Test pattern attribute
    const hasPattern = 'pattern' in document.createElement('input');
    showResult(validationTests, 'Pattern attribute', hasPattern);

    // Test required attribute
    const hasRequired = 'required' in document.createElement('input');
    showResult(validationTests, 'Required attribute', hasRequired);

    // Test min/max attributes
    const hasMinMax = 'min' in document.createElement('input') && 'max' in document.createElement('input');
    showResult(validationTests, 'Min/Max attributes', hasMinMax);

    // Test step attribute
    const hasStep = 'step' in document.createElement('input');
    showResult(validationTests, 'Step attribute', hasStep);
});

function showResult(container, feature, supported) {
    const div = document.createElement('div');
    div.className = `test-result ${supported ? 'success' : 'failure'}`;
    div.textContent = `${feature}: ${supported ? 'Supported' : 'Not Supported'}`;
    container.appendChild(div);
} 