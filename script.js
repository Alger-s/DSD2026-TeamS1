// Form submission and response handling
document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Capture form data
    const name = document.getElementById("name").value;
    const role = document.getElementById("role").value;

    // Display a success message
    const responseElement = document.getElementById("form-response");
    responseElement.style.display = "block";
    responseElement.textContent = `${name}, your application for the ${role} role has been successfully submitted!`;

    // Optionally: Send form data to a backend API or store in local storage for further processing.
});
