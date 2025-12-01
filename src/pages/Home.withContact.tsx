// src/pages/Home.withContact.tsx
import Home from "./Home";
import { withCountryContact } from "../hoc/withCountryContact";

export default withCountryContact(Home);
