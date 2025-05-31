// Assume you're using Tailwind CSS or similar

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">
      <header className="py-8 px-6 md:px-16 bg-black text-white">
        <h1 className="text-4xl font-bold mb-2">Built for Black Beauty Pros.</h1>
        <p className="text-xl max-w-xl">
          Afro Allure helps you grow your beauty business with tools built to book clients, get paid, and thrive — even in spaces where you’re often overlooked.
        </p>
        <button className="mt-6 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
          Join the Waitlist
        </button>
      </header>

      <section className="py-16 px-6 md:px-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Everything You Need to Run Your Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Feature
            title="Automated Booking"
            desc="Let clients book you 24/7 through your personalized booking page."
          />
          <Feature
            title="Smart Analytics"
            desc="Track your earnings, most popular services, and client retention in one dashboard."
          />
          <Feature
            title="Multiple Payment Options"
            desc="Accept card, mobile payments, and more — with instant or same-day payouts."
          />
          <Feature
            title="Loyalty Program"
            desc="Keep your best clients coming back with customizable rewards."
          />
          <Feature
            title="Appointment Reminders"
            desc="Cut down on no-shows with automated text/email reminders."
          />
          <Feature
            title="All-in-One Simplicity"
            desc="No confusing tech. Just powerful tools made simple — and made for you."
          />
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-6 md:px-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Say Goodbye to Paper Calendars & Missed Payments</h2>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Afro Allure helps you stay organized, get booked, and get paid — without giving up your freedom.
        </p>
        <button className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition">
          Claim Your Free Booking Page
        </button>
      </section>

      <footer className="py-8 px-6 md:px-16 text-center text-gray-600">
        &copy; {new Date().getFullYear()} Afro Allure. All rights reserved.
      </footer>
    </div>
  );
}

function Feature({ title, desc }: { title: string, desc: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
