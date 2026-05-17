export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-[800px] mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="text-sm font-bold uppercase tracking-wider text-green-600">Last Updated: May 17, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including when you create an account, 
              fill out a profile, or communicate with us. This may include your name, email address, 
              phone number, and any other information you choose to provide.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, 
              including to facilitate bookings between students and landlords, verify user identities, 
              and send you technical notices and support messages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Information Sharing</h2>
            <p>
              We share information between students and landlords only as necessary to facilitate 
              viewings and bookings. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, 
              misuse, and unauthorized access, disclosure, alteration, and destruction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at 
              support@board-inn.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
