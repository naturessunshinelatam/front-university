import { CountryContactInfo } from "../data/countryContacts";

interface Props {
  country: string;
  contact: CountryContactInfo;
}

export const CountryContact: React.FC<Props> = ({ country, contact }) => {
  const websiteCountries: string[] = ["GT", "MX", "CO", "PA", "EC"];

  return (
    <footer className="w-full bg-[#F3EFE7] text-[#124C45] mt-12 pt-12 pb-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* Columna 1 – Contacto dinámico */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-4">
            Contacto – {country}
          </h3>
          <ul className="space-y-2 text-[#124C45]/90">
            <li>
              <span className="font-semibold text-[#124C45]">Teléfono:</span>{" "}
              {contact.phone}
            </li>
            <li>
              <span className="font-semibold text-[#124C45]">Correo:</span>{" "}
              {contact.email}
            </li>
            <li>
              <span className="font-semibold text-[#124C45]">WhatsApp:</span>{" "}
              <a
                href={contact.whatsappLink}
                target="_blank"
                className="hover:text-[#88C9A1] hover:font-semibold hover:underline"
              >
                {contact.whatsapp}
              </a>
            </li>
            {websiteCountries.includes(country) && (
              <li>
                <span className="font-semibold text-[#124C45]">Website:</span>{" "}
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#88C9A1] hover:font-semibold hover:underline"
                >
                  Visitar sitio
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Columna 2 – Información corporativa */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-4">
            Sobre Nature’s Sunshine
          </h3>
          <p className="text-[#124C45]/90 leading-relaxed">
            Líder global en productos naturales, detox y bienestar desde hace
            más de 50 años. Creamos suplementos con pureza garantizada y
            procesos certificados para mejorar tu salud.
          </p>

          <div className="mt-4">
            <a
              href="https://www.naturessunshine.com/es-US/about-us?epslanguage=es-US"
              className="hover:text-[#88C9A1] font-semibold hover:underline"
              target="_blank"
            >
              Conoce más sobre nosotros →
            </a>
          </div>
        </div>

        {/* Columna 3 – Certificaciones */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-4">
            Producto certificado
          </h3>

          <div className="flex flex-row flex-wrap items-center gap-6">
            <img
              src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/format=webp,quality=90,fit=contain/siteassets/footer/certificates/isocertified.svg"
              alt="ISO Certified"
              className="h-8 md:h-10 object-contain opacity-90 hover:opacity-100 transition"
            />
            <a
              href="https://www.usda.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/width=64,height=auto,format=webp,quality=75,fit=contain/siteassets/footer/certificates/usda.webp"
                alt="USDA Organic"
                className="h-8 md:h-10 object-contain opacity-90 hover:opacity-100 transition"
              />
            </a>
            <a
              href="https://www.nsf.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/format=webp,quality=90,fit=contain/contentassets/931e2af34e42479ca0c47dc3cd20c98f/nsf-logo2025-nsp4.png"
                alt="NSF"
                className="h-8 md:h-10 object-contain opacity-90 hover:opacity-100 transition"
              />
            </a>
            <img
              src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/format=webp,quality=90,fit=contain/siteassets/footer/certificates/kosher.svg"
              alt="Kosher"
              className="h-8 md:h-10 object-contain opacity-90 hover:opacity-100 transition"
            />
            <a
              href="https://www.tga.gov.au/resources/resources/forms/request-certificates-or-certified-copies-tga-licences-and-certificates"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/format=webp,quality=90,fit=contain/siteassets/footer/certificates/tga.svg"
                alt="TGA Certified"
                className="h-8 md:h-10 object-contain opacity-90 hover:opacity-100 transition"
              />
            </a>
            <img
              src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/format=webp,quality=90,fit=contain/siteassets/footer/certificates/halal.svg"
              alt="Halal"
              className="h-8 md:h-10 object-contain opacity-90 hover:opacity-100 transition"
            />
          </div>
        </div>
      </div>

      {/* Fila inferior - Redes Sociales */}
      <div className="mt-12 flex justify-center gap-8">
        <a
          href={contact.instagramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition"
        >
          <img
            // src="https://mcusercontent.com/98c81c00200b439824130a329/images/5019e2f7-e0d1-2bc6-baea-0706872238fc.jpeg"
            src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/width=32,height=auto,format=webp,quality=75,fit=contain/siteassets/footer/social-media/instagram-fill.svg"
            alt="Instagram"
            className="w-8 h-8"
          />
        </a>

        <a
          href={contact.facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition"
        >
          <img
            // src="https://mcusercontent.com/98c81c00200b439824130a329/images/bfc5faf0-a220-7dd2-1ce8-b095e29bc858.jpeg"
            src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/width=32,height=auto,format=webp,quality=75,fit=contain/siteassets/footer/social-media/facebook-fill.svg"
            alt="Facebook"
            className="w-8 h-8"
          />
        </a>

        <a
          href={contact.youtubeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition"
        >
          <img
            // src="https://mcusercontent.com/98c81c00200b439824130a329/images/e60d4305-b05c-62e4-5cf8-8859d5ebee51.jpeg"
            src="https://uscoreprod.naturessunshine.com/cdn-cgi/image/width=32,height=auto,format=webp,quality=75,fit=contain/siteassets/footer/social-media/youtube-fill.svg"
            alt="TikTok"
            className="w-8 h-8"
          />
        </a>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-[#D8D5C9] mt-10 pt-4 text-center text-sm text-[#124C45]/80">
        © {new Date().getFullYear()} Nature’s Sunshine Latam. Todos los derechos
        reservados.
      </div>
    </footer>
  );
};
