// -------------------------------------------
// TEMPORARY MANUAL MAIL TEST ROUTE
// -------------------------------------------
async function sendTestMail(env) {
  const payload = {
    personalizations: [
      { to: [{ email: "colinisaunders@gmail.com" }] }
    ],
    from: {
      email: "orders@ovgile.com",
      name: "Ovgile Test"
    },
    headers: {
      "X-Sender": "orders@ovgile.com"
    },    
    subject: "Test email from MailChannels",
    content: [
      {
        type: "text/plain",
        value: "If you received this, MailChannels is working."
      }
    ]
  };

  const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AuthUser": "orders@ovgile.com"   // REQUIRED
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  return new Response("Mail Test Response:\n" + text, { status: 200 });
}

export default {
  async fetch(request, env) {
    try {
      // -------------------------------------------
      // CORS HANDLING
      // -------------------------------------------
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          }
        });
      }

      // TEMPORARY TEST ROUTE
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === "/test-mail") {
        return sendTestMail(env);
      }

      // Only POST requests for normal orders
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      // -------------------------------------------
      // PARSE JSON BODY
      // -------------------------------------------
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response("Invalid JSON", { status: 400 });
      }

      // -------------------------------------------
      // 1) CREATE SEQUENTIAL ORDER NUMBER (KV)
      // -------------------------------------------
      let orderNumber = await env.OVGILE_ORDERS_KV.get("order_counter");
      if (!orderNumber) orderNumber = 1;

      const newOrderNumber = Number(orderNumber) + 1;
      await env.OVGILE_ORDERS_KV.put("order_counter", newOrderNumber.toString());

      const orderID = `OV-${newOrderNumber.toString().padStart(5, "0")}`;

      // -------------------------------------------
      // 2) SAVE ORDER IN TRELLO
      // -------------------------------------------
      if (!env.TRELLO_KEY || !env.TRELLO_TOKEN || !env.TRELLO_LIST_ID) {
        return new Response("Missing Trello environment variables", { status: 500 });
      }

      const englishData = {
        surfboard_type: body.tipo_tabla,
        brand: body.marca,
        name: body.nombre,
        email: body.email,
        phone: body.telefono,
        age: body.edad,
        height: body.altura,
        weight: body.peso,
        level: body.nivel,
        model: body.modelo,
        length: body.largo,
        width: body.ancho,
        thickness: body.grosor,
        volume: body.volumen,
        construction: body.construccion,
        fin_system: body.quillas,
        fin_config: body.config_quillas,
        notes: body.notas,
        confirmation: body.confirmacion,
      };

      const trelloPayload = {
        name: `${orderID} - ${body.nombre}`,
        desc: JSON.stringify(englishData, null, 2),
      };

      const trelloUrl =
        `https://api.trello.com/1/cards?idList=${env.TRELLO_LIST_ID}&key=${env.TRELLO_KEY}&token=${env.TRELLO_TOKEN}`;

      const trelloRes = await fetch(trelloUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trelloPayload),
      });

      if (!trelloRes.ok) {
        const errorText = await trelloRes.text();
        return new Response("Trello API error:\n" + errorText, { status: 500 });
      }

      // -------------------------------------------
      // 3) SEND EMAILS USING MAILCHANNELS
      // -------------------------------------------

      const emailHtml = `
        <h2>Thanks for your custom order!</h2>
        <p>Your order number is <strong>${orderID}</strong>.</p>
        <p>We will contact you soon to confirm the details.</p>
        <hr>
        <p><strong>Order summary:</strong></p>
        <pre>${JSON.stringify(englishData, null, 2)}</pre>
      `;

      const customerEmail = {
        personalizations: [{ to: [{ email: body.email }] }],
        from: { email: "no-reply@ovgile.com", name: "Ovgile Orders" },
        subject: `Your Order Confirmation – ${orderID}`,
        content: [{ type: "text/html", value: emailHtml }],
      };
      
      const factoryEmail = {
        personalizations: [{ to: [{ email: "ovgileapp@gmail.com" }] }],
        from: { email: "no-reply@ovgile.com", name: "Ovgile Orders" },
        subject: `New Order Received – ${orderID}`,
        content: [{
            type: "text/html",
            value: `<pre>${JSON.stringify(englishData, null, 2)}</pre>`,
        }],
      };      

      // HELPERS FOR MAILCHANNELS SEND
      async function sendMail(payload) {
        return await fetch("https://api.mailchannels.net/tx/v1/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AuthUser": "orders@ovgile.com"  // REQUIRED
          },
          body: JSON.stringify(payload)
        });
      }

      await sendMail(customerEmail);
      await sendMail(factoryEmail);

      // -------------------------------------------
      // SUCCESS RESPONSE
      // -------------------------------------------
      return new Response(
        JSON.stringify({ success: true, orderID }),
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          }
        }
      );

    } catch (err) {
      return new Response("Server error:\n" + err.message, { status: 500 });
    }
  }
};
