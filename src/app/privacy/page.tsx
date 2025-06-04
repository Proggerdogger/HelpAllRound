'use client';

import React from 'react';
import Link from 'next/link';


const PrivacyPolicyPage = () => {
  // Helper function to render bullet points from an array of strings
  const renderBulletPoints = (points: string[]) => (
    <ul className="list-disc list-inside pl-4 space-y-1">
      {points.map((point, index) => <li key={index}>{point}</li>)}
    </ul>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <header className="mb-8 text-center">
          <Link href="/" passHref>
            <h1 className="text-3xl font-bold text-red-600 hover:opacity-80 transition-opacity cursor-pointer">
              HelpAllRound
            </h1>
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-gray-700">Privacy Policy</h2>
        </header>

        <section className="space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <p>We know that how we collect, use, exchange and protect your information is important to you, and we value your trust. Our Privacy Policy outlines how we do this, in accordance with applicable privacy laws (e.g., the Privacy Act and the Australian Privacy Principles, if applicable). It covers:</p>
          {renderBulletPoints([
            "Information we collect",
            "How we use your information",
            "Who we exchange your information with",
            "How we keep your information secure",
            "How you can access, update and correct your information",
            "How you can make a complaint about misuse of your information"
          ])}

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">1. About this policy</h3>
            <p>Applicable privacy laws (e.g., The Privacy Act 1988 in Australia) require entities bound by certain privacy principles to have a privacy policy. This privacy policy outlines the personal information handling practices of HelpAllRound (‘HelpAllRound’, ‘we’, ‘us’ or ‘our’). (Consider inserting your registered business name and ABN/equivalent registration number here if applicable).</p>
            <p>This policy is written in simple language. The specific legal obligations of HelpAllRound when collecting and handling your personal information are outlined in applicable privacy laws and principles. We will update this privacy policy when our information handling practices change.</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">2. Collection and storage of your personal information</h3>
            
            <h4 className="text-lg font-medium text-gray-800">2.1. Why do we collect your personal information?</h4>
            <p>If you are a customer, to provide you with assistance for general tasks and related support services, including collateral services. We always try to collect only the information we need for the particular services that you have asked us to provide to you!</p>
            <p>If you are an applicant seeking employment or appointment as a contractor/helper, so that we can assess your suitability.</p>
            <p>If you are an employee or contractor/helper, for all purposes relevant to your employment or engagement with us.</p>

            <h4 className="text-lg font-medium text-gray-800">2.2. What personal information do we collect and store?</h4>
            <p>The personal information we collect and store will depend on why you contact us and on which HelpAllRound services you order and/or use. The information may include:</p>
            {renderBulletPoints([
              "your name and contact details, including your physical address, email address and telephone number(s);",
              "details of the task or service you require;",
              "your ABN (if applicable, e.g., for helpers);",
              "your bank account and/or credit card details (typically processed and stored by our third-party payment processor, Stripe, not directly by HelpAllRound);",
              "your employment history (which may include sensitive information), if you apply for a job or to be a helper with us;",
              "other employment-related or engagement-related information, if you apply for a job or to be a helper with us; and",
              "other information you may provide to us, e.g. through customer surveys or feedback."
            ])}

            <h4 className="text-lg font-medium text-gray-800">2.3. How do we collect personal information?</h4>
            <p className="font-semibold">Direct collection</p>
            <p>There are quite a few ways we may seek information from you directly. We might collect your information when you fill out an electronic form on our website (e.g., booking form, contact form), sign up to our newsletter (if applicable), enter one of our competitions (if applicable), apply for a role with us, telephone us, send us an email or complete a customer survey.</p>
            <p className="font-semibold">Email lists</p>
            <p>If you subscribe to our email lists, we collect your email address and, if you provide it, other contact details. We only use this information to send you our newsletter, regular updates on HelpAllRound and our services (with your consent), and to administer the lists.</p>
            <p className="font-semibold">Electronic forms</p>
            <p>We use e-forms to enable you to lodge an application, booking request, or enquiry online via our website.</p>
            <p className="font-semibold">Collecting through our website and our use of cookies</p>
            <p>Where our website allows you to make comments, give feedback or communicate with us, we sometimes collect your email address and sometimes some other contact details. We may use your email address to respond to your comments, feedback or communication.</p>
            <p>We might also use cookies (small text files stored in your browser) and other techniques such as web beacons (small, clear picture files used to follow your movements on our website). These collect information that helps us understand how you use our online products and services and how we can make them more relevant to you. Third parties (like Firebase for authentication, Stripe for payments, or analytics providers if used) may also place cookies on your browser for functional or targeted advertising purposes.</p>
            <p>We may use a persistent cookie (a cookie that stays linked to your browser) to record your visits so we can recognise you if you visit our website again. It also lets us keep track of products or services you view so that, with your consent, we can send you news about them.</p>
            <p>We also use cookies to measure traffic patterns, to determine which areas of our website have been visited and to measure transaction patterns in the aggregate. This helps us research our users' habits so that we can improve our online products and services. You can set your browser so your computer refuses cookies or lets you know each time a website tries to set a cookie.</p>
            <p>We may log IP addresses (that is, the electronic addresses of computers connected to the internet) to analyse trends, administer the website, track user movements, and gather broad demographic information.</p>
            <p className="font-semibold">Indirect collection</p>
            <p>In order for us to provide our services, we may collect personal information about you indirectly from third parties such as:</p>
            {renderBulletPoints([
              "publicly available sources; or",
              "your representative, such as an assistant or colleague, an adult relative, a caregiver, who contacts us on your behalf."
            ])}

            <h4 className="text-lg font-medium text-gray-800">2.4. How do we store/hold your personal information?</h4>
            <p>Your personal information is primarily stored electronically and securely in our databases (e.g., Firebase Firestore) and other secure information systems. We utilize third-party services like Firebase and Stripe which have their own robust security measures.</p>

            <h4 className="text-lg font-medium text-gray-800">2.5. Anonymity</h4>
            <p>Where possible and practicable, we will allow you to interact with us anonymously or using a pseudonym. For example, if you contact us with a general question not requiring a booking, you may not be required to give your name.</p>
            <p>However, for most of our services (like making a booking), we usually need your name, contact information, and enough information about the particular matter to enable us to fairly and efficiently handle your request.</p>

            <h4 className="text-lg font-medium text-gray-800">2.6. Opting-Out of Targeted Ads (General Principle)</h4>
            <p>(This section from Geeks2U is quite specific to certain ad tech. You'll need to verify if you are using similar ad retargeting. If not, simplify or remove. If you use Google Analytics, mention opt-out tools for that.)</p>
            <p>If we engage in targeted advertising:</p>
            {renderBulletPoints([
              "Web browser: You can often opt-out of receiving personalized ads served by us or on our behalf by looking for opt-out mechanisms (like AdChoices icons) or managing your browser\'s cookie settings.",
              "Mobile Device Opt-Out: Your device settings often provide options to limit ad tracking (e.g., \"Limit Ad Tracking\" on iOS, \"Opt out of interest-based advertising\" on Android)."
            ])}
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">3. What if you don't provide us with your personal information?</h3>
            <p>If you don't provide your personal information to us when required for a specific service, we may not be able to properly provide that service to you, administer your account, verify your identity, or (with your consent) let you know about other products and services that might be useful to you.</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">4. When will we notify you that we have received your information?</h3>
            <p>When we collect personal information from you directly, we'll take reasonable steps to notify you (often through this Privacy Policy and point-of-collection notices) how and why we collected your information, who we may disclose it to, and how you can access it, seek correction of it, or make a complaint.</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">5. Disclosure</h3>
            <p>Your privacy and the protection of your personal information are very important to us. We do not disclose your personal information to other organizations or entities except as described in this policy, including:</p>
            {renderBulletPoints([
              "To Helpers/Service Providers: To facilitate the service you requested, relevant details (like your name, address for the service, and task description) will be shared with the helper assigned to your task.",
              "Our Contracted Technology Service Providers: HelpAllRound uses a number of service providers to whom we disclose personal information as necessary to provide our services to you. These include providers that host our website servers (e.g., Vercel), manage our IT, provide our database (e.g., Firebase), and process payments (e.g., Stripe).",
              "Related Bodies Corporate: (If you have related companies, mention them here. If not, remove or state \"We do not currently have related bodies corporate with whom we share personal information.\").",
              "Legal Requirements: If required or authorized by law."
            ])}
            
            <h4 className="text-lg font-medium text-gray-800">5.1. Service providers (Covered above, but can be reiterated)</h4>
            <p>HelpAllRound uses a number of service providers to whom we disclose personal information only in order to provide our services to you. These include providers that host our website servers, manage our IT, provide our database and authentication services, and process payments.</p>

            <h4 className="text-lg font-medium text-gray-800">5.2. Disclosure of personal information overseas</h4>
            <p>Our technology service providers (like Google for Firebase, Stripe, Vercel) may store and process data in various countries. By using our services, you consent to the potential transfer of your information to these locations, where privacy laws may differ. We rely on the security and privacy commitments of these reputable global providers. (This is a critical point to get legal advice on, especially regarding specific jurisdictions like Australia, EU, UK, California, etc.)</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">6. Quality of your personal information</h3>
            <p>To ensure that the personal information we collect is accurate, up-to-date and complete we:</p>
            {renderBulletPoints([
              "record information in a consistent format;",
              "promptly add updated or new personal information to existing records where possible; and/or",
              "may periodically ask you to verify your details."
            ])}
            <p>The accuracy of your information is of course largely dependent on what you provide us. Please let us know when your information changes (e.g. if you change your name, phone number, or address).</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">7. Security of your personal information</h3>
            <p>The security of your personal information is a high priority for us. We take reasonable steps to protect it from misuse, interference and loss, and from unauthorised access, modification or disclosure. Some of the ways we do this are:</p>
            {renderBulletPoints([
              "confidentiality requirements of our employees and engaged helpers;",
              "security measures for access to our systems (e.g., authentication, authorization);",
              "utilizing reputable third-party services (Firebase, Stripe, Vercel) that have their own robust security measures, including data encryption and firewalls;",
              "control of access to our physical office (if applicable)."
            ])}
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">8. Direct Marketing</h3>
            <p>We may send you direct marketing communications and information about our products, services, discounts, competitions and special promotions that we consider may be of interest to you, but only with your explicit consent where required by law.</p>
            <p>We may do this via email, SMS, or other electronic means you've agreed to.</p>
            <p>We will always let you know that you can opt-out from receiving our marketing offers and will provide easy-to-follow steps to do so (e.g., an unsubscribe link in emails).</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">9. Accessing and correcting your personal information</h3>
            <p>You generally have the right to ask for access to personal information that we hold about you, and ask that we correct that personal information if it's inaccurate. You can ask for access or correction by contacting us (see section 10) and we will respond within a reasonable timeframe (e.g., 30 days, or as required by law). If you ask, we will generally give you access to your personal information, and take reasonable steps to correct it if we consider it is incorrect, unless there is a law that allows or requires us not to.</p>
            <p>We will ask you to verify your identity before we give you access to your information or correct it. If we refuse to give you access to, or correct, your personal information, we must notify you in writing setting out the reasons why (unless it's unreasonable to do so).</p>
            <p>If we make a correction and we have disclosed the incorrect information to others (where practicable and lawful), you can ask us to tell them about the correction.</p>
            <p>If we refuse to correct your personal information, you can ask us to associate with it a statement that you believe the information is incorrect and why.</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">10. How to make an enquiry or a complaint</h3>
            <p>If you have an enquiry or a complaint about how we handle your personal information, we want to hear from you. Please let us know about your concerns by contacting us:</p>
            {renderBulletPoints([
              "Emailing us at: [Your Privacy Contact Email Address - e.g., privacy@helpallround.com]",
              "(Optional: Add a physical mailing address if you have one and wish to list it)",
              "(Optional: Add a phone number if you have a dedicated line for privacy inquiries)"
            ])}
            <p>We are committed to resolving your complaint and doing the right thing by our customers. We will acknowledge your complaint promptly and aim to resolve it in a timely manner.</p>
            <p>If you still feel your issue hasn't been resolved to your satisfaction, then you can raise your concern with the relevant data protection authority in your jurisdiction. For example, in Australia, this is the Office of the Australian Information Commissioner (OAIC):</p>
            {renderBulletPoints([
              "Online at: www.oaic.gov.au/privacy",
              "By phone on: 1300 363 992"
            ])}
          </article>

          <div className="pt-6 text-center">
            <Link href="/" passHref>
              <span className="text-red-600 hover:text-red-800 underline cursor-pointer">
                Return to Home
              </span>
            </Link>
          </div>
         
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 