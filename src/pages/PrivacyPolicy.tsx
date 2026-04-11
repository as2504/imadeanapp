import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  {
    id: "1",
    title: "1. Information We Collect",
    content: (
      <>
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
        <p>We do <strong>not</strong> actively collect precise location data or sensitive personal data (such as race, religion, health data, or political affiliation).</p>
      </>
    ),
  },
  {
    id: "2",
    title: "2. Authentication & Security",
    content: (
      <>
        <p>Authentication on the Platform is handled through secure third-party authentication providers. We support:</p>
        <ul>
          <li>Email and password login</li>
          <li>Google OAuth (sign in with Google)</li>
        </ul>
        <p>We do not directly store or manage your passwords. Passwords are securely handled by our authentication provider using industry-standard encryption and hashing.</p>
      </>
    ),
  },
  {
    id: "3",
    title: "3. How We Use Your Data",
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create and manage your account</li>
          <li>Enable you to publish apps and maintain your profile</li>
          <li>Provide a personalized discovery feed</li>
          <li>Calculate trending rankings and engagement scores</li>
          <li>Improve the Platform and user experience</li>
          <li>Communicate with you regarding your account (e.g., verification, policy updates)</li>
        </ul>
      </>
    ),
  },
  {
    id: "4",
    title: "4. Engagement Data",
    content: (
      <>
        <p>We collect and display engagement data related to apps on the Platform, including:</p>
        <ul>
          <li>Number of users who tried an app</li>
          <li>Likes and saves</li>
          <li>Ratings and reviews</li>
          <li>Feedback responses</li>
        </ul>
        <p>This engagement data is <strong>publicly visible</strong> on the Platform and is used to determine rankings and trending positions.</p>
      </>
    ),
  },
  {
    id: "5",
    title: "5. Algorithm Transparency",
    content: (
      <>
        <p>App rankings on the Platform are determined by engagement signals, including but not limited to:</p>
        <ul>
          <li>Likes, saves, and tries</li>
          <li>Ratings and reviews</li>
          <li>Feedback submissions</li>
        </ul>
        <p>Rankings are dynamic and may change over time based on time-decay factors and new engagement. We do not guarantee any specific ranking or visibility for any app.</p>
      </>
    ),
  },
  {
    id: "6",
    title: "6. User Content",
    content: (
      <>
        <p>Users may upload or submit the following content to the Platform:</p>
        <ul>
          <li>App icons and screenshot images</li>
          <li>App descriptions (short and full)</li>
          <li>External URLs (website, app store, GitHub, demo videos)</li>
          <li>Reviews and feedback responses</li>
        </ul>
        <p>You retain ownership of the content you upload. By submitting content, you grant us a license to display, distribute, and promote it on the Platform as described in our Terms & Conditions.</p>
      </>
    ),
  },
  {
    id: "7",
    title: "7. Third-Party Services",
    content: (
      <>
        <p>We use trusted third-party service providers for authentication, infrastructure, hosting, and data storage. These providers may process your data on our behalf in accordance with their own privacy policies.</p>
        <p>We do not sell your personal data to any third party.</p>
      </>
    ),
  },
  {
    id: "8",
    title: "8. Data Retention & Deletion",
    content: (
      <>
        <p>You may request deletion of your account and associated data by emailing us at{" "}<a href="mailto:imadeanapp.contact@gmail.com">imadeanapp.contact@gmail.com</a>.</p>
        <ul>
          <li>Account deletion requests will be processed within <strong>4 weeks</strong>.</li>
          <li>You may cancel your deletion request within this period by contacting us.</li>
          <li>After deletion, your account data will be permanently removed. Some anonymized or aggregated data (e.g., engagement counts) may be retained for platform analytics.</li>
        </ul>
      </>
    ),
  },
  {
    id: "9",
    title: "9. Children's Use",
    content: (
      <p>The Platform is available to users globally. Users under the age of 18 may use the Platform. We do not intentionally collect sensitive personal data from any user, including minors. If you believe a minor's data has been misused, please contact us.</p>
    ),
  },
  {
    id: "10",
    title: "10. Security",
    content: (
      <p>We use reasonable technical and organizational safeguards to protect your data from unauthorized access, loss, or misuse. However, no system can guarantee complete security. We encourage you to use strong passwords and keep your account credentials secure.</p>
    ),
  },
  {
    id: "11",
    title: "11. Changes to This Policy",
    content: (
      <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable regulations. Continued use of the Platform after changes are posted constitutes your acceptance of the updated policy.</p>
    ),
  },
  {
    id: "12",
    title: "12. Contact Us",
    content: (
      <>
        <p>For any privacy-related questions, concerns, or requests, please contact us at:</p>
        <p><strong>Email:</strong>{" "}<a href="mailto:imadeanapp.contact@gmail.com">imadeanapp.contact@gmail.com</a></p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [showBack, setShowBack] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setShowBack(true);
      } else if (currentY < lastScrollY.current) {
        setShowBack(true);
      } else {
        setShowBack(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Floating back button */}
      <button
        onClick={() => navigate(-1)}
        className={`fixed top-4 left-4 z-50 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground bg-card/90 backdrop-blur-sm border border-border/40 rounded-full px-3 py-1.5 shadow-sm transition-all duration-300 ${
          showBack ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        <div className="bg-card border border-border/40 rounded-2xl p-8 sm:p-12 shadow-sm">
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: April 11, 2026 · Version 1.2
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed text-justify mb-8">
            Welcome to <strong className="text-foreground">imadeanapp.com</strong> ("we", "our", "us", or the "Platform"). We are committed to protecting your privacy and being transparent about how we handle your information. This Privacy Policy explains what data we collect, how we use it, and your rights as a user. By using imadeanapp.com, you agree to the practices described in this Privacy Policy.
          </p>

          <Accordion type="multiple" className="space-y-2">
            {sections.map((s) => (
              <AccordionItem key={s.id} value={s.id} className="border border-border/30 rounded-xl px-4 overflow-hidden">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline py-3">
                  {s.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed text-justify pb-4 [&_ul]:space-y-1 [&_ul]:pl-4 [&_ul]:list-disc [&_li]:text-sm [&_li]:leading-relaxed [&_p]:mb-2 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-foreground">
                  {s.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
