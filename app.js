document.getElementById("surfForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Convertir FormData a JSON
  const data = {};
  formData.forEach((value, key) => (data[key] = value));

  // Limpieza mínima (MVP)
  // - El checkbox "confirmacion" no lo necesita el Worker
  // - Si location viene vacío, lo eliminamos para evitar ruido
  delete data.confirmacion;
  if (!data.location || String(data.location).trim() === "") {
    delete data.location;
  }

  const statusEl = document.getElementById("statusMsg");
  statusEl.innerText = "Enviando solicitud...";

  try {
    // ✅ Nuevo endpoint: Core Engine (reemplaza Trello/handler)
    const resp = await fetch("https://ovgile.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      // /submit responde JSON: { ok: true, id: "OV###", order: {...} }
      let payload = null;
      try {
        payload = await resp.json();
      } catch (_) {}

      const ticketText = payload?.id ? ` Ticket: ${payload.id}` : "";
      statusEl.innerText = `Solicitud enviada con éxito.${ticketText}`;
      form.reset();
      return;
    }

    // Manejo de error con detalle
    const errText = await resp.text();
    statusEl.innerText = errText
      ? `Error: ${errText}`
      : "Error al enviar. Intente de nuevo.";

  } catch (err) {
    statusEl.innerText = "No se pudo conectar con el servidor.";
  }
});



