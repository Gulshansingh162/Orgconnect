
const API_URL = "/api/auth";

const form = document.getElementById("authForm");
const signupFields = document.getElementById("signupFields");
const studentFields = document.getElementById("studentFields");
const employeeFields = document.getElementById("employeeFields");
const title = document.getElementById("formTitle");
const subtitle = document.getElementById("formSubtitle");
const notice = document.getElementById("notice");
const submitButton = document.getElementById("submitButton");
const passwordInput = document.getElementById("password");
const fullName = document.getElementById("fullName");

let role = "student";
let mode = "signup";

function setRequired(container, required) {
  container.querySelectorAll("input").forEach((input) => {
    input.required = required;
  });
}

function showMessage(message, type) {
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
}

function clearMessage() {
  notice.hidden = true;
  notice.textContent = "";
}

function updateForm() {
  const isSignup = mode === "signup";

  signupFields.hidden = !isSignup;
  setRequired(signupFields, isSignup);

  studentFields.hidden = !isSignup || role !== "student";
  employeeFields.hidden = !isSignup || role !== "employee";

  setRequired(studentFields, isSignup && role === "student");
  setRequired(employeeFields, isSignup && role === "employee");

  fullName.required = isSignup;
  passwordInput.autocomplete = isSignup
    ? "new-password"
    : "current-password";

  title.textContent = isSignup
    ? "Create your account"
    : "Welcome back";

  subtitle.textContent = isSignup
    ? `Sign up as a ${role}.`
    : `Log in to your ${role} account.`;

  document.getElementById("signupTab").classList.toggle(
    "active", isSignup
  );

  document.getElementById("loginTab").classList.toggle(
    "active", !isSignup
  );

  submitButton.innerHTML = isSignup
    ? 'Create account <span>→</span>'
    : 'Log in <span>→</span>';

  passwordInput.minLength = isSignup ? 8 : 1;
  clearMessage();
}

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => {
    role = button.dataset.role;

    document.querySelectorAll(".mode").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    updateForm();
  });
});

document.getElementById("signupTab").addEventListener("click", () => {
  mode = "signup";
  updateForm();
});

document.getElementById("loginTab").addEventListener("click", () => {
  mode = "login";
  updateForm();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const data = new FormData(form);
  const payload = {
    email: String(data.get("email") || "").trim(),
    password: String(data.get("password") || ""),
  };

  let endpoint;

  if (mode === "signup") {
    payload.fullName = String(data.get("fullName") || "").trim();

    if (role === "student") {
      payload.college = String(data.get("college") || "").trim();
      payload.course = String(data.get("course") || "").trim();

      const year = data.get("graduationYear");
      if (year !== "") {
        payload.graduationYear = Number(year);
      }

      endpoint = `${API_URL}/signup/student`;
    } else {
      payload.company = String(data.get("company") || "").trim();
      payload.designation = String(data.get("designation") || "").trim();

      const experience = data.get("experience");
      if (experience !== "") {
        payload.experience = Number(experience);
      }

      endpoint = `${API_URL}/signup/employee`;
    }
  } else {
    payload.role = role;
    endpoint = `${API_URL}/login`;
  }

  submitButton.disabled = true;
  submitButton.textContent = mode === "signup"
    ? "Creating account..."
    : "Logging in...";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Request failed.");
    }

    showMessage(result.message || "Request successful.", "success");

    if (mode === "signup") {
      form.reset();
      passwordInput.value = "";
    } else {
      // The current backend verifies credentials but does not
      // establish a persistent login session or issue a token.
      // Do not treat this response alone as production authentication.
      console.log("Verified account:", result.user);
    }
  } catch (error) {
    showMessage(
      error.message === "Failed to fetch"
        ? "Cannot connect to the backend. Check that the server is running."
        : error.message,
      "error"
    );
  } finally {
    submitButton.disabled = false;
    updateForm();
  }
});

updateForm();
