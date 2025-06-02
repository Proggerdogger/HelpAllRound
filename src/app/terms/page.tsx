'use client';

import React from 'react';
import Link from 'next/link';

const TermsOfUsePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <header className="mb-8 text-center">
          <Link href="/" passHref>
            <h1 className="text-3xl font-bold text-red-600 hover:opacity-80 transition-opacity cursor-pointer">
              HelpAllRound
            </h1>
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-gray-700">Terms of Use</h2>
        </header>

        <section className="space-y-6 text-gray-700">
          
          
          <p>These terms of use (“Terms”) govern your use of the HelpAllRound web site, and any linked pages (“web site”). Your use of this web site will mean you accept these Terms.</p>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">Intellectual Property Rights</h3>
            <p>The material contained on this web site is protected by copyright. You may use this web site only for your personal and non-commercial purposes. Except to the extent permitted by relevant copyright legislation, you must not use, copy, modify, transmit, store, publish or distribute the material on this web site, or create any other material using material on this web site, without obtaining the prior written consent of HelpAllRound.</p>
            <p>Trade marks (whether registered or unregistered) and logos must not be used or modified in any way without obtaining the prior written consent of HelpAllRound.</p>
            <p>The web site, products, technology and processes contained in this web site may be the subject of other intellectual property rights owned by HelpAllRound or by third parties. No licence is granted in respect of those intellectual property rights other than as set out in these Terms. Your use of this web site must not in any way infringe the intellectual property rights of any person.</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">External Sites</h3>
            <p>This web site may contain links to, or frame, web sites of third parties (“external sites”). HelpAllRound is not required to maintain or update the links. Links to, or framing of, external sites should not be construed as any endorsement, approval, recommendation or preference by HelpAllRound of the owners or operators of the external sites, or for any information, products or services referred to on the external sites unless expressly indicated on this web site. HelpAllRound makes no warranties and accepts no liability in relation to material contained on external sites.</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">Cookies</h3>
            <p>Cookies are small pieces of data stored on the web browser on your computer. Any web server (including this one) may:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Store one or more cookies in your browser;</li>
              <li>Request your browser to transmit this data back to the web server; or</li>
              <li>Request your browser to transmit a cookie that has been stored on your browser by another site within the same internet domain. This web site may store cookies on your web browser in order to improve service for you on your subsequent visits to this web site.</li>
            </ul>
            <p>By using cookies, web sites can track information about visitors' use of the site and provide customised content. Most web browsers can be configured to notify the user when a cookie is received, allowing you to either accept or reject it. You may also inspect the cookies stored by your web browser and remove any that you do not want.</p>
            <p>If you disable the use of cookies on your web browser or remove or reject specific cookies from this web site or linked sites, then you may not be able to gain access to all the content and facilities of this web site.</p>
          </article>

          <article className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">Disclaimers and Limitation of Liability</h3>
            <p>Except where to do so would cause any part of these Terms to be illegal, void or unenforceable, HelpAllRound:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Excludes all conditions and warranties implied into these Terms;</li>
              <li>To the fullest extent permitted by applicable law, is not liable to you or anyone else for any loss or damage, however caused (including negligence), which may be directly or indirectly suffered, in connection with use of this web site; and</li>
              <li>Excludes liability (whether that liability arises under contract, tort (including negligence) or statute) for any special, indirect or consequential loss or damage (including without limitation loss of revenue and loss of, or damage to, data) suffered or incurred in connection with this web site.</li>
            </ul>
            <p>Without limiting the general disclaimer, HelpAllRound:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Makes no warranty as to the completeness or accuracy of any material or as to its merchantability or fitness for a particular purpose. HelpAllRound is not liable to you or anyone else if errors occur in the information on this web site or if that information is not up-to-date;</li>
              <li>Will not be liable for disruptions to this web site; and</li>
              <li>Is not liable to you or anyone else if interference with or damage to your computer systems occurs in connection with use of this web site or an external site. You must take your own precautions to ensure that whatever you select for use from this web site is free of viruses or anything else that may interfere with or damage the operation of your computer systems.</li>
            </ul>
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

export default TermsOfUsePage; 