import countries from "i18n-iso-countries";
import es from "i18n-iso-countries/langs/es.json";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(es);
countries.registerLocale(en);

const countryAliases: Record<string, string> = {
  MX: "MX",
  MEXICO: "MX",
  "MEXICO CITY": "MX",
  MEXICOO: "MX",
  MÉXICO: "MX",
  CO: "CO",
  COLOMBIA: "CO",
  EC: "EC",
  ECUADOR: "EC",
  SV: "SV",
  "EL SALVADOR": "SV",
  GT: "GT",
  GUATEMALA: "GT",
  HN: "HN",
  HONDURAS: "HN",
  DO: "DO",
  "DOMINICAN REPUBLIC": "DO",
  "REPUBLICA DOMINICANA": "DO",
  "REPUBLICA DOMINICANA ": "DO",
  "REP. DOMINICANA": "DO",
  PA: "PA",
  PANAMA: "PA",
  PANAMÁ: "PA",
};

type RowValue =
  | string
  | {
      value?: string;
    };

type CountryItem = {
  code?: string;
  totalContent?: number;
  dimension?: string;
  metric?: number;
  dimensions?: string[];
  metrics?: string[];
  dimensionValues?: RowValue[];
  metricValues?: RowValue[];
};

const getCode = (name: string) => {
  if (!name) return undefined;

  const normalized = name.trim();

  // Intentar en español
  let code = countries.getAlpha2Code(normalized, "es");

  if (code !== undefined && code !== null) return code;

  // Fallback a inglés
  code = countries.getAlpha2Code(normalized, "en");

  if (code !== undefined && code !== null) return code;

  return undefined;
};

function normalizeCountryCode(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toUpperCase();
  return countryAliases[normalized] || normalized;
}

type AnalyticsCountryActivityProps = {
  countries?: CountryItem[];
};

export default function AnalyticsCountryActivity({
  countries = [],
}: AnalyticsCountryActivityProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Actividad por País
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {countries.map((country, idx) => {
          const code =
            getCode(country.dimension?.[0] || "") ||
            normalizeCountryCode(country.dimension?.[0] || "");
          const name = country.dimension?.[0];
          const event = country.metric ? country.metric : country.totalContent;
          return (
            <div
              key={`${idx}`}
              className="p-4 border border-gray-100 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">{code || "🌎"}</span>
                <span className="font-medium text-sm">
                  {name || "Sin país"}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#124C45]">{event}</div>
              <div className="text-xs text-gray-500">eventos por país</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
