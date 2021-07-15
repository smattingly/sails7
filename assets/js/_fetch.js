async function submitFormDataAsJson(method, url, formData) {
	const plainFormData = Object.fromEntries(formData.entries());
	const formDataJsonString = JSON.stringify(plainFormData);

	const fetchOptions = {
		method: method,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: formDataJsonString,
	};

	const response = await fetch(url, fetchOptions);

	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage);
	}

	return response.json();
}

async function handleFormSubmit(event, method) {
	event.preventDefault();

	const form = event.currentTarget;
	const url = form.action;

	try {
		const formData = new FormData(form);
		const responseData = await submitFormDataAsJson(method, url, formData);
	} catch (error) {
		console.error(error);
		return error;
	}

	return true;
}

async function restfulDelete(url) {
	const fetchOptions = {
		method: "DELETE",
	};

	const response = await fetch(url, fetchOptions);

	if (!response.ok) {
		const errorMessage = await response.text();
		console.error(errorMessage);
		showBanner(`Error. <code>${errorMessage}</code>`, 'danger');
		return;
	}

	showBanner(`Success. ${url} was deleted.`, 'success');
}

function setupCreateForm(form, callback) {
	form.addEventListener("submit", (event) => {
		callback(handleFormSubmit(event, "POST"));
	});
}

function setupUpdateForm(form, callback) {
	form.addEventListener("submit", (event) => {
		callback(handleFormSubmit(event, "PATCH"));
	});
}