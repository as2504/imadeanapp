import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="bg-card border border-border/40 rounded-2xl p-8 sm:p-12 shadow-sm">
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: April 11, 2026 · Version 1.2
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-8
            [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3
            [&_h3]:text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:leading-relaxed [&_p]:text-sm
            [&_li]:text-sm [&_li]:leading-relaxed
            [&_ul]:space-y-1 [&_ul]:pl-4 [&_ul]:list-disc
            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
            [&_strong]:text-foreground">

            <p>
              Welcome to <strong>imadeanapp.com</strong> ("we", "our", "us", or the "Platform"). We are committed to protecting your privacy and being transparent about how we handle your information. This Privacy Policy explains what data we collect, how we use it, and your rights as a user.
            </p>
            <p>
              By using imadeanapp.com, you agree to the practices described in this Privacy Policy.
            </p>

            <h2>1. Information We Collect</h2>
            <p>When you create an account, we collect:</p>
            <ul>
              <li><strong>Email address</strong> (required)</li>
              <li><strong>Username</strong> (required)</li>
            </ul>
            <p>You may also choose to provide additional profile information, including:</p>
            <ul>
              <li>Display name and bio</li>
              <li>Profile image</li>
              <li>Social media links</li>
              <li>Location (optional)</li>
              <li>Professional title and skills</li>
            </ul>
            <p>
              We do <strong>not</strong> actively collect precise location data or sensitive personal data (such as race, religion, health data, or political affiliation).
            </p>

            <h2>2. Authentication & Security</h2>
            <p>
              Authentication on the Platform is handled through secure third-party authentication providers. We support:
            </p>
            <ul>
              <li>Email and password login</li>
              <li>Google OAuth (sign in with Google)</li>
            </ul>
            <p>
              We do not directly store or manage your passwords. Passwords are securely handled by our authentication provider using industry-standard encryption and hashing.
            </p>

            <h2>3. How We Use Your Data</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Enable you to publish apps and maintain your profile</li>
              <li>Provide a personalized discovery feed</li>
              <li>Calculate trending rankings and engagement scores</li>
              <li>Improve the Platform and user experience</li>
              <li>Communicate with you regarding your account (e.g., verification, policy updates)</li>
            </ul>

            <h2>4. Engagement Data</h2>
            <p>We collect and display engagement data related to apps on the Platform, including:</p>
            <ul>
              <li>Number of users who tried an app</li>
              <li>Likes and saves</li>
              <li>Ratings and reviews</li>
              <li>Feedback responses</li>
            </ul>
            <p>
              This engagement data is <strong>publicly visible</strong> on the Platform and is used to determine rankings and trending positions.
            </p>

            <h2>5. Algorithm Transparency</h2>
            <p>
              App rankings on the Platform are determined by engagement signals, including but not limited to:
            </p>
            <ul>
              <li>Likes, saves, and tries</li>
              <li>Ratings and reviews</li>
              <li>Feedback submissions</li>
            </ul>
            <p>
              Rankings are dynamic and may change over time based on time-decay factors and new engagement. We do not guarantee any specific ranking or visibility for any app.
            </p>

            <h2>6. User Content</h2>
            <p>Users may upload or submit the following content to the Platform:</p>
            <ul>
              <li>App icons and screenshot images</li>
              <li>App descriptions (short and full)</li>
              <li>External URLs (website, app store, GitHub, demo videos)</li>
              <li>Reviews and feedback responses</li>
            </ul>
            <p>
              You retain ownership of the content you upload. By submitting content, you grant us a license to display, distribute, and promote it on the Platform as described in our Terms & Conditions.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              We use trusted third-party service providers for authentication, infrastructure, hosting, and data storage. These providers may process your data on our behalf in accordance with their own privacy policies.
            </p>
            <p>
              We do not sell your personal data to any third party.
            </p>

            <h2>8. Data Retention & Deletion</h2>
            <p>
              You may request deletion of your account and associated data by emailing us at{" "}
              <a href="mailto:imadeanapp.contact@gmail.com">imadeanapp.contact@gmail.com</a>.
            </p>
            <ul>
              <li>Account deletion requests will be processed within <strong>4 weeks</strong>.</li>
              <li>You may cancel your deletion request within this period by contacting us.</li>
              <li>After deletion, your account data will be permanently removed. Some anonymized or aggregated data (e.g., engagement counts) may be retained for platform analytics.</li>
            </ul>

            <h2>9. Children's Use</h2>
            <p>
              The Platform is available to users globally. Users under the age of 18 may use the Platform. We do not intentionally collect sensitive personal data from any user, including minors. If you believe a minor's data has been misused, please contact us.
            </p>

            <h2>10. Security</h2>
            <p>
              We use reasonable technical and organizational safeguards to protect your data from unauthorized access, loss, or misuse. However, no system can guarantee complete security. We encourage you to use strong passwords and keep your account credentials secure.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable regulations. Continued use of the Platform after changes are posted constitutes your acceptance of the updated policy.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              For any privacy-related questions, concerns, or requests, please contact us at:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:imadeanapp.contact@gmail.com">imadeanapp.contact@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
