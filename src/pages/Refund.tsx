/**
 * Refund Policy Page
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Refund() {
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

        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 31, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Our Commitment</h2>
            <p className="text-gray-700 mb-4">
              At BuildMyBot, we stand behind the quality of our services. This Refund Policy outlines the 
              circumstances under which we offer refunds and how to request one.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 14-Day Money-Back Guarantee</h2>
            <p className="text-gray-700 mb-4">
              We offer a <strong>14-day money-back guarantee</strong> for all new subscriptions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Valid for first-time subscribers only</li>
              <li>Must be requested within 14 days of initial purchase</li>
              <li>Full refund of the first payment only</li>
              <li>No questions asked - we'll process your refund promptly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Eligibility for Refunds</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">You ARE Eligible if:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>You request a refund within 14 days of your initial purchase</li>
              <li>You experience technical issues that we cannot resolve</li>
              <li>Our service does not perform as described</li>
              <li>You are charged incorrectly or experience billing errors</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">You are NOT Eligible if:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>More than 14 days have passed since purchase (for money-back guarantee)</li>
              <li>You have violated our Terms of Service</li>
              <li>You are requesting a refund for renewal charges (must cancel before renewal)</li>
              <li>You have already received a refund for a previous subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Subscription Cancellations</h2>
            <p className="text-gray-700 mb-4">
              You can cancel your subscription at any time:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Cancel from your account settings at any time</li>
              <li>You retain access until the end of your billing period</li>
              <li>No refund for remaining days in current billing cycle (except within 14-day guarantee)</li>
              <li>You will not be charged for subsequent billing cycles</li>
              <li>You can reactivate your subscription at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. How to Request a Refund</h2>
            <p className="text-gray-700 mb-4">
              To request a refund, follow these steps:
            </p>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700">
              <li>
                <strong>Contact Support:</strong> Email us at{' '}
                <a href="mailto:support@buildmybot.app" className="text-primary hover:underline">
                  support@buildmybot.app
                </a>
              </li>
              <li>
                <strong>Include Information:</strong> Provide your account email, order number, and reason for refund
              </li>
              <li>
                <strong>Wait for Response:</strong> We'll review your request within 1-2 business days
              </li>
              <li>
                <strong>Receive Refund:</strong> If approved, refunds are processed within 5-10 business days
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Refund Processing Time</h2>
            <p className="text-gray-700 mb-4">
              Once your refund is approved:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Refunds are processed within 5-10 business days</li>
              <li>Refunds are issued to the original payment method</li>
              <li>Credit card refunds may take an additional 5-7 business days to appear</li>
              <li>You'll receive an email confirmation when the refund is processed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Partial Refunds</h2>
            <p className="text-gray-700 mb-4">
              In certain situations, we may offer partial refunds:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Service outages or downtime beyond acceptable SLA</li>
              <li>Features not working as advertised</li>
              <li>Pro-rated refunds for exceptional circumstances (at our discretion)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Annual Plans</h2>
            <p className="text-gray-700 mb-4">
              Special considerations for annual subscriptions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>14-day money-back guarantee applies to annual plans</li>
              <li>After 14 days, refunds are pro-rated based on unused months</li>
              <li>Minimum 3-month charge applies for annual plan cancellations</li>
              <li>You receive discounted monthly rate, not standard rate, in pro-rated calculations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Enterprise Plans</h2>
            <p className="text-gray-700 mb-4">
              Enterprise customers have custom refund terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Refund terms are specified in your Enterprise Agreement</li>
              <li>Contact your account manager for refund requests</li>
              <li>Custom refund policies may apply based on your contract</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Add-ons and Upgrades</h2>
            <p className="text-gray-700 mb-4">
              Additional services and upgrades:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Add-ons are refundable within 14 days of purchase</li>
              <li>Upgrade charges are refundable within 14 days</li>
              <li>Pro-rated credit given when downgrading plans</li>
              <li>One-time purchases are final after 14 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Chargebacks</h2>
            <p className="text-gray-700 mb-4">
              Please contact us before initiating a chargeback:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>We prefer to resolve issues directly with you</li>
              <li>Chargebacks may result in immediate account suspension</li>
              <li>Disputed charges may incur additional processing fees</li>
              <li>We work to resolve all legitimate disputes promptly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Service Credits</h2>
            <p className="text-gray-700 mb-4">
              As an alternative to refunds, we may offer service credits:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Credits can be applied to future subscription payments</li>
              <li>Credits do not expire as long as you have an active account</li>
              <li>Credits are non-transferable and have no cash value</li>
              <li>Credits are forfeited upon account closure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Exceptions</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to refuse refunds in cases of:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Terms of Service violations</li>
              <li>Fraudulent activity or abuse of service</li>
              <li>Repeated refund requests indicating abuse of policy</li>
              <li>Accounts suspended or terminated for policy violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Free Trials</h2>
            <p className="text-gray-700 mb-4">
              If we offer free trials:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Cancel before the trial ends to avoid charges</li>
              <li>No refunds for charges incurred after trial period</li>
              <li>One free trial per customer</li>
              <li>Full access to all features during trial</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Refund Policy from time to time. Changes will be posted on this page with an 
              updated "Last Updated" date. Material changes will be communicated via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For refund requests or questions about this policy:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:support@buildmybot.app" className="text-primary hover:underline">support@buildmybot.app</a><br />
              Billing Questions: <a href="mailto:billing@buildmybot.app" className="text-primary hover:underline">billing@buildmybot.app</a><br />
              Website: <a href="https://buildmybot.app" className="text-primary hover:underline">https://buildmybot.app</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">📞 Need Help?</h3>
          <p className="text-gray-700 mb-4">
            Before requesting a refund, let us help you! Our support team is here to resolve any issues you
            may be experiencing. Contact us at{' '}
            <a href="mailto:support@buildmybot.app" className="text-primary hover:underline font-semibold">
              support@buildmybot.app
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Most issues can be resolved quickly, and we're committed to your satisfaction.
          </p>
        </div>
      </div>
    </div>
  );
}
