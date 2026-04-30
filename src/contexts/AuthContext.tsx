import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import SessionExpiredModal from "../components/SessionExpiredModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "ContentManager";
  roles: string[];
  countries: string[];
  accesibleCategories: string[];
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Configuration - Usar proxy en desarrollo y producción
const API_BASE_URL = "/api/proxy";

// Función para decodificar JWT sin verificar la firma (solo para leer el payload)
function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Token JWT inválido");
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return decoded;
  } catch (error) {
    console.error("Error decodificando JWT:", error);
    return null;
  }
}

// Función para verificar si el token ha expirado
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Si no se puede decodificar o no tiene exp, considerarlo expirado
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

// Función para obtener el tiempo restante hasta la expiración (en milisegundos)
function getTimeUntilExpiration(token: string): number {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExp = (decoded.exp - currentTime) * 1000; // Convertir a milisegundos
  return Math.max(0, timeUntilExp);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const tokenCheckIntervalRef = useRef<number | null>(null);
  const logoutTimeoutRef = useRef<number | null>(null);

  // Función para limpiar timers
  const clearTimers = () => {
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  // Función para mostrar modal de sesión expirada
  const showSessionExpired = () => {
    console.log("🚨 Token expirado - mostrando modal de sesión expirada");
    setShowSessionExpiredModal(true);
  };

  // Función para manejar confirmación del modal
  const handleSessionExpiredConfirm = () => {
    setShowSessionExpiredModal(false);
    logout();
  };

  // Función para configurar el logout automático
  const setupAutoLogout = (token: string) => {
    clearTimers();

    const timeUntilExpiration = getTimeUntilExpiration(token);
    console.log(
      "⏰ Token expira en:",
      Math.floor(timeUntilExpiration / 1000 / 60),
      "minutos",
    );

    if (timeUntilExpiration > 0) {
      // Configurar logout automático 30 segundos antes de la expiración
      const logoutTime = Math.max(0, timeUntilExpiration - 30000);

      logoutTimeoutRef.current = setTimeout(() => {
        showSessionExpired();
      }, logoutTime);

      // Verificar el token cada 5 minutos
      tokenCheckIntervalRef.current = setInterval(
        () => {
          const currentToken = localStorage.getItem("authToken");
          if (!currentToken || isTokenExpired(currentToken)) {
            console.log(
              "🚨 Token expirado detectado en verificación periódica",
            );
            showSessionExpired();
          }
        },
        5 * 60 * 1000,
      ); // 5 minutos
    } else {
      // Token ya expirado
      console.log("🚨 Token ya expirado - cerrando sesión inmediatamente");
      showSessionExpired();
    }
  };

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      try {
        // Verificar si el token ha expirado
        if (isTokenExpired(storedToken)) {
          console.log("🚨 Token almacenado ha expirado - limpiando sesión");
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
        } else {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setupAutoLogout(storedToken);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);

    // Cleanup al desmontar el componente
    return () => {
      clearTimers();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      console.log("🔐 Iniciando login...");
      console.log("📍 Endpoint:", `${API_BASE_URL}/Auth/login`);

      // Paso 1: Login para obtener token
      const loginResponse = await fetch(`${API_BASE_URL}?path=Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        console.error("❌ Login falló:", loginResponse.status);
        setIsLoading(false);
        return false;
      }

      const loginData = await loginResponse.json();
      // console.log('✅ Login exitoso');
      // console.log('📋 Respuesta completa:', JSON.stringify(loginData, null, 2));
      // console.log('📋 Tipo de respuesta:', Array.isArray(loginData) ? 'Array' : 'Object');

      // Paso 2: Extraer token - análisis detallado de la estructura
      let accessToken: string | null = null;

      // Buscar token en la estructura real de la API
      if (loginData.data?.acces_token) {
        // La API tiene un typo: "acces_token" en lugar de "access_token"
        accessToken = loginData.data.acces_token;
        console.log("🔑 Token encontrado en data.acces_token (typo de la API)");
      } else if (loginData.data?.access_token) {
        accessToken = loginData.data.access_token;
        console.log("🔑 Token encontrado en data.access_token");
      } else if (loginData.access_token) {
        accessToken = loginData.access_token;
        console.log("🔑 Token encontrado en access_token");
      } else if (loginData.token) {
        accessToken = loginData.token;
        console.log("🔑 Token encontrado en token");
      }

      if (!accessToken) {
        console.error("❌ No se pudo extraer el token");
        console.error("📋 Estructura completa analizada sin éxito");
        setIsLoading(false);
        return false;
      }

      // console.log(
      //   "🔑 Token extraído exitosamente:",
      //   accessToken.substring(0, 50) + "...",
      // );
      localStorage.setItem("authToken", accessToken);

      // Paso 3: Obtener lista de usuarios
      console.log("👥 Obteniendo usuarios...");
      const usersResponse = await fetch(`${API_BASE_URL}?path=User`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!usersResponse.ok) {
        console.error("❌ Error obteniendo usuarios:", usersResponse.status);
        const errorText = await usersResponse.text();
        console.error("❌ Detalles del error:", errorText);
        localStorage.removeItem("authToken");
        setIsLoading(false);
        return false;
      }

      const users = await usersResponse.json();
      console.log("✅ Usuarios obtenidos:", users.length, "usuarios");

      // Paso 4: Encontrar usuario actual
      interface ApiUser {
        id?: string;
        email: string;
        usernames?: string;
        name?: string;
        roles: string[];
        countries?: string[];
        accesibleCategories?: string[];
        isActive?: boolean;
      }

      const currentUser = users.find((u: ApiUser) => u.email === email);
      if (!currentUser) {
        console.error("❌ Usuario no encontrado en la lista");
        console.error("📧 Email buscado:", email);
        console.error(
          "📧 Emails disponibles:",
          users.map((u: ApiUser) => u.email),
        );
        localStorage.removeItem("authToken");
        setIsLoading(false);
        return false;
      }

      console.log(
        "👤 Usuario encontrado:",
        currentUser.usernames || currentUser.email,
      );
      console.log("🎭 Roles del usuario:", currentUser.roles);

      // Paso 5: Validar roles
      const userRoles = currentUser.roles || [];
      const hasAdminRole = userRoles.includes("Admin");
      const hasContentManagerRole = userRoles.includes("ContentManager");

      if (!hasAdminRole && !hasContentManagerRole) {
        console.error("❌ Usuario sin roles válidos");
        console.error("🎭 Roles actuales:", userRoles);
        console.error("✅ Roles requeridos: Admin o ContentManager");
        localStorage.removeItem("authToken");
        setIsLoading(false);
        return false;
      }

      // Paso 6: Crear sesión de usuario
      const userRole: "Admin" | "ContentManager" = hasAdminRole
        ? "Admin"
        : "ContentManager";
      const validRoles = userRoles.filter(
        (role: string) => role === "Admin" || role === "ContentManager",
      );

      const loggedUser: User = {
        id: currentUser.id || Date.now().toString(),
        name: currentUser.usernames || currentUser.name || email.split("@")[0],
        email: currentUser.email || email,
        role: userRole,
        roles: validRoles,
        countries: currentUser.countries || [
          "MX",
          "CO",
          "EC",
          "SV",
          "GT",
          "HN",
          "DO",
          "PA",
        ],
        accesibleCategories: currentUser.accesibleCategories || [
          "Productos",
          "Compañía",
        ],
        isActive: currentUser.isActive !== false,
      };

      setUser(loggedUser);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      // Configurar logout automático con el token
      setupAutoLogout(accessToken);

      console.log("🎉 Login completado exitosamente");
      console.log("👤 Usuario logueado:", loggedUser.name);
      console.log("🎭 Rol asignado:", loggedUser.role);

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("🚨 Error durante el login:", error);
      localStorage.removeItem("authToken");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    clearTimers(); // Limpiar timers al hacer logout
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    console.log("👋 Usuario deslogueado");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
      <SessionExpiredModal
        isOpen={showSessionExpiredModal}
        onConfirm={handleSessionExpiredConfirm}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
