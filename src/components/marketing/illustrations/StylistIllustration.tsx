interface Props {
  className?: string
  width?: number | string
  height?: number | string
}

export function StylistIllustration({
  className,
  width = 600,
  height = 600,
}: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Illustration of a stylist braiding a client's hair"
    >
      {/* ─── BACKGROUND ─── */}
      <g id="background">
        <rect width="600" height="600" fill="#FAF7F2" />
        {/* Warm floor wash */}
        <path d="M0,468 Q300,452 600,468 L600,600 L0,600 Z" fill="#F2D9C8" opacity="0.32" />
        {/* Subtle wall/floor divide */}
        <path d="M0,468 Q300,452 600,468" stroke="#E8B5A8" strokeWidth="1" fill="none" opacity="0.4" />
      </g>

      {/* ─── SHELF + PRODUCT BOTTLES (background detail, top-right) ─── */}
      <g id="shelf">
        <rect x="470" y="148" width="102" height="5" rx="2.5" fill="#8B5638" opacity="0.3" />
        <rect x="566" y="148" width="4" height="44" rx="2" fill="#8B5638" opacity="0.28" />
        {/* Product 1 — red */}
        <rect x="494" y="116" width="14" height="32" rx="3" fill="#FC6161" opacity="0.82" />
        <rect x="497" y="109" width="8" height="9" rx="2.5" fill="#FC6161" />
        <rect x="496" y="119" width="3.5" height="17" rx="1.5" fill="#FAF7F2" opacity="0.28" />
        {/* Product 2 — gold */}
        <rect x="515" y="120" width="13" height="28" rx="3" fill="#C9974A" opacity="0.78" />
        <rect x="518" y="113" width="7" height="9" rx="2.5" fill="#C9974A" />
        <rect x="516" y="123" width="3" height="14" rx="1.5" fill="#FAF7F2" opacity="0.24" />
        {/* Product 3 — dark */}
        <rect x="535" y="124" width="10" height="24" rx="3" fill="#4A2C1A" opacity="0.55" />
        <rect x="537" y="117" width="6" height="9" rx="2" fill="#4A2C1A" opacity="0.55" />
      </g>

      {/* ─── PLANT (bottom-left) ─── */}
      <g id="plant">
        {/* Leaves */}
        <path d="M68,524 Q52,496 32,474 Q54,482 68,508" fill="#9CA88E" />
        <path d="M68,524 Q48,505 26,510 Q46,500 68,516" fill="#9CA88E" opacity="0.7" />
        <path d="M68,524 Q84,494 108,472 Q90,484 68,508" fill="#9CA88E" />
        <path d="M68,524 Q86,506 112,512 Q92,502 68,516" fill="#9CA88E" opacity="0.7" />
        <path d="M68,524 Q65,498 70,472 Q74,495 70,522" fill="#9CA88E" opacity="0.6" />
        {/* Pot rim */}
        <rect x="50" y="520" width="44" height="7" rx="3.5" fill="#C9974A" />
        {/* Pot body */}
        <path d="M54,527 L52,564 L84,564 L82,527 Z" fill="#C9974A" />
        {/* Pot shading */}
        <path d="M54,554 L84,554 L84,564 L52,564 Z" fill="#4A2C1A" opacity="0.16" />
        {/* Saucer */}
        <ellipse cx="68" cy="565" rx="22" ry="4.5" fill="#8B5638" opacity="0.24" />
      </g>

      {/* ─── SALON CHAIR ─── */}
      <g id="chair">
        {/* Backrest */}
        <path d="M308,302 Q304,292 306,418 L422,418 Q424,292 420,302 Q364,311 308,302 Z" fill="#E8B5A8" opacity="0.4" />
        <path d="M316,310 Q314,300 315,412 L415,412 Q416,300 414,310 Q364,318 316,310 Z" fill="#E8B5A8" opacity="0.38" />
        {/* Seat */}
        <path d="M292,418 Q288,440 308,446 L422,446 Q442,440 438,418 Z" fill="#E8B5A8" />
        <path d="M292,418 L310,424 L310,442 Q300,437 292,428 Z" fill="#4A2C1A" opacity="0.1" />
        {/* Legs */}
        <rect x="314" y="446" width="11" height="116" rx="4" fill="#8B5638" opacity="0.38" />
        <rect x="417" y="446" width="11" height="116" rx="4" fill="#8B5638" opacity="0.38" />
        {/* Footrest */}
        <rect x="314" y="532" width="114" height="6" rx="3" fill="#8B5638" opacity="0.3" />
      </g>

      {/* ─── STYLIST BODY ─── */}
      <g id="stylist-body">
        {/* Main torso — dark top */}
        <path
          d="M146,218 Q138,258 140,408 Q164,420 188,420 Q212,420 236,408 Q238,258 230,218 Q212,228 188,228 Q163,228 146,218 Z"
          fill="#0F0E0E"
        />
        {/* Subtle form highlight */}
        <path d="M150,224 Q143,264 144,390 Q150,398 156,394 Q148,345 151,270 Q151,246 150,224 Z" fill="#FAF7F2" opacity="0.055" />
        {/* Collar */}
        <path d="M168,215 Q178,208 188,208 Q198,208 210,215 Q198,222 188,224 Q178,222 168,215 Z" fill="#0F0E0E" />
        {/* Neck */}
        <path
          d="M175,192 Q171,177 173,215 Q180,224 188,224 Q196,224 203,215 Q205,177 201,192 Q196,205 188,205 Q180,205 175,192 Z"
          fill="#6B3F26"
        />
        <path d="M175,192 Q171,180 173,215 Q177,222 183,223 Q176,205 175,192 Z" fill="#4A2C1A" opacity="0.28" />
        {/* Hips */}
        <path d="M140,408 Q164,420 188,422 Q212,420 236,408 Q232,434 188,436 Q144,434 140,408 Z" fill="#0F0E0E" />
        {/* Legs */}
        <path d="M144,436 Q140,475 142,514 Q152,524 170,522 L170,436 Z" fill="#0F0E0E" />
        <path d="M232,436 Q236,475 234,514 Q224,524 206,522 L206,436 Z" fill="#0F0E0E" />
        {/* Shoes */}
        <path d="M136,514 Q124,524 120,538 Q130,548 150,546 Q166,542 168,530 Q158,522 140,514 Z" fill="#0F0E0E" />
        <path d="M240,514 Q252,524 256,538 Q246,548 226,546 Q210,542 208,530 Q218,522 234,514 Z" fill="#0F0E0E" />
        {/* Shoulders (visible on sides) */}
        <path d="M230,224 Q247,218 260,216 Q250,226 234,230 Z" fill="#0F0E0E" />
        <path d="M146,224 Q130,218 118,216 Q128,226 142,230 Z" fill="#0F0E0E" />
      </g>

      {/* ─── STYLIST ARMS ─── */}
      <g id="stylist-arms">
        {/* Right arm — sweeping right and up toward client hair, far side */}
        <path
          d="M230,228 Q254,216 278,200 Q302,184 328,164 Q310,178 286,196 Q262,214 236,228 Z"
          fill="#6B3F26"
        />
        <path
          d="M328,164 Q348,148 368,134 Q382,124 394,116 Q378,128 358,144 Q340,158 328,164 Z"
          fill="#6B3F26"
        />
        {/* Wrist + palm */}
        <path d="M394,116 Q404,108 416,104 Q424,101 428,106 Q420,114 410,120 Q398,126 394,116 Z" fill="#6B3F26" />
        {/* Fingers in hair */}
        <path d="M405,107 Q414,100 422,98" stroke="#6B3F26" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M410,114 Q418,108 426,106" stroke="#6B3F26" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M402,120 Q410,115 418,115" stroke="#6B3F26" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        {/* Knuckle detail */}
        <path d="M407,109 Q415,103 422,101" stroke="#4A2C1A" strokeWidth="1" fill="none" opacity="0.38" />
        {/* Arm shadow edge */}
        <path d="M230,232 Q254,222 278,207 Q268,214 248,226 Q238,232 230,232 Z" fill="#4A2C1A" opacity="0.18" />

        {/* Left arm — curving up and right toward center of hair */}
        <path
          d="M146,232 Q130,222 116,216 Q106,212 100,219 Q108,230 122,232 Q136,228 144,235 Z"
          fill="#6B3F26"
        />
        <path
          d="M146,234 Q158,216 175,198 Q194,180 216,162 Q236,145 258,130 Q238,146 218,166 Q196,186 174,206 Q158,222 146,234 Z"
          fill="#6B3F26"
        />
        {/* Forearm + wrist */}
        <path d="M258,130 Q272,120 288,112 Q298,106 306,108 Q298,118 286,126 Q272,134 258,130 Z" fill="#6B3F26" />
        {/* Hand / fingers */}
        <path d="M290,112 Q300,104 310,100" stroke="#6B3F26" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M294,119 Q304,112 313,110" stroke="#6B3F26" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M286,125 Q296,120 305,120" stroke="#6B3F26" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        {/* Knuckle */}
        <path d="M292,114 Q301,107 309,104" stroke="#4A2C1A" strokeWidth="1" fill="none" opacity="0.35" />
      </g>

      {/* ─── CLIENT BODY ─── */}
      <g id="client-body">
        {/* Torso — sage green top, 3/4 view */}
        <path
          d="M310,285 Q295,310 293,408 Q365,428 436,408 Q436,310 420,285 Q392,296 364,296 Q336,296 310,285 Z"
          fill="#9CA88E"
        />
        {/* Torso left-side shadow */}
        <path d="M310,285 Q297,312 295,390 Q302,398 310,392 Q302,345 310,296 Z" fill="#4A2C1A" opacity="0.14" />
        {/* Torso right-side form */}
        <path d="M420,288 Q434,314 434,392 Q428,400 420,394 Q428,348 420,296 Z" fill="#FAF7F2" opacity="0.09" />
        {/* Neckline */}
        <path d="M342,285 Q356,276 364,276 Q373,276 388,285 Q374,292 364,293 Q354,292 342,285 Z" fill="#4A2C1A" opacity="0.18" />
        {/* Neck */}
        <path
          d="M350,265 Q346,250 348,283 Q355,292 364,292 Q374,292 381,283 Q383,250 379,265 Q374,277 364,277 Q354,277 350,265 Z"
          fill="#6B3F26"
        />
        <path d="M350,265 Q346,252 348,283 Q352,290 358,291 Q350,275 350,265 Z" fill="#4A2C1A" opacity="0.26" />
        {/* Shoulders */}
        <path d="M293,322 Q278,328 268,336 L268,320 Q283,308 310,285 Z" fill="#9CA88E" />
        <path d="M435,322 Q450,328 460,336 L460,320 Q445,308 420,285 Z" fill="#9CA88E" />
        {/* Hips / lap */}
        <path d="M293,408 Q365,428 436,408 Q434,432 364,436 Q294,432 293,408 Z" fill="#1A1010" />
        {/* Legs */}
        <path d="M293,432 Q288,468 290,506 Q305,516 330,514 L348,514 L348,450 Q334,430 293,432 Z" fill="#1A1010" />
        <path d="M436,432 Q441,468 438,506 Q423,516 398,514 L380,514 L380,450 Q395,430 436,432 Z" fill="#1A1010" />
        {/* Shoes */}
        <path d="M282,506 Q268,516 264,530 Q272,542 294,539 Q310,536 312,524 Q302,514 286,506 Z" fill="#1A1010" />
        <path d="M444,506 Q458,516 462,530 Q454,542 432,539 Q416,536 414,524 Q424,514 440,506 Z" fill="#1A1010" />
      </g>

      {/* ─── CLIENT HAIR ─── (FOCAL POINT — render before face so face sits within) */}
      <g id="client-hair">
        {/* Main hair silhouette — large natural hair mass with organic edge */}
        <path
          d="M302,230
             Q288,212 284,190
             Q279,166 285,144
             Q292,122 306,108
             Q320,96 338,90
             Q354,84 370,84
             Q387,84 402,91
             Q418,99 430,114
             Q443,130 447,152
             Q451,174 448,197
             Q445,218 440,236
             Q435,252 428,264
             Q422,272 420,264
             Q427,250 430,230
             Q434,208 431,185
             Q427,160 412,143
             Q396,127 370,121
             Q344,116 322,130
             Q300,144 294,170
             Q288,194 296,220
             Q299,232 302,244
             Q304,254 301,262
             Q296,272 292,264
             Q288,252 290,238
             Q294,228 302,230
             Z"
          fill="#1A1010"
        />
        {/* Inner hair depth layer — warm dark brown */}
        <path
          d="M306,228
             Q294,210 292,190
             Q289,168 296,148
             Q304,128 320,114
             Q336,101 354,96
             Q370,91 386,96
             Q402,102 414,118
             Q426,134 429,158
             Q432,180 428,202
             Q424,220 416,236
             Q410,250 404,260
             Q402,268 400,260
             Q406,248 410,230
             Q414,210 412,188
             Q408,165 395,150
             Q381,135 362,130
             Q342,125 324,136
             Q306,148 300,172
             Q294,194 300,220
             Q302,232 306,228
             Z"
          fill="#2D1B14"
        />
        {/* Hair top highlight — sheen line across the crown */}
        <path d="M340,92 Q358,84 376,88 Q358,92 340,98 Z" fill="#2D1B14" opacity="0.55" />
        {/* Left-edge coil texture bumps */}
        <path d="M285,192 Q277,184 279,173 Q283,182 285,192 Z" fill="#2D1B14" opacity="0.55" />
        <path d="M282,212 Q274,204 276,194 Q280,203 282,212 Z" fill="#2D1B14" opacity="0.48" />
        <path d="M287,232 Q280,225 281,214 Q285,222 287,232 Z" fill="#2D1B14" opacity="0.45" />
        {/* Top-front separation — strands being parted */}
        <path d="M334,92 Q344,82 358,79 Q348,90 337,99 Q335,95 334,92 Z" fill="#1A1010" />
        <path d="M358,79 Q374,78 388,84 Q375,90 362,98 Q359,89 358,79 Z" fill="#2D1B14" opacity="0.85" />
        <path d="M390,86 Q404,94 415,108 Q402,111 390,110 Q388,100 390,86 Z" fill="#1A1010" />

        {/* ── Completed braids — right side (hanging down) ── */}
        <path d="M436,242 Q444,264 441,290 Q446,268 449,244 Q443,254 436,242 Z" fill="#1A1010" />
        <path d="M426,266 Q432,290 428,316 Q434,294 438,268 Q432,278 426,266 Z" fill="#1A1010" />
        <path d="M415,286 Q420,312 415,338 Q422,315 425,290 Q420,300 415,286 Z" fill="#1A1010" />
        <path d="M403,304 Q407,332 401,358 Q409,334 411,308 Q407,317 403,304 Z" fill="#1A1010" />
        {/* Braid chevron texture — right */}
        <path d="M437,252 Q441,260 445,252" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M436,264 Q440,272 444,264" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M435,276 Q439,284 443,276" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M426,278 Q430,286 434,278" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M425,290 Q429,298 433,290" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M424,302 Q428,310 432,302" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M414,298 Q418,306 422,298" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M413,310 Q417,318 421,310" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M412,322 Q416,330 420,322" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M402,316 Q406,324 410,316" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M401,328 Q405,336 409,328" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M400,340 Q404,348 408,340" stroke="#2D1B14" strokeWidth="1.2" fill="none" />

        {/* ── Completed braids — left side ── */}
        <path d="M296,244 Q290,268 288,294 Q294,270 300,246 Q298,246 296,244 Z" fill="#1A1010" />
        <path d="M292,268 Q286,292 285,318 Q291,296 297,272 Z" fill="#1A1010" />
        <path d="M288,296 Q284,320 283,346 Q289,324 294,300 Z" fill="#1A1010" />
        {/* Braid chevrons — left */}
        <path d="M291,255 Q295,263 299,255" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M290,267 Q294,275 298,267" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M288,279 Q292,287 296,279" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M287,292 Q291,300 295,292" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M286,305 Q290,313 294,305" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
        <path d="M284,318 Q288,326 292,318" stroke="#2D1B14" strokeWidth="1.2" fill="none" />
      </g>

      {/* ─── STYLIST HEAD ─── */}
      <g id="stylist-head">
        {/* Head shape — 3/4 view facing right (toward client) */}
        <path
          d="M161,95
             Q154,112 153,132
             Q153,154 164,170
             Q176,184 194,186
             Q212,185 224,172
             Q236,158 237,136
             Q237,112 228,96
             Q217,78 198,76
             Q178,76 167,87
             Q164,90 161,95
             Z"
          fill="#6B3F26"
        />
        {/* Face plane — right/front side lighter */}
        <path
          d="M198,76
             Q217,78 228,97
             Q237,114 236,138
             Q234,160 221,174
             Q213,183 202,186
             Q218,174 224,154
             Q230,132 228,110
             Q221,92 207,82
             Z"
          fill="#8B5638"
        />
        {/* Left-cheek / temple shadow */}
        <path
          d="M161,98
             Q153,116 153,136
             Q153,156 162,170
             Q169,180 180,184
             Q168,170 164,150
             Q159,130 161,108
             Z"
          fill="#4A2C1A"
          opacity="0.26"
        />
        {/* Left ear */}
        <path d="M152,126 Q143,130 142,141 Q142,151 152,153 Q149,143 150,134 Z" fill="#6B3F26" />
        <path d="M152,128 Q145,132 145,141 Q145,149 152,151 Q149,143 150,135 Z" fill="#8B5638" opacity="0.45" />

        {/* ── Stylist hair — natural puff at crown ── */}
        <path
          d="M159,92
             Q152,74 155,55
             Q159,40 174,32
             Q186,26 200,27
             Q215,27 225,37
             Q236,49 236,65
             Q237,78 230,91
             Q222,80 214,73
             Q200,64 186,66
             Q173,68 165,79
             Q162,85 159,92
             Z"
          fill="#1A1010"
        />
        <path
          d="M162,90
             Q157,74 160,57
             Q165,43 178,36
             Q189,30 200,31
             Q213,31 222,41
             Q231,53 230,68
             Q228,81 225,90
             Q217,78 209,71
             Q198,62 186,64
             Q173,66 165,77
             Z"
          fill="#2D1B14"
        />
        {/* Crown highlight */}
        <path d="M184,30 Q198,26 210,31 Q197,29 184,30 Z" fill="#2D1B14" opacity="0.5" />
        {/* Sideburns */}
        <path d="M159,92 Q152,98 150,110 Q153,100 159,92 Z" fill="#1A1010" />
        <path d="M230,91 Q237,97 237,110 Q234,99 230,91 Z" fill="#1A1010" />

        {/* ── Facial features — 3/4 right view ── */}
        {/* Far eye (left) — partial */}
        <path d="M165,124 Q170,119 178,120 Q177,126 170,127 Q165,126 165,124 Z" fill="#1A1010" />
        <path d="M165,123 Q171,119 178,120" stroke="#1A1010" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        {/* Near eye (right) — full */}
        <path d="M197,120 Q205,115 214,116 Q212,124 205,124 Q197,124 197,120 Z" fill="#1A1010" />
        <path d="M197,120 Q205,115 214,116" stroke="#1A1010" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {/* Eye whites hint */}
        <path d="M199,121 Q205,117 212,117" stroke="#FAF7F2" strokeWidth="0.7" fill="none" opacity="0.55" />
        {/* Eyebrows */}
        <path d="M161,119 Q170,114 182,115" stroke="#1A1010" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M194,116 Q203,111 214,112" stroke="#1A1010" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* Nose tip / profile — right side */}
        <path d="M223,143 Q228,148 226,155 Q221,159 217,156 Q220,150 221,144 Z" fill="#4A2C1A" opacity="0.36" />
        <path d="M217,156 Q214,160 216,163 Q221,162 222,158" fill="#4A2C1A" opacity="0.32" />
        {/* Lips */}
        <path d="M196,163 Q205,158 212,159 Q220,158 227,163 Q235,167 236,170 Q227,166 218,165 Q208,164 196,163 Z" fill="#4A2C1A" />
        <path d="M196,163 Q208,174 218,174 Q226,171 236,170 Q228,175 217,177 Q207,176 196,163 Z" fill="#4A2C1A" />
        <path d="M202,167 Q210,172 217,170" fill="none" stroke="#6B3F26" strokeWidth="1" opacity="0.38" />
        {/* Cheekbone highlight */}
        <path d="M219,133 Q228,138 228,148 Q223,140 219,133 Z" fill="#8B5638" opacity="0.22" />
      </g>

      {/* ─── CLIENT HEAD & FACE ─── */}
      <g id="client-head">
        {/* Head shape — 3/4 left view (facing toward stylist) */}
        <path
          d="M328,210
             Q320,228 320,254
             Q322,276 338,290
             Q354,302 372,302
             Q392,300 406,286
             Q420,270 423,248
             Q425,222 417,202
             Q406,180 387,170
             Q368,162 350,167
             Q332,173 328,192
             Q326,200 328,210
             Z"
          fill="#6B3F26"
        />
        {/* Face plane — left/front side */}
        <path
          d="M328,213
             Q322,232 323,256
             Q326,278 342,292
             Q358,304 372,302
             Q355,289 348,268
             Q342,247 344,223
             Q345,202 352,189
             Q343,190 337,200
             Q331,206 328,213
             Z"
          fill="#8B5638"
        />
        {/* Right-temple shadow */}
        <path
          d="M404,174
             Q418,190 422,212
             Q426,234 418,256
             Q413,272 402,284
             Q414,272 418,252
             Q423,230 418,208
             Q413,188 404,174
             Z"
          fill="#4A2C1A"
          opacity="0.21"
        />
        {/* Under-chin shadow */}
        <path d="M338,294 Q354,305 372,304 Q354,306 336,298 Z" fill="#4A2C1A" opacity="0.16" />

        {/* Right ear */}
        <path d="M422,240 Q432,244 432,256 Q432,267 422,270 Q424,260 424,250 Z" fill="#6B3F26" />
        <path d="M422,242 Q429,246 429,256 Q429,265 422,268 Q424,260 424,251 Z" fill="#8B5638" opacity="0.45" />
        {/* Gold hoop earring */}
        <circle cx="427" cy="272" r="9" fill="none" stroke="#C9974A" strokeWidth="2.8" />
        <path d="M421,267 Q418,272 421,277" stroke="#FAF7F2" strokeWidth="1.1" fill="none" opacity="0.45" />

        {/* ── Facial features — 3/4 left view ── */}
        {/* Far eye (right) — partial */}
        <path d="M384,232 Q391,226 400,228 Q398,235 391,236 Q384,235 384,232 Z" fill="#1A1010" />
        <path d="M384,231 Q391,226 400,228" stroke="#1A1010" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        {/* Near eye (left) — fuller */}
        <path d="M345,230 Q352,224 362,225 Q360,233 353,234 Q345,233 345,230 Z" fill="#1A1010" />
        <path d="M345,230 Q353,224 362,225" stroke="#1A1010" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {/* Eye whites hint */}
        <path d="M347,231 Q353,227 360,226" stroke="#FAF7F2" strokeWidth="0.7" fill="none" opacity="0.52" />
        {/* Eyebrows — strong and arched */}
        <path d="M341,224 Q352,218 364,219" stroke="#1A1010" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M382,226 Q391,220 401,221" stroke="#1A1010" strokeWidth="2.1" fill="none" strokeLinecap="round" />
        {/* Nose — left-side profile (3/4 left) */}
        <path d="M336,254 Q330,259 332,266 Q338,270 344,267 Q340,261 341,256 Z" fill="#4A2C1A" opacity="0.4" />
        <path d="M332,266 Q329,270 331,274 Q337,272 338,268" fill="#4A2C1A" opacity="0.36" />
        {/* Lips — full and well-shaped */}
        <path
          d="M342,280 Q350,274 360,276 Q370,274 381,280 Q390,283 394,287
             Q383,282 368,282 Q354,282 342,280 Z"
          fill="#4A2C1A"
        />
        <path
          d="M342,280 Q356,292 366,293 Q378,292 381,288 Q394,287 386,294
             Q374,302 364,302 Q352,300 342,280 Z"
          fill="#4A2C1A"
        />
        <path d="M348,284 Q360,290 373,288" fill="none" stroke="#6B3F26" strokeWidth="1.2" opacity="0.42" />
        {/* Philtrum hint */}
        <path d="M362,276 Q360,271 360,267" stroke="#4A2C1A" strokeWidth="0.9" fill="none" opacity="0.28" />
        {/* Cheekbone highlight */}
        <path d="M337,246 Q332,254 334,262 Q334,252 337,246 Z" fill="#8B5638" opacity="0.2" />
      </g>

      {/* ─── BRAID DETAIL + HANDS IN HAIR ─── */}
      <g id="braid-detail">
        {/* Hair partition / section being split — visible at crown */}
        <path d="M335,95 Q346,83 360,80 Q350,92 339,102 Q337,98 335,95 Z" fill="#2D1B14" opacity="0.6" />
        <path d="M362,80 Q376,80 390,87 Q377,94 364,101 Q361,91 362,80 Z" fill="#1A1010" />
        <path d="M392,89 Q405,97 415,112 Q402,115 391,113 Q389,102 392,89 Z" fill="#2D1B14" opacity="0.6" />

        {/* Gold hair clip / pin at parting point */}
        <rect x="366" y="92" width="16" height="5" rx="2.5" fill="#C9974A" />
        <rect x="368" y="90" width="12" height="3.5" rx="1.5" fill="#C9974A" opacity="0.65" />
        {/* Pin shine */}
        <rect x="368" y="93" width="4" height="2" rx="1" fill="#FAF7F2" opacity="0.45" />

        {/* Right-hand fingers (stylist's far arm) visible in hair */}
        <path d="M406,104 Q416,97 425,95" stroke="#6B3F26" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M410,112 Q420,106 428,104" stroke="#6B3F26" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M403,120 Q412,115 421,115" stroke="#6B3F26" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Knuckle detail */}
        <path d="M408,106 Q417,100 425,98" stroke="#4A2C1A" strokeWidth="1.1" fill="none" opacity="0.36" />
        <path d="M411,114 Q420,109 427,107" stroke="#4A2C1A" strokeWidth="1.1" fill="none" opacity="0.32" />

        {/* Left-hand fingers (stylist's near arm) */}
        <path d="M295,102 Q306,94 316,92" stroke="#6B3F26" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M298,110 Q309,103 319,101" stroke="#6B3F26" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M292,118 Q302,113 312,113" stroke="#6B3F26" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Knuckle */}
        <path d="M297,104 Q307,97 316,95" stroke="#4A2C1A" strokeWidth="1.1" fill="none" opacity="0.34" />
      </g>
    </svg>
  )
}
