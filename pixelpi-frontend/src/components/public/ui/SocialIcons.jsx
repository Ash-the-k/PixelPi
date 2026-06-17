// Custom SVG components for brand/social icons.
// LinkedIn, Instagram, Facebook: stroke-based at strokeWidth 1.75 to match Lucide's visual weight.
// X: filled path — the X letterform requires fill to be recognizable at small sizes;
//    default size is 18px (vs 20px for stroked icons) to balance visual weight.
//
// SocialIconLinks renders the full footer icon row, handling available/unavailable states.
// When Facebook and X links are ready, set available: true and provide the href.

function IconLinkedIn({ size = 20, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconInstagram({ size = 20, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      {/* Camera dot — renders as a circle via strokeLinecap="round" on a near-zero line */}
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconX({ size = 18, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconFacebook({ size = 20, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/pixel-pi-technologies',
    Icon: IconLinkedIn,
    available: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/pixel_pi_technologies',
    Icon: IconInstagram,
    available: true,
  },
  {
    id: 'x',
    label: 'X',
    href: "https://www.x.com/",
    Icon: IconX,
    available: true,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: "https://www.facebook.com/",
    Icon: IconFacebook,
    available: true,
  },
];

export function SocialIconLinks() {
  return (
    <div className="flex items-center gap-3">
      {SOCIAL_LINKS.map(({ id, label, href, Icon, available }) => {
        if (!available) {
          return (
            <span
              key={id}
              className="social-icon-disabled"
              title={`${label} — coming soon`}
              aria-label={`${label} — coming soon`}
            >
              <Icon />
            </span>
          );
        }

        return (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-link"
            aria-label={`Pixel Pi Technologies on ${label}`}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}