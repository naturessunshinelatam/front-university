import React, { createContext, useContext, useState, useEffect } from "react";
import { GEO_IP_API } from "../config";

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryContextType {
  selectedCountry: Country;
  detectedCountry: Country;
  availableCountries: Country[];
  setSelectedCountry: (country: Country) => void;
  showCountryAlert: boolean;
  dismissCountryAlert: () => void;
  // Nuevos estados para políticas de privacidad
  showPrivacyModal: boolean;
  acceptPrivacyPolicy: () => void;
  rejectPrivacyPolicy: () => void;
  hasAcceptedPrivacyPolicy: (countryCode: string) => boolean;
  requiresPrivacyPolicy: (countryCode: string) => boolean;
  // Nuevos estados para países no soportados
  showUnsupportedCountryModal: boolean;
  isCountrySupported: boolean;
  selectCountryFromModal: (country: Country) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

// Países soportados (8 países)
const COUNTRIES: Country[] = [
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
];

// Países que requieren aceptación de políticas de privacidad
// COMENTADO: Políticas de privacidad deshabilitadas temporalmente
// const PRIVACY_REQUIRED_COUNTRIES = ['EC', 'CO', 'MX'];
const PRIVACY_REQUIRED_COUNTRIES: string[] = []; // Array vacío = ningún país requiere políticas

// País fallback cuando se rechazan políticas
const FALLBACK_COUNTRY = COUNTRIES.find((c) => c.code === "PA") || COUNTRIES[0];

/**
 * Detecta el país del usuario usando ipapi.co
 */
const detectCountry = async (): Promise<Country> => {
  try {
    console.log("🌍 Detectando país del usuario...");
    const response = await fetch(GEO_IP_API);
    const data = await response.json();

    const countryCode = data.country;
    console.log("📍 País detectado:", countryCode);

    // Buscar el país en nuestra lista de países soportados
    const detectedCountry = COUNTRIES.find((c) => c.code === countryCode);

    if (detectedCountry) {
      console.log("✅ País soportado:", detectedCountry.name);
      return detectedCountry;
    } else {
      console.log("⚠️ País no soportado:", countryCode);
      // Retornar un objeto especial para países no soportados
      return {
        code: countryCode,
        name: data.country_name || "País no soportado",
        flag: "🌎",
      };
    }
  } catch (error) {
    console.error("❌ Error al detectar país:", error);
    // En caso de error, retornar México como default
    return COUNTRIES[0];
  }
};

/**
 * Verifica si un país está en la lista de países soportados
 */
const isCountrySupportedFn = (countryCode: string): boolean => {
  return COUNTRIES.some((c) => c.code === countryCode);
};

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<Country>(
    COUNTRIES[0]
  );
  const [detectedCountry, setDetectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryAlert, setShowCountryAlert] = useState(false);

  // Estados para políticas de privacidad
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [acceptedPrivacyPolicies, setAcceptedPrivacyPolicies] = useState<{
    [key: string]: boolean;
  }>({});

  // Estados para países no soportados
  const [showUnsupportedCountryModal, setShowUnsupportedCountryModal] =
    useState(false);
  const [isCountrySupported, setIsCountrySupported] = useState(true);

  /**
   * Inicialización: Detectar país y cargar políticas aceptadas
   */
  useEffect(() => {
    const initializeCountry = async () => {
      // Cargar políticas aceptadas desde localStorage PRIMERO
      const storedPolicies = localStorage.getItem("acceptedPrivacyPolicies");
      let loadedPolicies: { [key: string]: boolean } = {};

      if (storedPolicies) {
        try {
          loadedPolicies = JSON.parse(storedPolicies);
          setAcceptedPrivacyPolicies(loadedPolicies);
          console.log("📋 Políticas cargadas:", loadedPolicies);
        } catch (error) {
          console.error("Error parsing privacy policies:", error);
        }
      }

      // Detectar país del usuario
      const detected = await detectCountry();
      setDetectedCountry(detected);

      // Verificar si el país está soportado
      const supported = isCountrySupportedFn(detected.code);
      setIsCountrySupported(supported);

      // Cargar país seleccionado previamente
      const stored = localStorage.getItem("selectedCountry");

      if (!supported) {
        // País no soportado - Mostrar modal de selección
        console.log("⚠️ País no soportado, mostrando modal de selección");
        setShowUnsupportedCountryModal(true);
        // Usar país almacenado si existe, sino usar México como default
        if (stored) {
          try {
            const parsedCountry = JSON.parse(stored);
            setSelectedCountryState(parsedCountry);
          } catch {
            setSelectedCountryState(COUNTRIES[0]);
          }
        } else {
          setSelectedCountryState(COUNTRIES[0]);
        }
      } else {
        // País soportado
        if (stored) {
          try {
            const parsedCountry = JSON.parse(stored);
            setSelectedCountryState(parsedCountry);

            // Verificar si necesita aceptar políticas usando loadedPolicies
            if (PRIVACY_REQUIRED_COUNTRIES.includes(parsedCountry.code)) {
              const hasAccepted = loadedPolicies[parsedCountry.code];
              if (!hasAccepted) {
                console.log(
                  "📋 Mostrando modal de políticas para:",
                  parsedCountry.code
                );
                setShowPrivacyModal(true);
              }
            }

            // Mostrar alerta si el país detectado es diferente
            if (parsedCountry.code !== detected.code) {
              setShowCountryAlert(true);
            }
          } catch {
            setSelectedCountryState(detected);
            // Verificar políticas para país detectado usando loadedPolicies
            if (PRIVACY_REQUIRED_COUNTRIES.includes(detected.code)) {
              const hasAccepted = loadedPolicies[detected.code];
              if (!hasAccepted) {
                console.log(
                  "📋 Mostrando modal de políticas para:",
                  detected.code
                );
                setShowPrivacyModal(true);
              }
            }
          }
        } else {
          // Primera vez - usar país detectado
          setSelectedCountryState(detected);
          localStorage.setItem("selectedCountry", JSON.stringify(detected));
          // Verificar políticas usando loadedPolicies
          if (PRIVACY_REQUIRED_COUNTRIES.includes(detected.code)) {
            const hasAccepted = loadedPolicies[detected.code];
            if (!hasAccepted) {
              console.log(
                "📋 Mostrando modal de políticas para:",
                detected.code
              );
              setShowPrivacyModal(true);
            }
          }
        }
      }
    };

    initializeCountry();
  }, []);

  /**
   * Verifica si un país requiere aceptación de políticas
   */
  const checkPrivacyPolicy = (countryCode: string) => {
    if (PRIVACY_REQUIRED_COUNTRIES.includes(countryCode)) {
      // Leer directamente de localStorage para tener el valor más actualizado
      const storedPolicies = localStorage.getItem("acceptedPrivacyPolicies");
      let loadedPolicies: { [key: string]: boolean } = {};

      if (storedPolicies) {
        try {
          loadedPolicies = JSON.parse(storedPolicies);
        } catch (error) {
          console.error("Error parsing privacy policies:", error);
        }
      }

      const hasAccepted = loadedPolicies[countryCode];
      if (!hasAccepted) {
        console.log("📋 Mostrando modal de políticas para:", countryCode);
        setShowPrivacyModal(true);
      }
    }
  };

  /**
   * Cambia el país seleccionado
   */
  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country);
    localStorage.setItem("selectedCountry", JSON.stringify(country));
    setShowCountryAlert(false);

    // Verificar si el nuevo país requiere políticas
    checkPrivacyPolicy(country.code);
  };

  /**
   * Selecciona un país desde el modal de países no soportados
   */
  const selectCountryFromModal = (country: Country) => {
    setSelectedCountryState(country);
    localStorage.setItem("selectedCountry", JSON.stringify(country));
    setShowUnsupportedCountryModal(false);

    // Verificar si el país seleccionado requiere políticas
    checkPrivacyPolicy(country.code);
  };

  /**
   * Acepta las políticas de privacidad del país actual
   */
  const acceptPrivacyPolicy = () => {
    const updatedPolicies = {
      ...acceptedPrivacyPolicies,
      [selectedCountry.code]: true,
    };
    setAcceptedPrivacyPolicies(updatedPolicies);
    localStorage.setItem(
      "acceptedPrivacyPolicies",
      JSON.stringify(updatedPolicies)
    );
    setShowPrivacyModal(false);
    console.log("✅ Políticas aceptadas para:", selectedCountry.code);
  };

  /**
   * Rechaza las políticas de privacidad y redirige a país fallback
   */
  const rejectPrivacyPolicy = () => {
    console.log("❌ Políticas rechazadas para:", selectedCountry.code);
    setShowPrivacyModal(false);

    // Redirigir a país fallback (Panamá)
    setSelectedCountryState(FALLBACK_COUNTRY);
    localStorage.setItem("selectedCountry", JSON.stringify(FALLBACK_COUNTRY));

    // Mostrar notificación (se manejará en el componente del modal)
  };

  /**
   * Verifica si un país ya tiene políticas aceptadas
   */
  const hasAcceptedPrivacyPolicy = (countryCode: string): boolean => {
    return acceptedPrivacyPolicies[countryCode] === true;
  };

  /**
   * Verifica si un país requiere aceptación de políticas
   */
  const requiresPrivacyPolicy = (countryCode: string): boolean => {
    return PRIVACY_REQUIRED_COUNTRIES.includes(countryCode);
  };

  const dismissCountryAlert = () => {
    setShowCountryAlert(false);
  };

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        detectedCountry,
        availableCountries: COUNTRIES,
        setSelectedCountry,
        showCountryAlert,
        dismissCountryAlert,
        showPrivacyModal,
        acceptPrivacyPolicy,
        rejectPrivacyPolicy,
        hasAcceptedPrivacyPolicy,
        requiresPrivacyPolicy,
        showUnsupportedCountryModal,
        isCountrySupported,
        selectCountryFromModal,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
}
