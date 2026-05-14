import LegalPage from './LegalPage'

const SECTIONS = [
  {
    heading: '1. Who We Are',
    paragraphs: [
      'GazaBridge ("we", "us", "our") is a free, non-profit platform connecting skilled volunteers worldwide with learners — with a particular focus on supporting people in Gaza. Our platform is accessible at gazabridge.org.',
      'If you have any questions about how we handle your data, please contact us at hello@gazabridge.org.',
    ],
  },
  {
    heading: '2. What Information We Collect',
    paragraphs: [
      'Account Information: When you create an account, we collect your name, email address, and the password you choose (stored in hashed form). If you sign up via Google, we receive your name and email from Google.',
      'Profile Information: Any information you voluntarily add to your profile — including your skills, languages, availability, location, WhatsApp number, Telegram handle, LinkedIn URL, or bio.',
      'Usage Data: We collect anonymized data about how the platform is used — such as pages visited and features used — to improve the product. This data cannot be traced to individual users.',
      'Communications: Messages sent through the GazaBridge platform are stored to enable conversation history. We do not read your messages except where required to investigate reported abuse.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    paragraphs: [
      'To operate and improve the platform — matching volunteers with learners, enabling messaging, and personalizing your experience.',
      'To send you important account notifications, such as password resets or policy updates. We do not send marketing emails without your explicit consent.',
      'To prevent abuse and ensure platform safety.',
      'We never sell your data to third parties. We never use your data for advertising.',
    ],
  },
  {
    heading: '4. Who Can See Your Profile',
    paragraphs: [
      'Your profile — including your name, skills, bio, and any contact information you have chosen to share — is visible only to other logged-in GazaBridge users. It is not indexed by search engines or accessible to the public.',
      'You control exactly what contact information appears on your profile. Sharing your WhatsApp number or Telegram handle is entirely optional.',
    ],
  },
  {
    heading: '5. Data Retention',
    paragraphs: [
      'We retain your account data for as long as your account is active. If you delete your account, we remove your personal information within 30 days, except where retention is required by law.',
    ],
  },
  {
    heading: '6. Cookies',
    paragraphs: [
      'We use essential cookies to keep you logged in and to protect the security of your session. We do not use advertising cookies or tracking cookies. For more details, see our Cookie Policy.',
    ],
  },
  {
    heading: '7. Your Rights',
    paragraphs: [
      'You have the right to access, correct, or delete any personal data we hold about you. You can update most information directly in your profile settings, or contact us at hello@gazabridge.org for any other requests.',
      'If you are located in the European Union, you have additional rights under the GDPR, including the right to data portability and the right to object to processing.',
    ],
  },
  {
    heading: '8. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. We will notify users of significant changes via email or a prominent notice on the platform. The "Last updated" date at the top of this page reflects the most recent revision.',
    ],
  },
]

export default function PrivacyPage(props) {
  return (
    <LegalPage
      {...props}
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="May 2025"
      sections={SECTIONS}
    />
  )
}