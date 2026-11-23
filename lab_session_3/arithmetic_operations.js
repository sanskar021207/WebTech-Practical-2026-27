function addition() {
  let a = parseFloat(document.getElementById("num1").value);
  let b = parseFloat(document.getElementById("num2").value);

  document.getElementById("result").innerHTML = "Addition = " + (a + b);
}

function subtraction() {
  let a = parseFloat(document.getElementById("num1").value);
  let b = parseFloat(document.getElementById("num2").value);

  document.getElementById("result").innerHTML = "Subtraction = " + (a - b);
}

function multiplication() {
  let a = parseFloat(document.getElementById("num1").value);
  let b = parseFloat(document.getElementById("num2").value);

  document.getElementById("result").innerHTML = "Multiplication = " + a * b;
}

function division() {
  let a = parseFloat(document.getElementById("num1").value);
  let b = parseFloat(document.getElementById("num2").value);

  if (b === 0) {
    document.getElementById("result").innerHTML =
      "Division by zero is not possible.";
  } else {
    document.getElementById("result").innerHTML = "Division = " + a / b;
  }
}
