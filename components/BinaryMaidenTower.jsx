export default function BinaryMaidenTower() {
  return (
    <svg viewBox="0 0 720 320" role="presentation" aria-hidden="true">
      <defs>
        <pattern id="maiden-binary-cream" width="48" height="18" patternUnits="userSpaceOnUse">
          <rect width="48" height="18" className="maiden-binary-pattern-base" />
          <text x="0" y="13" className="maiden-binary-text maiden-binary-text--cream">01011010</text>
        </pattern>
        <pattern id="maiden-binary-sage" width="48" height="18" patternUnits="userSpaceOnUse">
          <rect width="48" height="18" className="maiden-binary-pattern-base" />
          <text x="0" y="13" className="maiden-binary-text maiden-binary-text--sage">10100101</text>
        </pattern>
        <pattern id="maiden-binary-roof" width="48" height="18" patternUnits="userSpaceOnUse">
          <rect width="48" height="18" className="maiden-binary-pattern-base" />
          <text x="0" y="13" className="maiden-binary-text maiden-binary-text--roof">11001010</text>
        </pattern>
        <pattern id="maiden-binary-sea" width="52" height="18" patternUnits="userSpaceOnUse">
          <rect width="52" height="18" className="maiden-binary-pattern-base" />
          <text x="0" y="13" className="maiden-binary-text maiden-binary-text--sea">01010110</text>
        </pattern>
        <pattern id="maiden-binary-sea-deep" width="52" height="18" patternUnits="userSpaceOnUse">
          <rect width="52" height="18" className="maiden-binary-pattern-base" />
          <text x="0" y="13" className="maiden-binary-text maiden-binary-text--sea-deep">10101001</text>
        </pattern>
      </defs>

      <g className="maiden-binary-structure">
        <path d="M348 12v42" className="maiden-binary-spire" />
        <path d="M351 20l29 8-29 11z" fill="url(#maiden-binary-roof)" />

        <path d="M324 68h48l-8-17h-32z" fill="url(#maiden-binary-sage)" />
        <rect x="320" y="68" width="56" height="31" fill="url(#maiden-binary-cream)" />
        <rect x="312" y="96" width="72" height="10" fill="url(#maiden-binary-sage)" />

        <path d="M294 143c3-39 23-58 54-58s51 19 54 58z" fill="url(#maiden-binary-cream)" />
        <path d="M286 143h124v15H286z" fill="url(#maiden-binary-sage)" />
        <path d="M297 158h102v61H297z" fill="url(#maiden-binary-cream)" />
        <path d="M309 168h25v26h-25zm53 0h25v26h-25z" fill="url(#maiden-binary-sage)" />
        <path d="M303 203h90v16h-90z" fill="url(#maiden-binary-roof)" />

        <path d="M150 230l64-31h315l54 31z" fill="url(#maiden-binary-roof)" />
        <path d="M166 230h399v55H166z" fill="url(#maiden-binary-cream)" />
        <path d="M244 242l63-31 65 31z" fill="url(#maiden-binary-roof)" />
        <path d="M252 242h112v43H252z" fill="url(#maiden-binary-sage)" />
        <path d="M189 244h29v27h-29zm55 0h29v27h-29zm150 0h29v27h-29zm55 0h29v27h-29zm55 0h29v27h-29z" fill="url(#maiden-binary-sage)" />
        <path d="M70 282c70-18 139-12 209-3 86 11 167 9 239-2 60-9 103-7 142 5l-25 18H91z" fill="url(#maiden-binary-sage)" />
      </g>

      <g className="maiden-binary-water">
        <path d="M22 282c83-18 151 19 238 2s151-15 236 1 133 8 202-4v17H22z" fill="url(#maiden-binary-sea)" />
        <path d="M0 297c91-13 154 15 241 2s160-15 249 0 148 8 230-5v17H0z" fill="url(#maiden-binary-sea-deep)" />
        <path d="M35 311c75-9 142 10 221 2s146-10 226 0 140 8 203-2v9H35z" fill="url(#maiden-binary-sea)" />
      </g>
    </svg>
  )
}
