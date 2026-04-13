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
    title: "1. Platform Overview",
    content: (
      <p>imadeanapp.com is a community-driven app discovery and publishing platform. Users can showcase their apps, explore apps built by others, and engage through ratings, reviews, and feedback.</p>
    ),
  },
  {
    id: "2",
    title: "2. User Accounts",
    content: (
      <ul>
        <li>You must provide accurate and complete information when creating an account.</li>
        <li>You are responsible for maintaining the security of your account and all activities that occur under it.</li>
        <li>Account creation requires acceptance of these Terms and our Privacy Policy via a mandatory consent checkbox during signup.</li>
        <li>You must notify us immediately if you suspect unauthorized access to your account.</li>
      </ul>
    ),
  },
  {
    id: "3",
    title: "3. User Content",
    content: (
      <>
        <p>You retain ownership of all content you submit to the Platform, including but not limited to apps, images, descriptions, links, reviews, and feedback.</p>
        <p>By submitting content, you grant imadeanapp.com a worldwide, non-exclusive, royalty-free license to:</p>
        <ul>
          <li>Display your content on the Platform</li>
          <li>Distribute and make it accessible to other users</li>
          <li>Promote your content in connection with the Platform (e.g., featured sections, social media)</li>
        </ul>
        <p>This license continues for as long as your content remains on the Platform and terminates when you delete it or your account is removed.</p>
      </>
    ),
  },
  {
    id: "4",
    title: "4. Content Rules",
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Post illegal, harmful, threatening, abusive, or discriminatory content</li>
          <li>Upload malware, viruses, or any malicious code</li>
          <li>Spam or artificially manipulate engagement metrics (likes, ratings, reviews)</li>
          <li>Impersonate another person or entity</li>
          <li>Post content that infringes on the intellectual property rights of others</li>
        </ul>
        <p>We reserve the right to remove any content that violates these rules without prior notice.</p>
      </>
    ),
  },
  {
    id: "5",
    title: "5. Reviews & Engagement",
    content: (
      <ul>
        <li>All reviews, ratings, and feedback must be genuine and based on actual experience.</li>
        <li>Fake, duplicate, or incentivized reviews may be removed at our discretion.</li>
        <li>We reserve the right to moderate, edit, or remove any engagement content that violates our guidelines.</li>
      </ul>
    ),
  },
  {
    id: "6",
    title: "6. Ranking Disclaimer",
    content: (
      <>
        <p>App rankings on the Platform are based on engagement signals including likes, saves, ratings, reviews, feedback, and time-decay factors. Rankings are dynamic and may change at any time.</p>
        <p>We do not guarantee any specific ranking position or level of visibility for any app. The ranking algorithm may be updated or modified without prior notice.</p>
      </>
    ),
  },
  {
    id: "7",
    title: "7. External Links",
    content: (
      <p>The Platform may contain links to third-party websites, apps, or services. We are not responsible for the content, availability, privacy practices, or functionality of any external sites or services. Access to external links is at your own risk.</p>
    ),
  },
  {
    id: "8",
    title: "8. Account Termination",
    content: (
      <p>We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or engaged in behavior that is harmful to the Platform, its users, or its reputation.</p>
    ),
  },
  {
    id: "9",
    title: "9. Limitation of Liability",
    content: (
      <>
        <p>The Platform is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis. To the fullest extent permitted by law, imadeanapp.com shall not be liable for:</p>
        <ul>
          <li>Any user-generated content on the Platform</li>
          <li>The functionality, safety, or accuracy of third-party apps or websites linked from the Platform</li>
          <li>Any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform</li>
          <li>Loss of data, revenue, or profits</li>
        </ul>
      </>
    ),
  },
  {
    id: "10",
    title: "10. Account Deletion",
    content: (
      <>
        <p>You may request deletion of your account and associated data by emailing{" "}<a href="mailto:contact@imadeanapp.com">contact@imadeanapp.com</a>.</p>
        <ul>
          <li>Deletion requests will be processed within <strong>4 weeks</strong>.</li>
          <li>You may cancel your deletion request during this period by contacting us.</li>
          <li>After deletion, your account data will be permanently removed. Some anonymized data may be retained for analytics purposes.</li>
        </ul>
      </>
    ),
  },
  {
    id: "11",
    title: "11. Intellectual Property",
    content: (
      <p>The Platform, including its design, branding, logo, features, and code, is the intellectual property of imadeanapp.com. You may not copy, reproduce, distribute, modify, or create derivative works based on the Platform without our prior written consent.</p>
    ),
  },
  {
    id: "12",
    title: "12. No API / No Scraping",
    content: (
      <p>Unauthorized scraping, crawling, or automated access to the Platform is strictly prohibited. You may not use bots, scripts, or other automated tools to extract data from the Platform without our explicit written permission.</p>
    ),
  },
  {
    id: "13",
    title: "13. Updates to These Terms",
    content: (
      <p>We may update these Terms from time to time. Changes will be effective upon posting to the Platform. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms.</p>
    ),
  },
  {
    id: "14",
    title: "14. Contact Us",
    content: (
      <>
        <p>For any questions or concerns about these Terms, please contact us at:</p>
        <p><strong>Email:</strong>{" "}<a href="mailto:contact@imadeanapp.com">contact@imadeanapp.com</a></p>
      </>
    ),
  },
];

const TermsAndConditions = () => {
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
              Terms & Conditions
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: April 11, 2026 · Version 1.2
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed text-justify mb-8">
            Welcome to <strong className="text-foreground">imadeanapp.com</strong> (the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree, please do not use the Platform.
          </p>

          <Accordion type="single" collapsible className="space-y-2">
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

export default TermsAndConditions;
