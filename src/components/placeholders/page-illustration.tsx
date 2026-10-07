/** Quiet, page-specific illustrations for unfinished sections. */
export function PageIllustration({ analytics }: { analytics: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-24 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 96 96"
    >
      {analytics ? (
        <>
          <rect
            className="fill-background stroke-border"
            height="66"
            rx="8"
            width="76"
            x="10"
            y="15"
          />
          <path className="stroke-border" d="M10 29h76" />
          <circle cx="18" cy="22" fill="currentColor" r="1" stroke="none" />
          <circle cx="23" cy="22" fill="currentColor" r="1" stroke="none" />
          <rect
            className="fill-muted stroke-border"
            height="13"
            rx="2"
            width="10"
            x="23"
            y="57"
          />
          <rect
            className="fill-muted stroke-border"
            height="22"
            rx="2"
            width="10"
            x="43"
            y="48"
          />
          <rect
            className="fill-muted stroke-border"
            height="32"
            rx="2"
            width="10"
            x="63"
            y="38"
          />
          <path className="stroke-foreground" d="m24 48 20-10 19 4 10-9" />
          <path className="stroke-foreground" d="M67 33h6v6" />
        </>
      ) : (
        <>
          <rect
            className="fill-background stroke-border"
            height="65"
            rx="6"
            transform="rotate(-7 42 49)"
            width="50"
            x="17"
            y="17"
          />
          <path
            className="fill-surface"
            d="M31 11h23l16 16v46a6 6 0 0 1-6 6H31a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6Z"
          />
          <path
            className="stroke-border"
            d="M54 11v10a6 6 0 0 0 6 6h10M35 33h16M35 42h23M35 51h15"
          />
          <circle
            className="fill-surface stroke-foreground"
            cx="64"
            cy="62"
            r="14"
          />
          <path
            className="stroke-foreground"
            d="m74 72 10 10"
            strokeWidth="2"
          />
          <path className="stroke-muted-foreground" d="m58 62 4 4 8-8" />
        </>
      )}
    </svg>
  );
}
