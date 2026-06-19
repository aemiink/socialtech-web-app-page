import { Controller, Get, Header } from "@nestjs/common";

const PRIVACY_POLICY_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Social Tech Privacy Policy</title>
    <meta
      name="description"
      content="Privacy Policy for Social Tech and the SocialTech Advertisement Meta application."
    />
    <style>
      :root {
        color-scheme: light;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
        background: #f7f8f5;
        color: #181a1b;
      }

      body {
        margin: 0;
        line-height: 1.65;
      }

      main {
        max-width: 880px;
        margin: 0 auto;
        padding: 48px 24px 72px;
      }

      header {
        border-bottom: 1px solid #dfe4d7;
        margin-bottom: 32px;
        padding-bottom: 24px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: clamp(2rem, 5vw, 3.25rem);
        line-height: 1.08;
      }

      h2 {
        margin: 32px 0 8px;
        font-size: 1.35rem;
        line-height: 1.25;
      }

      p,
      li {
        color: #3a3f40;
      }

      a {
        color: #275d21;
      }

      .meta {
        color: #68706a;
        font-size: 0.95rem;
      }

      .notice {
        border: 1px solid #dfe4d7;
        background: #ffffff;
        border-radius: 8px;
        padding: 16px;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Privacy Policy</h1>
        <p class="meta">Last updated: June 18, 2026</p>
      </header>

      <section class="notice">
        <p>
          This Privacy Policy explains how Social Tech collects, uses, stores, and protects
          information when providing digital growth, social media management, advertising,
          reporting, and client visibility services, including through the SocialTech
          Advertisement Meta application.
        </p>
      </section>

      <section>
        <h2>1. Who we are</h2>
        <p>
          Social Tech is a digital growth agency that provides social media, advertising,
          creative, reporting, automation, and client-facing software services. This policy
          applies to our websites, client/admin panels, integrations, and Meta platform
          connections used to deliver those services.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <p>
          Depending on the service and permissions granted, we may collect or process the
          following categories of information:
        </p>
        <ul>
          <li>Contact and account information provided by clients or authorized users.</li>
          <li>Client profile, project, task, approval, report, and service configuration data.</li>
          <li>
            Meta platform identifiers and metadata, such as Facebook Page IDs, Instagram
            Business Account IDs, usernames, Page names, granted permission scopes, and
            connection status.
          </li>
          <li>
            Social media operational data needed to provide services, such as content plans,
            captions, post status, publishing references, comments, messages, mentions,
            insights, or webhook events when the relevant Meta permissions are granted.
          </li>
          <li>
            Technical information such as IP address, request metadata, device/browser data,
            authentication events, logs, and error diagnostics.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>We use information to:</p>
        <ul>
          <li>Configure and operate client social media and advertising services.</li>
          <li>Connect authorized Facebook Pages and Instagram Business accounts.</li>
          <li>Create, review, schedule, publish, monitor, and report on client content.</li>
          <li>Respond to client requests, approvals, revisions, comments, or messages.</li>
          <li>Maintain security, prevent misuse, troubleshoot integrations, and improve our services.</li>
          <li>Comply with legal, contractual, platform, and operational obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. Meta platform data</h2>
        <p>
          When a user authorizes our Meta application, we only request permissions that are
          necessary for the selected service. Meta data is used to manage the client's own
          social media presence, provide reporting, and support approved agency workflows.
          We do not sell Meta platform data.
        </p>
      </section>

      <section>
        <h2>5. Sharing information</h2>
        <p>
          We may share information with authorized Social Tech team members, the client that
          owns the related service, service providers that host or secure our systems, and
          platforms such as Meta when required for the integration to function. We may also
          disclose information when required by law or to protect our rights, users, clients,
          or systems.
        </p>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          We keep information only for as long as necessary to provide services, maintain
          records, resolve issues, comply with legal obligations, or protect our legitimate
          business interests. When data is no longer needed, we delete it or anonymize it
          where reasonably possible.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We use administrative, technical, and organizational safeguards designed to protect
          information against unauthorized access, loss, misuse, alteration, or disclosure.
          No internet-based service can be guaranteed to be completely secure, but we work to
          keep our systems and integrations protected.
        </p>
      </section>

      <section>
        <h2>8. Your choices and deletion requests</h2>
        <p>
          Authorized users may revoke Meta permissions through their Facebook or Instagram
          account settings or Business Integrations settings. Clients and authorized users may
          request access, correction, export, or deletion of personal information by contacting
          us. We will respond in accordance with applicable law and platform requirements.
        </p>
      </section>

      <section>
        <h2>9. International processing</h2>
        <p>
          Information may be processed in countries other than the country where it was
          originally collected. Where required, we use appropriate safeguards for such
          transfers.
        </p>
      </section>

      <section>
        <h2>10. Children's privacy</h2>
        <p>
          Our services are not directed to children and are intended for business use. We do
          not knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>11. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The latest version will be
          published on this page with an updated date.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          For privacy questions or data requests, contact Social Tech at
          <a href="mailto:privacy@socialtechmda.com">privacy@socialtechmda.com</a>.
        </p>
      </section>
    </main>
  </body>
</html>`;

@Controller("legal")
export class PublicLegalController {
  @Get("privacy-policy")
  @Header("Content-Type", "text/html; charset=utf-8")
  getPrivacyPolicy(): string {
    return PRIVACY_POLICY_HTML;
  }
}
