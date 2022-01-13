const INPUT_TAGS = ['input', 'textarea', 'select']

for (const input of document.querySelectorAll(INPUT_TAGS.join(','))) {
  input.addEventListener('blur', event => {
    /** @type {HTMLInputElement} */
    const input = event.target
    const inputId = input.id || Math.random().toString(36).slice(2)
    input.id = inputId
    const errorsId = `${inputId}-errors`
    input.setAttribute('aria-describedby', errorsId)
    const { validity } = input

    document.getElementById(errorsId)?.remove()
    input.setAttribute('aria-invalid', validity.valid ? 'false' : 'true')

    if (!validity.valid) {
      const errors = []
      const errorsContainer = document.createElement('div')
      errorsContainer.id = errorsId
      errorsContainer.classList.add('errors')

      if (validity.valueMissing) {
        errors.push('Value is required.')
      }
      if (validity.patternMismatch) {
        errors.push('Value does not match pattern.')
      }
      if (validity.rangeOverflow) {
        errors.push(`Value is too large (max: ${input.max}).`)
      }
      if (validity.rangeUnderflow) {
        errors.push(`Value is too small (min: ${input.min}).`)
      }
      if (validity.typeMismatch) {
        errors.push(`Value is not the expected type of ${input.type}.`)
      }

      console.log('place erorrs')
      errorsContainer.innerText = errors.join(' ')
      input.after(errorsContainer)
    }
  })
}

/** @param {SubmitEvent} event */
function jsSubmitForm(event) {
  /** @type {HTMLFormElement} */
  const form = event.target;
  const url = new URL(form.action || window.location.href)
  const formData = new FormData(form)
  const searchParameters = new URLSearchParams(formData)

  const options = {
    method: form.method,
  }

  if (options.method === 'get') {
    // Modify URL to include form data
    // ex /api => /api?foo=bar
    url.search = searchParameters
  } else {
    // Modify request body to include form data
    // ex /api => { foo: 'bar' }
    options.body = form.enctype === 'multipart/form-data' ? formData : searchParameters
  }

  event.preventDefault()
  return fetch(url, options)
}

for (const form of document.querySelectorAll('form')) {
  form.noValidate = true
  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      console.log('NOOOOOOO!!!!!')
      form.querySelector(':invalid:not(fieldset)').focus()
      event.preventDefault()
      return
    }

    jsSubmitForm(event).then(response => {
      console.log(response)
      if (response.ok) {
        form.reset()
      } else {
        alert('Error: ' + response.statusText)
      }
    })
  });
}
