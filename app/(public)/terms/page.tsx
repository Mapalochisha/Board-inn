export default function TermsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-[800px] mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Terms & Conditions</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="text-sm font-bold uppercase tracking-wider text-green-600">Last Updated: May 17, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Board-inn platform, you agree to be bound by these Terms & Conditions 
              and all applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Use of the Platform</h2>
            <p>
              Board-inn is a platform that connects students with landlords. We do not own or manage 
              the properties listed on the site. All arrangements made are between the student and 
              the landlord.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. User Responsibilities</h2>
            <p>
              Users are responsible for providing accurate information in their profiles and listings. 
              Landlords must ensure their properties meet all local housing regulations. Students 
              are responsible for conducting their own due diligence before signing any agreements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Cancellations and No-Shows</h2>
            <p>
              Repeated no-shows for viewing bookings may result in account suspension. Please 
              cancel viewings at least 24 hours in advance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Limitation of Liability</h2>
            <p>
              Board-inn is not liable for any disputes, damages, or losses arising from the use of 
              the platform or arrangements made between users.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
