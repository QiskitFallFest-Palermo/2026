document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) {
        return;
    }

    const status = document.getElementById('success');
    const submitButton = form.querySelector('[type="submit"]');

    const showStatus = (variant, message) => {
        status.replaceChildren();

        const alert = document.createElement('div');
        alert.className = `alert alert-${variant} alert-dismissible fade show`;
        alert.setAttribute('role', 'alert');

        const text = document.createElement('strong');
        text.textContent = message;
        alert.append(text);

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.dataset.bsDismiss = 'alert';
        closeButton.setAttribute('aria-label', 'Close');
        alert.append(closeButton);

        status.append(alert);
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
            return;
        }

        submitButton.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Contact endpoint returned HTTP ${response.status}`);
            }

            showStatus('success', 'Your message has been sent.');
            form.reset();
            form.classList.remove('was-validated');
        } catch (error) {
            console.error('Unable to submit the contact form.', error);
            showStatus('danger', 'The message could not be sent. Please try again later.');
        } finally {
            submitButton.disabled = false;
        }
    });

    form.addEventListener('input', () => status.replaceChildren(), { once: true });
});
