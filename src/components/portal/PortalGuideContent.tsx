/**
 * Bilingual onboarding-guide content for the ASO Hawaii Doctor Portal.
 *
 * Same component drives both the web view (`/portal/guide/`) and the
 * print-friendly view (`/portal/guide-print/`). Each language renders as
 * a single self-contained block sized to fit on one A4 page when printed
 * — so the recipient can print page 1 (EN) or page 2 (JA) only.
 *
 * Illustrations are CSS/SVG mockups, not real screenshots, so the guide
 * stays stable as the UI evolves and translations don't drift.
 */

import type { ReactNode } from "react";

type Locale = "en" | "ja";

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    h1: string;
    intro: string;
    whyHeading: string;
    why: { title: string; body: string }[];
    howHeading: string;
    steps: { label: string; title: string; body: string }[];
    closing: string;
    helpHeading: string;
    helpBody: string;
    phone: string;
    email: string;
  }
> = {
  en: {
    eyebrow: "Onboarding Guide",
    h1: "Welcome to the ASO Hawaii Doctor Portal",
    intro:
      "One place to send new cases, track every delivery date, and re-order with a click. Here is everything you need to get started.",
    whyHeading: "Why use the Portal",
    why: [
      {
        title: "Real-time order tracking",
        body: "See every case from submission to ship date in one dashboard — no calling the lab to ask.",
      },
      {
        title: "One-click reorder",
        body: "Same patient, same appliance, new STL. The portal pre-fills your previous specifications.",
      },
      {
        title: "Direct file uploads",
        body: "STL scans and Rx attachments stay tied to the order — no more lost email threads.",
      },
      {
        title: "Ask anytime",
        body: "Questions about a specific case go directly to our digital team with the order context attached.",
      },
    ],
    howHeading: "How to use it",
    steps: [
      {
        label: "1",
        title: "Sign in",
        body: "Use “Continue with Google” for the fastest log-in, or set a password from the invitation email.",
      },
      {
        label: "2",
        title: "View your orders",
        body: "Your dashboard lists every case for your clinic — patient name, appliance, delivery date, and status badge.",
      },
      {
        label: "3",
        title: "Submit a new case",
        body: "Click “Submit Case”. Attach STL files, mark the tooth chart, fill out the appliance details, done.",
      },
      {
        label: "4",
        title: "Reorder a previous case",
        body: "Open any past order and click “Reorder”. Specifications carry over; just upload the new scan.",
      },
      {
        label: "5",
        title: "Ask about a case",
        body: "Use “Ask about this case” on any order. Your message reaches our digital team with the order linked.",
      },
    ],
    closing:
      "Please send all new cases through the portal from now on. It keeps every case history in one place and ensures your delivery dates always reflect the latest status.",
    helpHeading: "Need help getting started?",
    helpBody: "Call us or email — we walk you through the first case if you'd like.",
    phone: "808-957-0111",
    email: "aso-digital@outlook.com",
  },
  ja: {
    eyebrow: "ご利用ガイド",
    h1: "ASO Hawaii Doctor Portal のご案内",
    intro:
      "新規症例の送信から納期の確認、再注文まで、すべてを一か所で。Portal をスムーズに使い始めていただくためのご案内です。",
    whyHeading: "Portal のメリット",
    why: [
      {
        title: "リアルタイムで注文を追跡",
        body: "送信から発送日まで、全ケースをダッシュボードで一目で確認できます。ラボに電話で問い合わせる必要はありません。",
      },
      {
        title: "ワンクリックで再注文",
        body: "同じ患者・同じ装置・新しい STL — 前回の指示内容を Portal が引き継ぎます。",
      },
      {
        title: "ファイル添付がそのまま注文に紐付く",
        body: "STL スキャンや Rx の PDF は注文と一緒に保存されます。メールのスレッドを探し回る必要はありません。",
      },
      {
        title: "いつでも質問可能",
        body: "個別の症例に関するご質問は、その注文の文脈とともに弊社デジタル担当に直接届きます。",
      },
    ],
    howHeading: "使い方",
    steps: [
      {
        label: "①",
        title: "サインイン",
        body: "「Continue with Google」をご利用いただくのが最も簡単です。または、招待メールに記載のリンクからパスワードを設定していただくことも可能です。",
      },
      {
        label: "②",
        title: "注文を確認する",
        body: "ダッシュボードに貴院のすべての症例 — 患者名・装置・納期・進行状況バッジが一覧表示されます。",
      },
      {
        label: "③",
        title: "新規症例を送信する",
        body: "「Submit Case」をクリック。STL を添付し、歯式図にマーキングしていただき、装置の詳細を選択してご送信ください。",
      },
      {
        label: "④",
        title: "過去の症例から再注文する",
        body: "過去の注文を開いて「Reorder」をクリック。指示内容が引き継がれるので、新しいスキャンをアップロードするだけ。",
      },
      {
        label: "⑤",
        title: "症例について質問する",
        body: "どの注文の画面からでも「Ask about this case」がご利用いただけます。メッセージは該当の注文と一緒に弊社デジタル担当者へ届きます。",
      },
    ],
    closing:
      "今後の新規症例は、ぜひ Portal からお送りいただけますと幸いです。すべての症例履歴が一か所にまとまり、納期も常に最新の状態でご確認いただけます。",
    helpHeading: "始めるサポートが必要な場合",
    helpBody:
      "お電話・メールでお気軽にご連絡ください。初回の症例送信を弊社スタッフがご案内します。",
    phone: "808-957-0111",
    email: "aso-digital@outlook.com",
  },
};

function GoogleBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-navy shadow-sm">
      <svg
        width="13"
        height="13"
        viewBox="0 0 18 18"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}

function OrderRow({
  patient,
  appliance,
  due,
  badge,
  badgeColor,
}: {
  patient: string;
  appliance: string;
  due: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10.5px]">
      <div className="flex-grow min-w-0">
        <div className="font-medium text-navy truncate">{patient}</div>
        <div className="text-gray-500">{appliance}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-navy font-medium">{due}</div>
        <span
          className="inline-block rounded-full px-1.5 py-[1px] mt-0.5 text-[9px] font-medium"
          style={{ background: `${badgeColor}15`, color: badgeColor }}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}

function Bubble({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-block max-w-[180px] rounded-2xl bg-brandOrange/10 px-3 py-2 text-[10.5px] text-navy">
      {children}
    </div>
  );
}

function StepIllustration({ index }: { index: number }) {
  if (index === 0)
    return (
      <div className="flex flex-col items-start gap-1.5">
        <GoogleBadge label="Continue with Google" />
        <div className="text-[10px] text-gray-400">or email + password</div>
      </div>
    );
  if (index === 1)
    return (
      <div className="flex flex-col gap-1.5">
        <OrderRow
          patient="J. Yamamoto"
          appliance="Clear Retainer (Upper)"
          due="May 18"
          badge="In production"
          badgeColor="#F97316"
        />
        <OrderRow
          patient="R. Chong"
          appliance="MSE"
          due="May 22"
          badge="Submitted"
          badgeColor="#0F2942"
        />
      </div>
    );
  if (index === 2)
    return (
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-navy text-white text-[10px] font-medium px-2 py-0.5">
          Step 1 of 5
        </div>
        <div className="text-[10.5px] text-gray-500">
          Patient → Appliance → STL → Tooth chart → Review
        </div>
      </div>
    );
  if (index === 3)
    return (
      <div className="flex items-center gap-2">
        <OrderRow
          patient="K. Tanaka"
          appliance="Spring Retainer"
          due="Apr 03"
          badge="Shipped"
          badgeColor="#10B981"
        />
        <div className="flex flex-col items-center text-brandOrange shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 12h16m0 0l-5-5m5 5l-5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[9px] font-medium">Reorder</span>
        </div>
      </div>
    );
  return (
    <Bubble>
      “Could the lower tray be a touch thicker on #18-19? Thanks!”
    </Bubble>
  );
}

function GuideBlock({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  return (
    <article
      lang={locale}
      className="guide-page mx-auto max-w-[760px] px-8 py-9 text-navy font-sans"
    >
      <header className="flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/images/aso/aso-logo.png"
            alt="ASO Hawaii"
            className="h-10 w-auto"
          />
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
              {t.eyebrow}
            </div>
            <div className="font-serif text-base text-navy">
              ASO International Hawaii
            </div>
          </div>
        </div>
        <div className="text-right text-[10.5px] text-gray-500 leading-tight">
          asohawaii.com/portal/
          <br />
          {t.phone}
        </div>
      </header>

      <h1 className="mt-6 font-serif text-[26px] leading-snug text-navy">
        {t.h1}
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
        {t.intro}
      </p>

      <section className="mt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brandOrange">
          {t.whyHeading}
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
          {t.why.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="font-serif text-[13.5px] text-navy">
                {item.title}
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-gray-600">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brandOrange">
          {t.howHeading}
        </h2>
        <ol className="mt-3 space-y-2.5">
          {t.steps.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[28px_1fr_220px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-navy text-white font-serif text-[13px]">
                {step.label}
              </div>
              <div>
                <div className="font-serif text-[13px] text-navy">
                  {step.title}
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-600">
                  {step.body}
                </p>
              </div>
              <div className="flex justify-end">
                <StepIllustration index={i} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-5 rounded-xl bg-brandOrange/10 px-4 py-3 text-[12px] leading-relaxed text-navy">
        {t.closing}
      </p>

      <footer className="mt-6 flex items-end justify-between gap-4 border-t border-gray-200 pt-3">
        <div>
          <div className="font-serif text-[13px] text-navy">
            {t.helpHeading}
          </div>
          <p className="text-[11px] text-gray-600 mt-0.5">{t.helpBody}</p>
        </div>
        <div className="text-right text-[11.5px] leading-tight">
          <div className="font-medium text-navy">{t.phone}</div>
          <a
            href={`mailto:${t.email}`}
            className="text-brandOrange hover:underline"
          >
            {t.email}
          </a>
        </div>
      </footer>
    </article>
  );
}

export default function PortalGuideContent({
  locale,
}: {
  locale: Locale;
}) {
  return <GuideBlock locale={locale} />;
}
