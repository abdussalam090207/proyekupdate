import { Phone, Mail, Globe, GitBranch } from 'lucide-react'

const contacts = [
  {
    icon: <Phone size={16} aria-hidden="true" />,
    label: 'WhatsApp',
    href: 'https://wa.me/6289531657198',
    text: '089531657198',
  },
  {
    icon: <Mail size={16} aria-hidden="true" />,
    label: 'Email',
    href: 'mailto:belajar.alam2007@gmail.com',
    text: 'belajar.alam2007@gmail.com',
  },
  {
    icon: <Globe size={16} aria-hidden="true" />,
    label: 'Portfolio',
    href: 'https://www.profalaam.my.id/',
    text: 'profalaam.my.id',
  },
  {
    icon: <GitBranch size={16} aria-hidden="true" />,
    label: 'GitHub',
    href: 'https://github.com/abdussalam090207',
    text: 'abdussalam090207',
  },
]

export default function Footer() {
  return (
    <footer className="glass" style={{ padding: '28px 32px', marginTop: 56 }}>
      <p style={{
        margin: '0 0 20px',
        fontSize: 12,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ink-2)',
        fontWeight: 600,
      }}>
        Hubungi Saya
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {contacts.map(c => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={c.label}
            className="footer-link focus-ring"
          >
            {c.icon}
            {c.text}
          </a>
        ))}
      </div>
      <p style={{ margin: '20px 0 0', fontSize: 12, color: 'var(--muted)' }}>
        © {new Date().getFullYear()} UPDATE PROYEK
      </p>
    </footer>
  )
}
