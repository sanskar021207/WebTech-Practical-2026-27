function validateForm() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let mobile = document.getElementById("mobile").value.trim();
  let course = document.getElementById("course").value;

  let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let mobilePattern = /^[6-9]\d{9}$/;

  if (name === "" || email === "" || mobile === "" || course === "") {
    alert("All fields are required.");
    return false;
  }

  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  if (!mobilePattern.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return false;
  }

  alert("Student Registration Successful!");

  document.getElementById("result").innerHTML =
    "Welcome " + name + "! Registration Successful.";

  return false;
}
