export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Hacer la llamada a la API externa
    const response = await fetch('https://universidad-sunshine-266897521700.us-central1.run.app/api/Auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    // Devolver la respuesta con los headers CORS correctos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en proxy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
