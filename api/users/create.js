export default async function handler(req, res) {
  // Solo permitir POST y OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authToken = req.headers.authorization;
    
    console.log('📥 Datos recibidos para crear usuario:', { ...req.body, password: req.body.password ? '[PROVIDED]' : '[NOT_PROVIDED]' });
    
    // COMENTADO: Ya no validamos ContentManager, solo Admin
    // Validar que solo se usen roles permitidos
    // const allowedRoles = ['Admin', 'ContentManager'];
    const allowedRoles = ['Admin']; // Solo Admin permitido ahora
    if (req.body.roles && Array.isArray(req.body.roles)) {
      const invalidRoles = req.body.roles.filter(role => !allowedRoles.includes(role));
      if (invalidRoles.length > 0) {
        console.log('❌ Invalid roles:', invalidRoles);
        return res.status(400).json({ 
          error: 'Invalid roles provided',
          invalidRoles,
          allowedRoles
        });
      }
    }
    
    // Hacer la llamada a la API externa
    const response = await fetch('https://stage-sunshine-university-75022824581.us-central1.run.app/api/User/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authToken || ''
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    console.log('📨 Respuesta de API externa (crear):', response.status, data);

    // Devolver la respuesta con los headers CORS correctos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en crear usuario:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
