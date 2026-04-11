import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const TermsAndConditions = () => {
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
              Terms & Conditions
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
              Welcome to <strong>imadeanapp.com</strong> (the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree, please do not use the Platform.
            </p>

            <h2>1. Platform Overview</h2>
            <p>
              imadeanapp.com is a community-driven app discovery and publishing platform. Users can showcase their apps, explore apps built by others, and engage through ratings, reviews, and feedback.
            </p>

            <h2>2. User Accounts</h2>
            <ul>
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account and all activities that occur under it.</li>
              <li>Account creation requires acceptance of these Terms and our Privacy Policy via a mandatory consent checkbox during signup.</li>
              <li>You must notify us immediately if you suspect unauthorized access to your account.</li>
            </ul>

            <h2>3. User Content</h2>
            <p>
              You retain ownership of all content you submit to the Platform, including but not limited to apps, images, descriptions, links, reviews, and feedback.
            </p>
            <p>
              By submitting content, you grant imadeanapp.com a worldwide, non-exclusive, royalty-free license to:
            </p>
            <ul>
              <li>Display your content on the Platform</li>
              <li>Distribute and make it accessible to other users</li>
              <li>Promote your content in connection with the Platform (e.g., featured sections, social media)</li>
            </ul>
            <p>
              This license continues for as long as your content remains on the Platform and terminates when you delete it or your account is removed.
            </p>

            <h2>4. Content Rules</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Post illegal, harmful, threatening, abusive, or discriminatory content</li>
              <li>Upload malware, viruses, or any malicious code</li>
              <li>Spam or artificially manipulate engagement metrics (likes, ratings, reviews)</li>
              <li>Impersonate another person or entity</li>
              <li>Post content that infringes on the intellectual property rights of others</li>
            </ul>
            <p>
              We reserve the right to remove any content that violates these rules without prior notice.
            </p>

            <h2>5. Reviews & Engagement</h2>
            <ul>
              <li>All reviews, ratings, and feedback must be genuine and based on actual experience.</li>
              <li>Fake, duplicate, or incentivized reviews may be removed at our discretion.</li>
              <li>We reserve the right to moderate, edit, or remove any engagement content that violates our guidelines.</li>
            </ul>

            <h2>6. Ranking Disclaimer</h2>
            <p>
              App rankings on the Platform are based on engagement signals including likes, saves, ratings, reviews, feedback, and time-decay factors. Rankings are dynamic and may change at any time.
            </p>
            <p>
              We do not guarantee any specific ranking position or level of visibility for any app. The ranking algorithm may be updated or modified without prior notice.
            </p>

            <h2>7. External Links</h2>
            <p>
              The Platform may contain links to third-party websites, apps, or services. We are not responsible for the content, availability, privacy practices, or functionality of any external sites or services. Access to external links is at your own risk.
            </p>

            <h2>8. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or engaged in behavior that is harmful to the Platform, its users, or its reputation.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              The Platform is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis. To the fullest extent permitted by law, imadeanapp.com shall not be liable for:
            </p>
            <ul>
              <li>Any user-generated content on the Platform</li>
              <li>The functionality, safety, or accuracy of third-party apps or websites linked from the Platform</li>
              <li>Any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform</li>
              <li>Loss of data, revenue, or profits</li>
            </ul>

            <h2>10. Account Deletion</h2>
            <p>
              You may request deletion of your account and associated data by emailing{" "}
              <a href="mailto:imadeanapp.contact@gmail.com">imadeanapp.contact@gmail.com</a>.
            </p>
            <ul>
              <li>Deletion requests will be processed within <strong>4 weeks</strong>.</li>
              <li>You may cancel your deletion request during this period by contacting us.</li>
              <li>After deletion, your account data will be permanently removed. Some anonymized data may be retained for analytics purposes.</li>
            </ul>

            <h2>11. Intellectual Property</h2>
            <p>
              The Platform, including its design, branding, logo, features, and code, is the intellectual property of imadeanapp.com. You may not copy, reproduce, distribute, modify, or create derivative works based on the Platform without our prior written consent.
            </p>

            <h2>12. No API / No Scraping</h2>
            <p>
              Unauthorized scraping, crawling, or automated access to the Platform is strictly prohibited. You may not use bots, scripts, or other automated tools to extract data from the Platform without our explicit written permission.
            </p>

            <h2>13. Updates to These Terms</h2>
            <p>
              We may update these Terms from time to time. Changes will be effective upon posting to the Platform. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms.
            </p>

            <h2>14. Contact Us</h2>
            <p>
              For any questions or concerns about these Terms, please contact us at:
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

export default TermsAndConditions;
