import WebDesignServices from "../../imports/SocialTechModernDigitalAgencyWebDesignServicesPage";
import PageWrapper from "../components/PageWrapper";

export default function WebDesignServicesPage() {
  return (
    <PageWrapper>
      <div onClick={(e) => {
        const target = e.target as HTMLElement;

        if (target.textContent === "Hizmetlerimiz") {
          e.preventDefault();
          window.location.href = "/hizmetler";
        } else if (target.textContent === "Çalışmalarımız") {
          e.preventDefault();
          window.location.href = "/calismalar";
        } else if (target.textContent === "Hakkımızda") {
          e.preventDefault();
          window.location.href = "/hakkimizda";
        } else if (target.textContent === "Anasayfa") {
          e.preventDefault();
          window.location.href = "/";
        }
      }}>
        <WebDesignServices />
      </div>
    </PageWrapper>
  );
}
