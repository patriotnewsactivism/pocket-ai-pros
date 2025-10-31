/**
 * Privacy Policy Page
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 31, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              BuildMyBot ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
            <p className="text-gray-700 mb-4">
              We collect information that you provide directly to us:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Name and contact information (email address, phone number)</li>
              <li>Company name and business information</li>
              <li>Account credentials (username and password)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Usage Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information about your device and how you interact with our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Device information (device type, operating system)</li>
              <li>Usage statistics (features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Chatbot Data</h3>
            <p className="text-gray-700 mb-4">
              When you create and use chatbots through our service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Training data and content you provide</li>
              <li>Conversation logs and chat histories</li>
              <li>Bot configurations and settings</li>
              <li>Performance metrics and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Providing, maintaining, and improving our services</li>
              <li>Processing transactions and sending related information</li>
              <li>Sending administrative information and updates</li>
              <li>Responding to your comments and questions</li>
              <li>Analyzing usage patterns and trends</li>
              <li>Detecting and preventing fraud and abuse</li>
              <li>Complying with legal obligations</li>
              <li>Marketing and promotional purposes (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you give us permission to share your information</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal 
              obligations. When you delete your account, we will delete or anonymize your personal information 
              within 30 days, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to processing of your information</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Remember your preferences and settings</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Personalize content and advertisements</li>
              <li>Measure the effectiveness of our marketing</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our service integrates with third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Stripe:</strong> Payment processing (subject to Stripe's privacy policy)</li>
              <li><strong>Google Analytics:</strong> Usage analytics and reporting</li>
              <li><strong>OpenAI:</strong> AI model processing for chatbot functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place for such transfers in compliance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not directed to children under 18. We do not knowingly collect personal information 
              from children. If we learn we have collected information from a child, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:privacy@buildmybot.ai" className="text-primary hover:underline">privacy@buildmybot.ai</a><br />
              Website: <a href="https://buildmybot.ai" className="text-primary hover:underline">https://buildmybot.ai</a><br />
              Data Protection Officer: <a href="mailto:dpo@buildmybot.ai" className="text-primary hover:underline">dpo@buildmybot.ai</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. GDPR Compliance (EU Residents)</h2>
            <p className="text-gray-700 mb-4">
              If you are in the European Economic Area (EEA), you have additional rights under the General Data 
              Protection Regulation (GDPR). We process your data based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Contract performance (providing our services)</li>
              <li>Legitimate interests (improving our services)</li>
              <li>Your consent (marketing communications)</li>
              <li>Legal obligations (compliance requirements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. CCPA Compliance (California Residents)</h2>
            <p className="text-gray-700 mb-4">
              California residents have specific rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to deletion of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600">
            By using BuildMyBot's services, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
