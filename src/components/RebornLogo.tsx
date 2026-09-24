import React from 'react';

interface RebornLogoProps {
  className?: string;
  size?: number | string;
}

export const RebornLogo: React.FC<RebornLogoProps> = ({
  className = 'h-11 w-auto',
  size,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Reborn Your Style Logo Oficial"
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Montserrat:wght@400;500;600&display=swap');
          .rys-bg { fill: #F8F6F0; }
          .rys-ring { fill: none; stroke: #3A5534; stroke-width: 3.2; stroke-linecap: round; }
          .rys-pine { fill: #3A5534; }
          .rys-dark { fill: #1B1E19; }
          .rys-stroke { stroke: #1B1E19; fill: none; stroke-linecap: round; stroke-linejoin: round; }
          .rys-title { font-family: 'Cinzel', 'Times New Roman', Georgia, serif; font-size: 38px; font-weight: 700; letter-spacing: 0.38em; fill: #1B1E19; text-anchor: middle; }
          .rys-subtitle { font-family: 'Montserrat', system-ui, sans-serif; font-size: 19px; font-weight: 500; letter-spacing: 0.24em; fill: #2C3029; text-anchor: middle; }
        `}</style>
      </defs>

      {/* Background Circular Warm Cream Tone */}
      <circle cx="300" cy="300" r="288" className="rys-bg" />

      {/* Circular Arrow Ring (Pine Green) */}
      <path d="M 140 102 A 250 250 0 0 1 345 54" className="rys-ring" />
      {/* Clockwise arrowhead at top */}
      <polygon points="344,46 360,56 343,65 348,56" className="rys-pine" />

      {/* Continuation of ring */}
      <path d="M 360 58 A 250 250 0 0 1 548 320 A 250 250 0 0 1 300 550 A 250 250 0 0 1 68 380" className="rys-ring" />

      {/* Bottom-left Botanical Leaf Branch along circle */}
      <g id="rys-botanical-branch" className="rys-pine">
        <path d="M 65 370 Q 52 300 90 220" fill="none" stroke="#3A5534" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M 74 350 C 55 352 45 338 52 325 C 60 338 68 344 74 350 Z" />
        <path d="M 68 335 C 75 320 90 322 92 334 C 85 340 76 342 68 335 Z" />
        <path d="M 60 310 C 42 305 40 290 50 280 C 56 292 62 298 60 310 Z" />
        <path d="M 62 285 C 72 272 88 278 86 290 C 78 294 70 292 62 285 Z" />
        <path d="M 66 260 C 52 248 56 234 68 230 C 70 242 74 250 66 260 Z" />
        <path d="M 78 245 C 90 232 104 240 100 252 C 92 254 84 252 78 245 Z" />
        <path d="M 88 222 C 82 208 92 198 102 202 C 102 212 98 218 88 222 Z" />
      </g>

      {/* Minimal Wire Hanger (Black Wire) */}
      <g id="rys-hanger" className="rys-stroke" strokeWidth="3.2">
        <path d="M 298 126 C 298 112 312 110 314 122 C 316 136 300 142 300 155" />
        <path d="M 300 155 L 244 196 L 356 196 Z" />
      </g>

      {/* Sprouting Leaf to Upper Right */}
      <g id="rys-sprouting-leaf" transform="translate(322, 142) rotate(-35)">
        <path d="M 0 0 C 15 -18 35 -15 48 0 C 35 15 15 18 0 0 Z" fill="#3A5534" />
        <path d="M 0 0 L 40 0" stroke="#F8F6F0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Monogram RYS */}
      <g id="rys-monogram">
        {/* Letter R: Classical serif */}
        <path d="M 205 195 L 235 195 L 235 204 L 225 204 L 225 292 L 238 292 L 238 301 L 195 301 L 195 292 L 205 292 Z" className="rys-dark" />
        <path d="M 225 204 L 255 204 C 275 204 286 215 286 230 C 286 246 274 256 254 256 L 225 256 Z M 225 214 L 225 246 L 252 246 C 265 246 272 240 272 230 C 272 220 264 214 252 214 Z" className="rys-dark" />
        <path d="M 246 254 L 274 292 C 282 303 292 306 305 305 L 305 296 C 295 296 288 292 282 284 L 256 248 Z" className="rys-dark" />

        {/* Letter Y: Pine Green (Centered) */}
        <path d="M 276 198 L 298 245 L 306 245 L 288 198 Z" className="rys-pine" />
        <path d="M 324 198 L 294 258 L 294 306 L 306 306 L 306 258 L 336 198 Z" className="rys-pine" />
        <rect x="270" y="196" width="18" height="3" className="rys-pine" />
        <rect x="322" y="196" width="18" height="3" className="rys-pine" />
        <rect x="290" y="304" width="20" height="3" className="rys-pine" />

        {/* Letter S: Classical serif on the right */}
        <path d="M 374 215 C 370 205 358 198 344 198 C 328 198 316 208 316 222 C 316 236 326 242 344 248 C 365 254 378 262 378 278 C 378 296 362 308 342 308 C 324 308 312 298 308 285 L 318 281 C 322 292 331 298 342 298 C 354 298 365 290 365 278 C 365 264 354 258 335 252 C 316 245 304 237 304 222 C 304 207 318 198 338 198 C 352 198 362 204 366 212 Z" className="rys-dark" />
      </g>

      {/* Typography: R E B O R N */}
      <text x="300" y="385" className="rys-title">REBORN</text>

      {/* Typography: — YOUR STYLE — */}
      <text x="300" y="426" className="rys-subtitle">— YOUR STYLE —</text>

      {/* Delicate Open Heart Outline ♡ */}
      <path d="M 300 464 C 298 460 292 452 284 452 C 274 452 268 460 268 470 C 268 482 282 494 300 505 C 318 494 332 482 332 470 C 332 460 326 452 316 452 C 308 452 302 460 300 464 Z" fill="none" stroke="#1B1E19" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
};
