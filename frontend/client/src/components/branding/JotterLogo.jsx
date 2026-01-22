export default function JotterLogo({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Jotter Logo"
    >
      {/* J Base */}
      <path
        d="M60 10
           c-6 0-10 4-10 10v52
           c0 14-6 20-16 20
           h-4
           v14
           h6
           c22 0 34-12 34-36V20
           c0-6-4-10-10-10z"
        fill="#2F3A40"
      />

      {/* Ink Stroke */}
      <path
        d="M18 62
           C36 40, 72 32, 102 38
           L96 46
           C70 42, 44 50, 28 70
           Z"
        fill="#4CAF50"
      />
    </svg>
  );
}
