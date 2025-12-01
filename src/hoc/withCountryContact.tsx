// src/hoc/withCountryContact.tsx
import React from "react";
import { contactData, CountryCode } from "../data/countryContacts";
import { CountryContact } from "../components/CountryContact";
import { useCountry } from "../contexts/CountryContext";

export function withCountryContact<P extends IntrinsicAttributes & P>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithContact: React.FC<P> = (props) => {
    const stored = localStorage.getItem("selectedCountry");

    const { selectedCountry } = useCountry();

    const country = selectedCountry?.code as CountryCode | undefined;

    const contactInfo = country ? contactData[country] : null;

    return (
      <div className="flex flex-col min-h-screen">
        {/* Contenido principal */}
        <div className="flex-grow">
          <WrappedComponent {...props} />
        </div>

        {/* Contacto abajo */}
        {country && contactInfo && (
          <CountryContact country={country} contact={contactInfo} />
        )}
      </div>
    );
  };

  return ComponentWithContact;
}
