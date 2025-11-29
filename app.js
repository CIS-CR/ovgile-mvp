document.getElementById("surfForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const data = {};

    new FormData(form).forEach((value, key) => {
        data[key] = value;
    });

    document.getElementById("statusMsg").innerText = "Enviando...";

    try {
        const resp = await fetch("https://ovgile-handler.colinisaunders.workers.dev", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (resp.ok) {
            document.getElementById("statusMsg").innerText = "Pedido enviado con éxito 🎉";
            form.reset();
        } else {
            document.getElementById("statusMsg").innerText = "Error al enviar.";
        }

    } catch (err) {
        document.getElementById("statusMsg").innerText = "No se pudo conectar con el servidor.";
    }
});

