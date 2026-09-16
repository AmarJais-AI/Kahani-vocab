export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email } = req.body || {};

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: "Razorpay API keys are not configured."
      });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const orderData = {
      amount: 19900,
      currency: "INR",
      receipt: `vocab_${Date.now()}`,

      offers: ["offer_TcJ6j2zmNLbkRa"],
      force_offer: true,

      notes: {
        product: "Kahani-Kahani Mein 1000 Vocabulary",
        buyer_name: name || "",
        buyer_email: email || ""
      }
    };

    const response = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: keyId
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Unable to create Razorpay order."
    });
  }
}
