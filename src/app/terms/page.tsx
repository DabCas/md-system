import Image from 'next/image'
import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-biscay mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Acceptance of Terms</h2>
            <p>
              By accessing and using the Merit & Demerit System, you agree to these terms of service.
              This system is exclusively for authorized members of St. Paul American School Clark.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Authorized Users</h2>
            <p className="mb-3">This system is available only to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Students:</strong> View personal merit/demerit records and progress</li>
              <li><strong>Teachers:</strong> Issue merits and demerits to students</li>
              <li><strong>Principals:</strong> Oversee all records and manage detentions</li>
              <li><strong>Administrators:</strong> Manage system users and settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Acceptable Use</h2>
            <p className="mb-3">Users agree to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the system only for its intended purpose</li>
              <li>Maintain the confidentiality of their account</li>
              <li>Report any unauthorized access or misuse</li>
              <li>Comply with school policies and guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Prohibited Actions</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Sharing account credentials with others</li>
              <li>Attempting to access data beyond your authorization</li>
              <li>Falsifying or manipulating records</li>
              <li>Using the system to harass or discriminate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">System Availability</h2>
            <p>
              We strive to maintain system availability but do not guarantee uninterrupted access.
              The school reserves the right to modify, suspend, or discontinue the system at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Changes to Terms</h2>
            <p>
              These terms may be updated periodically. Continued use of the system after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-biscay mb-3">Contact</h2>
            <p>
              For questions about these terms, please contact the school administration
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
