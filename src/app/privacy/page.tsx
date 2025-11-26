import Image from 'next/image'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-pampas">
      {/* Header */}
      <div className="bg-biscay py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Image
            src="/spas-logo.png"
            alt="SPAS Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <h1 className="text-white font-bold">St. Paul American School Clark</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-biscay mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Overview</h2>
            <p>
              The Merit & Demerit System is an internal application exclusively for St. Paul American School Clark.
              This policy describes how we collect, use, and protect information within our school community.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Account Information:</strong> Name and email address from your school Google account</li>
              <li><strong>Merit/Demerit Records:</strong> Records issued to or by users, including reasons and dates</li>
              <li><strong>Usage Data:</strong> Basic activity logs for system administration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">How We Use Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Track and manage student merits and demerits</li>
              <li>Generate uniform passes and detention records</li>
              <li>Provide reports to school administrators</li>
              <li>Maintain system security and integrity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Data Security</h2>
            <p>
              All data is stored securely using Supabase, with encryption in transit and at rest.
              Access is restricted to authorized school personnel and students based on their roles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Data Retention</h2>
            <p>
              Records are retained for the duration of a student&apos;s enrollment and may be archived
              according to school record-keeping policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Contact</h2>
            <p>
              For questions about this privacy policy or your data, please contact the school administration
              at St. Paul American School Clark.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-biscay hover:underline text-sm">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
