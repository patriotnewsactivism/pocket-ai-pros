/**
 * Terms of Service Page
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
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

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 31, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using BuildMyBot's services, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, you are 
              prohibited from using or accessing our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Services Description</h2>
            <p className="text-gray-700 mb-4">
              BuildMyBot provides AI-powered chatbot creation and management services. We reserve the right 
              to modify, suspend, or discontinue any part of our services at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account. You must immediately notify us of any unauthorized use 
              of your account.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>You must provide accurate and complete registration information</li>
              <li>You must be at least 18 years old to create an account</li>
              <li>One person or legal entity may not maintain more than one free account</li>
              <li>You may not use our service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
            <p className="text-gray-700 mb-4">
              Some parts of our service are billed on a subscription basis. You will be billed in advance on 
              a recurring and periodic basis (monthly or annually).
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Subscription fees are non-refundable except as required by law</li>
              <li>We may change subscription fees with 30 days notice</li>
              <li>You can cancel your subscription at any time from your account settings</li>
              <li>Upon cancellation, you retain access until the end of your billing period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Usage Limits</h2>
            <p className="text-gray-700 mb-4">
              Your use of our services is subject to usage limits based on your subscription plan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Number of chatbots you can create</li>
              <li>Number of messages processed per month</li>
              <li>API call rates and quotas</li>
              <li>Storage limits for training data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-4">
              You agree not to use our services to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Distribute malware or harmful code</li>
              <li>Engage in harassment, abuse, or hate speech</li>
              <li>Impersonate others or provide false information</li>
              <li>Scrape or harvest data without permission</li>
              <li>Interfere with the service or servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The service and its original content, features, and functionality are owned by BuildMyBot and 
              are protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. User Content</h2>
            <p className="text-gray-700 mb-4">
              You retain ownership of content you create using our service. However, you grant us a license to 
              use, store, and process your content to provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to the service immediately, without prior 
              notice or liability, for any reason, including breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              BuildMyBot shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The service is provided "as is" and "as available" without warranties of any kind, either express 
              or implied, including but not limited to merchantability, fitness for a particular purpose, and 
              non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which BuildMyBot operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes via email or through the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:legal@buildmybot.app" className="text-primary hover:underline">legal@buildmybot.app</a><br />
              Website: <a href="https://buildmybot.app" className="text-primary hover:underline">https://buildmybot.app</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600">
            By using BuildMyBot's services, you acknowledge that you have read and understood these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
