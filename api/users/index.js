export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authToken = req.headers.authorization;

    // Hacer la llamada a la API externa
    const backendBaseRaw = process.env.BACKEND_API_BASE_URL || 'https://universidad-sunshine-266897521700.us-central1.run.app';
    const backendBase = backendBaseRaw.replace(/\/$/, '');
    const response = await fetch(`${backendBase}/api/User`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authToken || ''
      }
    });

    const data = await response.json();

    // Devolver la respuesta con los headers CORS correctos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en proxy usuarios:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
