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
    <nav className="linear-nav">
      <a
        href="#"
        className="linear-nav-brand"
        style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "linear-gradient(135deg, #5e6ad2 0%, #7170ff 100%)",
            display: "inline-block",
          }}
        />
        ASO Hawaii
      </a>
      <ul
        style={{
          display: "flex",
          gap: 22,
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
      <a href="#request" className="linear-nav-cta">
        Request invitation
      </a>
    </nav>
  );
}
