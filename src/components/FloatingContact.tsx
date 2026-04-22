import Link from "next/link";

export default function FloatingContact() {
  return (
    <Link
      href="/contact#general"
      className="fixed bottom-4 right-4 z-[150] inline-flex items-center gap-2 bg-brandOrange text-white px-5 py-3 rounded-full text-sm font-medium shadow-[0_12px_32px_-4px_rgba(249,115,22,0.45),0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_14px_40px_-4px_rgba(249,115,22,0.55),0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all md:bottom-6 md:right-6"
      aria-label="Contact us"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
      Contact Us
    </Link>
  );
}
