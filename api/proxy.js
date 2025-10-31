export default async function handler(req, res) {
  // CORS: si necesitas credenciales, reenvía el origin; si no, puedes usar '*'
  const origin = req.headers.origin || '*';
  if (origin && origin !== 'null') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { path, ...queryParams } = req.query;
    const targetPath = Array.isArray(path) ? path.join('/') : path;
    // Asegúrate de que esta URL sea la correcta en el nuevo proyecto (revisar si cambió)
    const backendUrl = `https://universidad-sunshine-266897521700.us-central1.run.app/api/${targetPath}`;
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    console.log('🔄 Proxy request:', req.method, fullUrl);

    const headers = {
      'Accept': '*/*', // aceptar images y json
    };

    // Forward Authorization and Cookie if present (si tu backend lo necesita)
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    // Preparar body (si no es GET/HEAD)
    let body;
    const isFormData = req.headers['content-type']?.includes('multipart/form-data');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (isFormData) {
        body = req.body; // esto puede necesitar ajuste si recibes streams
      } else {
        headers['Content-Type'] = req.headers['content-type'] || 'application/json';
        body = req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : undefined;
      }
    }

    const response = await fetch(fullUrl, {
      method: req.method,
      headers,
      body,
    });

    // Pasar algunos headers útiles al cliente
    const contentType = response.headers.get('content-type');
    const cacheControl = response.headers.get('cache-control');
    const contentDisposition = response.headers.get('content-disposition');

    if (contentType) res.setHeader('Content-Type', contentType);
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);
    if (contentDisposition) res.setHeader('Content-Disposition', contentDisposition);

    // Si la respuesta es JSON, parsear y reenviar como JSON
    const respStatus = response.status;

    const isJson = contentType && contentType.includes('application/json');
    if (isJson) {
      const data = await response.json();
      res.status(respStatus).json(data);
      return;
    }

    // Para cualquier otro tipo (images, binary), pasar el arrayBuffer / buffer al cliente
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Length', buffer.length);
    res.status(respStatus).send(buffer);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}