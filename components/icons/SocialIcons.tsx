type IconProps = Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> & {
  size?: number | string;
};

function withSize({ size = 24, ...rest }: IconProps) {
  return { width: size, height: size, ...rest };
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...withSize(props)}>
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.55-1.5H16.5V4.3C16.2 4.26 15.2 4.17 14 4.17c-2.4 0-4 1.46-4 4.16V10.5H7.5v3H10V21h3.5Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...withSize(props)}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...withSize(props)}>
      <path d="M4.98 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 9.75h3v10.75h-3V9.75ZM10 9.75h2.87v1.47h.04c.4-.75 1.38-1.55 2.85-1.55 3.05 0 3.62 2 3.62 4.6v6.23h-3v-5.52c0-1.32-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9v5.62h-3V9.75Z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...withSize(props)}>
      <path d="M22 12s0-3.5-.45-5.15a2.8 2.8 0 0 0-1.97-2C17.9 4.4 12 4.4 12 4.4s-5.9 0-7.58.45a2.8 2.8 0 0 0-1.97 2C2 8.5 2 12 2 12s0 3.5.45 5.15a2.8 2.8 0 0 0 1.97 2c1.68.45 7.58.45 7.58.45s5.9 0 7.58-.45a2.8 2.8 0 0 0 1.97-2C22 15.5 22 12 22 12Zm-12.1 3.3V8.7l5.6 3.3-5.6 3.3Z" />
    </svg>
  );
}

export function XSocialIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...withSize(props)}>
      <path d="M18.244 2H21.5l-7.5 8.57L22.75 22h-6.885l-5.39-6.94L4.24 22H1l8.02-9.17L1.5 2h7.06l4.86 6.34L18.244 2Zm-1.207 18h1.9L7.06 4H5.03l11.007 16Z" />
    </svg>
  );
}
