// Temporary stub service for feedback forms to allow production build
// Replace with real API calls to your backend when available

export async function getFeedbackForm(formId) {
  return {
    id: formId,
    title: "Untitled Form",
    description: "",
    status: "draft",
  };
}

export async function updateFeedbackForm(_formId, _payload) {
  // Simulate a successful update
  return true;
}

export async function listFeedbackForms() {
  // Return empty array for now
  return [];
}

export async function createFeedbackForm(_payload) {
  // Simulate creating a form
  return { id: "stub-form-id", ..._payload };
}


