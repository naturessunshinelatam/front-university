// data/countryContacts.ts
export interface CountryContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  website?: string;
  whatsappLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  youtubeLink?: string;
}

export type CountryCode = "GT" | "SV" | "MX" | "CO" | "PA" | "HN" | "EC" | "DO";

export const contactData: Record<CountryCode, CountryContactInfo> = {
  GT: {
    phone: "2303 7400",
    email: "centrodecontactogt@natr.com",
    address: "...",
    whatsapp: "+50242156311",
    website: "https://gt.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/50242156311",
    facebookLink: "https://www.facebook.com/groups/naturessunshineguatemala/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
  SV: {
    phone: "+503 2263 5897",
    email: "centrodecontactosv@natr.com",
    address: "...",
    whatsapp: "+503 7644 5926",
    website: "https://sv.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/50377480139",
    facebookLink: "https://www.facebook.com/groups/naturessunshineelsalvador/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
  MX: {
    phone: "55 5624 0220",
    email: "centrodecontacto@natr.com",
    address: "...",
    whatsapp: "(52) 55 2095 3620",
    website: "https://mx.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/5520953620",
    facebookLink: "https://www.facebook.com/groups/naturessunshinemexico/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
  CO: {
    phone: "601 794 0398",
    email: "servicio@natr.com",
    address: "...",
    whatsapp: "(57) 322 340 3844",
    website: "https://co.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/573223403844",
    facebookLink: "https://www.facebook.com/groups/naturessunshinecolombia/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
  PA: {
    phone: "(507) 269 2088",
    email: "centrodecontactopa@natr.com",
    address: "...",
    whatsapp: "(507) 6672 3314",
    website: "https://pa.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/50766723314",
    facebookLink: "https://www.facebook.com/groups/naturessunshinepanama/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
  HN: {
    phone: "(504) 2232 1485",
    email: "centrodecontactohn@natr.com",
    address: "...",
    whatsapp: "(504) 8757 1055",
    website: "https://hn.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/50431883952",
    facebookLink: " https://www.facebook.com/groups/naturessunshinehonduras/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
  EC: {
    phone: "(02) 401 2400",
    email: "servicioalclientensp@natr.com",
    address: "...",
    whatsapp: "(59) 399 733 4700",
    website: "https://ec.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/593997334700",
    facebookLink: "https://www.facebook.com/groups/naturessunshineecuador/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
  DO: {
    phone: "849 936 5600",
    email: "nspdominicana@natr.com",
    address: "...",
    whatsapp: "809 802 9483",
    website: "https://do.naturessunshinelatam.com/ecommerce",
    whatsappLink: "https://wa.me/18098029483",
    facebookLink:
      "https://www.facebook.com/groups/naturessunshinerepublicadominicana/",
    tiktokLink: "https://www.tiktok.com/@naturessunshineproducts",
    instagramLink: "https://www.instagram.com/naturessunshine/?hl=en",
    youtubeLink: "https://www.youtube.com/@NaturesSunshineLATAM",
  },
};
