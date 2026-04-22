const links = [
  { label: "Why EasyRx", href: "#why" },
  { label: "Getting Started", href: "#getting-started" },
  { label: "How to Submit", href: "#how-to" },
  { label: "Scanners", href: "#scanners" },
  { label: "FAQ", href: "#faq" },
  { label: "Support", href: "#support" },
];

export default function Nav() {
  return (
    <nav className="apple-nav">
      <a href="#" className="apple-nav-brand">
        ASO Hawaii
      </a>
      <ul className="flex gap-6 list-none m-0 p-0">
        {links.map((l) => (
          <li key={l.href} className="hidden md:block">
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
      <a href="#request" className="apple-nav-cta">
        Request invitation
      </a>
    </nav>
  );
}
