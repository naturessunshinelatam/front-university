export default async function handler(req, res) {
  // Solo permitir PUT y OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authToken = req.headers.authorization;
    
    console.log('📥 Datos recibidos del frontend:', { ...req.body, password: req.body.password ? '[RECEIVED]' : '[NOT_RECEIVED]' });
    
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
    
    // Preparar el body para la API externa
    let requestBody = { ...req.body };
    
    // Password ya no es obligatorio - se puede omitir para mantener la actual
    if (!requestBody.password || requestBody.password.trim() === '') {
      delete requestBody.password;
      console.log('🔧 Password omitido para mantener el actual');
    } else {
      console.log('🔑 Password nuevo será enviado');
    }
    
    console.log('📤 Enviando a API externa:', { 
      ...requestBody, 
      password: requestBody.password ? '[NUEVO_PASSWORD]' : '[PASSWORD_OMITIDO]' 
    });
    
    // Hacer la llamada a la API externa
    const response = await fetch('https://universidad-sunshine-266897521700.us-central1.run.app/api/User/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authToken || ''
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log('📨 Respuesta de API externa:', response.status, data);

    // Devolver la respuesta con los headers CORS correctos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en actualizar usuario:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
