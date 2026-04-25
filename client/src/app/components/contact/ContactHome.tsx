import AfterMeet from "./sections/AfterMeet";
import ContactSelection from "./sections/ContactSelection";
import Cta from "./sections/Cta";
import FormSection from "./sections/FormSection";
import HeroSection from "./sections/HeroSection";

export default function ContactHome() {
  return (
    <>
      <HeroSection />
      <ContactSelection />
      <FormSection />
      <AfterMeet />
      <Cta />
    </>
  );
}
