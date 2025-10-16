export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { path, ...queryParams } = req.query;
    
    // El path puede contener path parameters (ej: "Categories/update/123")
    // Mantener la estructura completa del path
    const targetPath = Array.isArray(path) ? path.join('/') : path;
    
    // Construir URL del backend
    const backendUrl = `https://stage-sunshine-university-75022824581.us-central1.run.app/api/${targetPath}`;
    
    // Construir query string si hay parámetros adicionales (excluyendo 'path')
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    console.log('🔄 Proxy request:', req.method, fullUrl);

    // Preparar headers
    const headers = {
      'Accept': 'application/json',
    };

    // Copiar Authorization header si existe
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Determinar si es FormData o JSON
    const isFormData = req.headers['content-type']?.includes('multipart/form-data');
    
    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (isFormData) {
        // Para FormData, pasar el body directamente sin modificar
        body = req.body;
        // NO establecer Content-Type para FormData, el browser lo hace automáticamente
      } else {
        // Para JSON, establecer Content-Type y stringify
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(req.body);
      }
    }

    // Hacer la petición al backend
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });

    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
