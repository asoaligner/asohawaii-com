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
    <nav className="stripe-nav">
      <a href="#" className="stripe-nav-brand">
        aso<span style={{ color: "var(--s-purple)" }}>/hawaii</span>
      </a>
      <ul
        style={{
          display: "flex",
          gap: 28,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {links.map((l) => (
          <li key={l.href} className="hidden md:block">
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
      <a href="#request" className="stripe-nav-cta">
        Request invitation &rarr;
      </a>
    </nav>
  );
}
