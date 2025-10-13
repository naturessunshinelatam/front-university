# 🚀 Guía de Despliegue - Universidad Sunshine

## 📋 Configuración Híbrida Implementada

Este proyecto está configurado para funcionar tanto en **desarrollo local** como en **producción con Vercel**.

### 🔧 Configuración Automática

- **Desarrollo Local**: Usa proxy de Vite (`/api` → `https://stage-sunshine-university-75022824581.us-central1.run.app/api`)
- **Producción Vercel**: Usa rewrites de Vercel para evitar problemas de CORS

## 🌐 Despliegue en Vercel

### 1. Subir Cambios a GitHub
```bash
git add .
git commit -m "fix: configuración SPA para Vercel"
git push origin main
```

### 2. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Vite

### 3. Variables de Entorno (Opcional)
En el dashboard de Vercel, puedes agregar:
- `VITE_API_BASE_URL=/api` (ya configurado por defecto)

### 4. Configuración Automática ✅ ACTUALIZADA
- ✅ `vercel.json` configurado para SPA (Single Page Application)
- ✅ Rewrites para `/api/*` ya están listos
- ✅ Headers CORS ya están configurados
- ✅ Configuración de build automática

## 🔐 Endpoint de Login

- **URL**: `https://stage-sunshine-university-75022824581.us-central1.run.app/api/Auth/login`
- **Método**: `POST`
- **Parámetros**:
```json
{
  "username": "string",
  "password": "string"
}
```

## 🧪 Pruebas

### Desarrollo Local
```bash
npm run dev
# Visita: http://localhost:5174/login
```

### Producción
```bash
npm run build
npm run preview
# O despliega en Vercel
```

## 📱 Funcionalidades Implementadas

- ✅ Login con API real
- ✅ Manejo de tokens JWT
- ✅ Persistencia de sesión
- ✅ Navegación al panel administrativo
- ✅ Manejo de errores y logging
- ✅ Configuración híbrida desarrollo/producción
- ✅ Solución de problemas CORS

## 🔍 Debugging

Los logs en la consola del navegador muestran:
- 🔐 Endpoint utilizado
- 📤 Datos enviados
- 🌍 Entorno (Desarrollo/Producción)
- 📡 Respuesta del servidor
- ✅/❌ Estado del login

## 🚨 Notas Importantes

1. **CORS**: Solucionado con proxy (desarrollo) y rewrites (producción)
2. **Tokens**: Se guardan automáticamente en localStorage
3. **Roles**: Soporta 'admin' y 'content-admin'
4. **Países**: Configuración automática para todos los países disponibles
