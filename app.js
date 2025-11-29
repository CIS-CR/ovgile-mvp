document.getElementById("surfForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    document.getElementById("statusMsg").innerText = "Enviando pedido...";

    try {
        const resp = await fetch("https://ovgile-handler.colinisaunders.workers.dev", {
    method: "POST",
    body: formData
});

        if (resp.ok) {
            document.getElementById("statusMsg").innerText = "Pedido enviado con éxito 🎉";
            form.reset();
        } else {
            document.getElementById("statusMsg").innerText = "Error al enviar. Intente de nuevo.";
        }

    } catch (err) {
        document.getElementById("statusMsg").innerText = "No se pudo conectar con el servidor.";
    }
});
