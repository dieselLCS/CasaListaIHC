
// ELEMENTOS DEL HTML

const inputs = [...document.querySelectorAll("#codeInputs input")];

const form = document.getElementById("verificationForm");
const resendBtn = document.getElementById("resendBtn");
const timerElement = document.getElementById("timer");
const message = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

let seconds = 60;
let countdown;

// TEMPORIZADOR

function startTimer() {

    clearInterval(countdown);

    seconds = 60;
    resendBtn.disabled = true;

    timerElement.textContent = "60s";

    countdown = setInterval(() => {

        seconds--;

        timerElement.textContent = seconds + "s";

        if (seconds <= 0) {

            clearInterval(countdown);

            timerElement.textContent = "Reenviar";
            resendBtn.disabled = false;
        }

    }, 1000);
}

// INICIO DEL TEMPORIZADOR

startTimer();


// INGRESO AUTOMÁTICO DE LOS DÍGITOS

inputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        input.value = input.value.replace(/\D/g, "").slice(-1);

        if (input.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        message.textContent = "";

    });

    // RETROCEDER CON BACKSPACE

    input.addEventListener("keydown", (event) => {

        if (
            event.key === "Backspace" &&
            !input.value &&
            index > 0
        ) {
            inputs[index - 1].focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputs[index - 1].focus();
        }

        if (
            event.key === "ArrowRight" &&
            index < inputs.length - 1
        ) {
            inputs[index + 1].focus();
        }

    });

});


// PEGAR CÓDIGO COMPLETO

document.getElementById("codeInputs").addEventListener(
    "paste",
    (event) => {

        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, inputs.length);

        if (!pasted) return;

        event.preventDefault();

        inputs.forEach((input, index) => {
            input.value = pasted[index] || "";
        });

        inputs[Math.min(pasted.length, inputs.length) - 1].focus();

    }
);


// REENVIAR CÓDIGO

resendBtn.addEventListener("click", () => {

    if (resendBtn.disabled) return;

    inputs.forEach(input => {
        input.value = "";
    });

    message.style.color = "#007963";
    message.textContent = "Solicitando un nuevo código...";

    // Aquí debes conectar el envío real al correo
    // mediante tu backend.

    startTimer();

    inputs[0].focus();

});


// VERIFICAR CUENTA

form.addEventListener("submit", (event) => {

    event.preventDefault();

    const code = inputs.map(input => input.value).join("");

    if (code.length !== 8) {

        message.style.color = "#b00020";
        message.textContent =
            "Por favor, ingresa los 8 dígitos.";

        const emptyInput = inputs.find(input => !input.value);

        if (emptyInput) emptyInput.focus();

        return;
    }

    message.style.color = "#007963";

    message.textContent =
        "Código ingresado correctamente. Verificando...";

    // Aquí debes conectar la validación
    // con tu backend o API.

    console.log("Código ingresado:", code);

});


// BOTÓN VOLVER

backBtn.addEventListener("click", () => {

    window.history.back();

});
