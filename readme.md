# 🏄‍♂️ OVGILE – MVP v1.0  
Formulario de Pedido Custom para Tablas de Surf  
🚀 Cloudflare Pages + Cloudflare Workers + Trello API

---

## 📌 Descripción General

Este proyecto corresponde al MVP v1.0 de OVGILE:  
Una herramienta simple para capturar pedidos personalizados de tablas de surf y enviarlos a un backend serverless que crea tarjetas automáticamente en Trello.

Este MVP establece el núcleo del flujo:

**Formulario → Cloudflare Worker → Trello (tarjeta creada automáticamente)**

---

## 🛠️ Arquitectura del MVP

### 1. **Frontend (Cloudflare Pages)**
- HTML + CSS + JS minimalista
- Formulario responsivo y mobile-friendly
- Envío de datos mediante `fetch()` en formato JSON

### 2. **Backend (Cloudflare Workers)**
- Endpoint POST serverless
- Manejo completo de CORS
- Validación segura de datos
- Construcción del payload para Trello
- Respuesta JSON al cliente

### 3. **Trello API**
- Recepción del pedido
- Creación de tarjeta en una lista específica
- Descripción formateada con el JSON del pedido completo

---

---

## 📄 index.html

Incluye:

- Tipo de tabla
- Marca / shaper
- Datos del cliente
- Medidas (largo, ancho, grosor, volumen)
- Construcción (PU/Epoxy)
- Configuración de quillas
- Notas adicionales
- Checkbox de confirmación con `name="confirmacion"` ✓
- Botón de envío

Todo envuelto en un formulario con `id="surfForm"`.

---

## 📜 app.js – Lógica del Envío de Datos

- Convierte `FormData` → JSON
- Envía al Worker con `fetch()` vía POST
- Maneja estados visuales:
  - “Enviando…”
  - “Pedido enviado con éxito 🎉”
  - Manejo de errores

Ejemplo del fetch:

```js
fetch("https://ovgile-handler.colinisaunders.workers.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});


## 📂 Estructura del Proyecto

