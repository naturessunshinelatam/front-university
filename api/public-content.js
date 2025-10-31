export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { countryCode } = req.query;
    
    if (!countryCode) {
      res.status(400).json({ error: 'Country code is required' });
      return;
    }

    // Construir URL del backend para contenido público (SIN PROXY, directo)
    const backendUrl = `https://universidad-sunshine-266897521700.us-central1.run.app/api/SiteContent/countryAll/${countryCode}`;

    console.log('🔄 Fetching public content:', backendUrl);

    // Hacer la petición al backend SIN autenticación (es público)
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      res.status(response.status).json({ 
        error: 'Backend error', 
        status: response.status,
        message: errorText 
      });
      return;
    }

    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Proxy error (public content):', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
