const INPUT_TAGS = ['input', 'textarea', 'select'];

/**
 * @param {HTMLInputElement} input
 */
function validateInput(input) {
  const firstInputOfType = input
    .closest('form')
    .querySelector(`[name="${input.name}"]`);

  let id;

  if (input.type === 'radio' && firstInputOfType !== input) {
    id = firstInputOfType.id;
  } else {
    id = input.id || Math.random().toString(36).slice(2);
    input.id = id;
  }

  let errorsId = `${id}-errors`;
  let descriptors = input.getAttribute('aria-describedby');
  descriptors = descriptors ? descriptors.split(' ') : [];
  descriptors = descriptors.filter((id) => id !== errorsId);

  const { validity } = input;

  input.setAttribute('aria-invalid', validity.valid ? 'false' : 'true');

  document.getElementById(errorsId)?.remove();

  if (!validity.valid) {
    const errors = [];
    const errorsContainer = document.createElement('div');
    errorsContainer.id = errorsId;
    errorsContainer.classList.add('errors');

    if (validity.valueMissing) {
      errors.push('Value is required.');
    }
    if (validity.patternMismatch) {
      errors.push('Value does not match pattern.');
    }
    if (validity.rangeOverflow) {
      errors.push(`Value is too large (max: ${input.max}).`);
    }
    if (validity.rangeUnderflow) {
      errors.push(`Value is too small (min: ${input.min}).`);
    }
    if (validity.typeMismatch) {
      errors.push(`Value is not the expected type of ${input.type}.`);
    }

    descriptors.push(errorsId);
    errorsContainer.textContent = errors.join(' ');
    if (input.type === 'radio' && firstInputOfType !== input) {
      firstInputOfType.after(errorsContainer);
    } else {
      input.after(errorsContainer);
    }
  }

  if (descriptors.length > 0) {
    input.setAttribute('aria-describedby', descriptors.join(' '));
  }
}

/**
 * @param {Event} event
 */
function validateOnEvent(event) {
  /** @type {HTMLInputElement} */
  const input = event.target;
  if (event.type === 'blur') {
    input.dataset.isDirty = true;
  }
  if (!input.dataset.isDirty) return;
  validateInput(input);
}

/** @param {SubmitEvent} event */
function jsSubmitForm(event) {
  /** @type {HTMLFormElement} */
  const form = event.target;
  const url = new URL(form.action || window.location.href);
  const formData = new FormData(form);
  const searchParameters = new URLSearchParams(formData);

  const options = {
    method: form.method,
  };

  if (options.method === 'post') {
    // Modify request body to include form data
    // ex /api => { foo: 'bar' }
    options.body =
      form.enctype === 'multipart/form-data' ? formData : searchParameters;
  } else {
    // Modify URL to include form data
    // ex /api => /api?foo=bar
    url.search = searchParameters;
  }

  event.preventDefault();
  return fetch(url, options);
}

for (const form of document.querySelectorAll('form')) {
  for (const input of form.querySelectorAll(INPUT_TAGS.join(','))) {
    input.addEventListener('blur', validateOnEvent);
    input.addEventListener('input', validateOnEvent);
  }

  form.noValidate = true;
  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      for (const input of form.querySelectorAll(INPUT_TAGS.join(','))) {
        input.dataset.isDirty = true;
        validateInput(input);
      }
      form.querySelector(':invalid:not(fieldset)').focus();
      event.preventDefault();
      return;
    }

    jsSubmitForm(event).then((response) => {
      console.log(response);
      if (!response.ok) {
        alert('Error: ' + response.statusText);
      }
      response.json().then((data) => {
        alert(`The counter is at ${data.counter}.`);
        form.reset();
      });
    });
  });
}
