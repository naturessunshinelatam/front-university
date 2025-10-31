// Importar FormData para Node.js
import FormData from 'form-data';
import { Readable } from 'stream';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Obtener el token de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    console.log('📤 Upload request recibido en Vercel');
    console.log('📋 Content-Type:', req.headers['content-type']);

    // Construir URL del backend
    const backendUrl = `https://universidad-sunshine-266897521700.us-central1.run.app/api/Hostinger/upload/image`;

    console.log('🔄 Proxy upload a:', backendUrl);

    // Convertir el request body a un stream y reenviarlo al backend
    // Esto mantiene el FormData original intacto
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': req.headers['content-type'], // Mantener el Content-Type original con boundary
      },
      body: req, // Pasar el request completo como stream
      duplex: 'half', // Necesario para streaming en Node.js fetch
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
    console.log('✅ Upload exitoso:', data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Proxy error (upload):', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}

// Configuración especial para Vercel para manejar archivos grandes
export const config = {
  api: {
    bodyParser: false, // Desactivar el body parser de Vercel para manejar FormData manualmente
    bodyLimit: '20mb', // Límite de tamaño del body (request) - 20MB máximo
    responseLimit: '20mb', // Límite de tamaño de respuesta - 20MB máximo
  },
};
