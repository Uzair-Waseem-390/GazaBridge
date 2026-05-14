import LegalPage from './LegalPage'

const SECTIONS = [
  {
    heading: '1. What Are Cookies?',
    paragraphs: [
      'Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit — such as your login status — to make your next visit easier and the site more useful.',
    ],
  },
  {
    heading: '2. How GazaBridge Uses Cookies',
    paragraphs: [
      'GazaBridge uses only essential cookies. These are cookies that are strictly necessary for the platform to function. They cannot be switched off in our systems.',
      'We do not use advertising cookies, tracking cookies, or any third-party analytics cookies that track you across other websites.',
    ],
  },
  {
    heading: '3. Essential Cookies We Use',
    paragraphs: [
      'Session Cookie: Keeps you logged in during your visit. Expires when you close your browser or after a set inactivity period.',
      'Security Cookie (CSRF token): Protects your account against cross-site request forgery attacks. This cookie is essential for the security of any authenticated actions you take on the platform.',
      'Preference Cookie: Remembers minimal UI preferences (such as your last-selected language or theme) so you don\'t have to re-select them on each visit.',
    ],
  },
  {
    heading: '4. Third-Party Cookies',
    paragraphs: [
      'We do not place any third-party cookies. If you choose to connect to the platform via Google Sign-In, Google may set its own cookies as part of that authentication process, governed by Google\'s own Privacy Policy.',
    ],
  },
  {
    heading: '5. Managing Cookies',
    paragraphs: [
      'You can control or delete cookies through your browser settings. Please note that disabling essential cookies will affect the functionality of GazaBridge — in particular, you may not be able to remain logged in.',
      'Most browsers allow you to: view cookies stored on your device, block cookies from specific sites, block third-party cookies, and clear all cookies when you close your browser.',
    ],
  },
  {
    heading: '6. Changes to This Policy',
    paragraphs: [
      'We may update this Cookie Policy if our use of cookies changes. The "Last updated" date at the top of this page reflects the most recent revision. We will notify users of significant changes.',
    ],
  },
]

export default function CookiePage(props) {
  return (
    <LegalPage
      {...props}
      eyebrow="Legal"
      title="Cookie Policy"
      lastUpdated="May 2025"
      sections={SECTIONS}
    />
  )
}