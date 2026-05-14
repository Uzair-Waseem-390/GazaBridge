import LegalPage from './LegalPage'

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    paragraphs: [
      'By creating an account or using GazaBridge ("the platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
      'These terms apply to all users — volunteers, learners, and visitors.',
    ],
  },
  {
    heading: '2. The Platform',
    paragraphs: [
      'GazaBridge is a free platform that facilitates connections between volunteers who offer skills and learners who seek them. GazaBridge is not a party to the teaching relationship between volunteers and learners, and does not guarantee the quality or outcome of any session.',
      'All services on GazaBridge are provided free of charge and will remain free. We do not have paid tiers, premium features, or subscription plans.',
    ],
  },
  {
    heading: '3. Eligibility',
    paragraphs: [
      'You must be at least 16 years old to use GazaBridge. By creating an account, you confirm that you meet this requirement.',
      'You are responsible for providing accurate information when creating your account and keeping your profile up to date.',
    ],
  },
  {
    heading: '4. Acceptable Use',
    paragraphs: [
      'You agree to use GazaBridge only for lawful purposes. You must not use the platform to harass, abuse, or harm others; post false or misleading information; impersonate another person or organization; spam or send unsolicited commercial messages; or attempt to gain unauthorized access to any part of the platform.',
      'GazaBridge reserves the right to suspend or terminate any account that violates these terms, at our sole discretion.',
    ],
  },
  {
    heading: '5. Volunteer Conduct',
    paragraphs: [
      'Volunteers agree to conduct sessions in good faith and in a manner that is safe, professional, and respectful. Volunteers must not charge learners for any service offered through GazaBridge.',
      'GazaBridge does not verify the credentials of volunteers. Learners use the platform at their own discretion and are encouraged to review volunteer profiles and ratings before connecting.',
    ],
  },
  {
    heading: '6. Content',
    paragraphs: [
      'By posting content on GazaBridge (including profile information, session descriptions, and messages), you grant GazaBridge a non-exclusive, royalty-free license to display that content on the platform.',
      'You are solely responsible for the content you post. GazaBridge does not endorse any user-generated content.',
    ],
  },
  {
    heading: '7. Limitation of Liability',
    paragraphs: [
      'GazaBridge is provided "as is" without any warranty, express or implied. We do not guarantee uninterrupted access to the platform or any specific outcome from using it.',
      'To the maximum extent permitted by law, GazaBridge shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
    ],
  },
  {
    heading: '8. Changes to These Terms',
    paragraphs: [
      'We may update these Terms of Service from time to time. We will notify users of material changes via email or a prominent notice on the platform. Continued use of the platform after such changes constitutes acceptance of the updated terms.',
    ],
  },
  {
    heading: '9. Contact',
    paragraphs: [
      'For any questions about these Terms of Service, please contact us at hello@gazabridge.org.',
    ],
  },
]

export default function TermsPage(props) {
  return (
    <LegalPage
      {...props}
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated="May 2025"
      sections={SECTIONS}
    />
  )
}