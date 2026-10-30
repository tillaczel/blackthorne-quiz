// The scene each scare leaves behind, looping until the host moves on. Loaded after scares.js.

// Aftermath scenes, group a: gurney, invoice, lights, syringe, duck, cctv, eye, xray
{
  const pick = (en, de) => (language === 'de' ? de : en);
  const svg = (inner) => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">${inner}</svg>`;

  // ---- gurney: empty hallway, tipped gurney, one wheel still turning
  AFTERMATHS.gurney = () => {
    const wheel = (x, spin, cls = '') => `<g transform="translate(${x} 128)"><circle r="30" fill="#14181a" stroke="#3a4144" stroke-width="5"/>
      <g class="${spin ? 'gurney-spin' : ''}"><circle r="22" fill="none" stroke="#7d8588" stroke-width="3"/><path d="M-22 0H22M0-22V22M-15-15L15 15M15-15L-15 15" stroke="#9aa1a3" stroke-width="3"/><circle r="6" fill="#c9cfd0"/></g></g>`;
    const doors = [0, 1, 2, 3].map((i) => {
      const x = 90 + i * 150;
      return `<path d="M${x} ${330 + i * 14}V${650 - i * 22}L${x + 100} ${620 - i * 30}V${355 + i * 12}z" fill="#10171a" stroke="#27323a" stroke-width="4"/>
              <path d="M${1510 - i * 150} ${330 + i * 14}V${650 - i * 22}L${1410 - i * 150} ${620 - i * 30}V${355 + i * 12}z" fill="#10171a" stroke="#27323a" stroke-width="4"/>`;
    }).join('');
    return svg(`<defs>
      <linearGradient id="aa-g-wall" x1="0" x2="1"><stop offset="0" stop-color="#0b1013"/><stop offset=".5" stop-color="#1d292e"/><stop offset="1" stop-color="#0b1013"/></linearGradient>
      <linearGradient id="aa-g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2327"/><stop offset="1" stop-color="#05080a"/></linearGradient>
      <radialGradient id="aa-g-light" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d8f0e4" stop-opacity=".55"/><stop offset="1" stop-color="#d8f0e4" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#070b0d"/>
    <path d="M0 0H1600V900H0z" fill="url(#aa-g-wall)"/>
    <path d="M0 0L700 330H900L1600 0z" fill="#0a1013"/>
    <path d="M0 900L700 450H900L1600 900z" fill="url(#aa-g-floor)"/>
    <rect x="700" y="330" width="200" height="120" fill="#0d1519"/>
    <g opacity=".9">${doors}</g>
    <path d="M60 760L700 450M1540 760L900 450" stroke="#2b373d" stroke-width="3" opacity=".6"/>
    <g class="gurney-lamp"><rect x="740" y="60" width="120" height="14" rx="6" fill="#cfd8d4"/><ellipse cx="800" cy="120" rx="360" ry="260" fill="url(#aa-g-light)"/></g>
    <ellipse class="gurney-pool" cx="800" cy="640" rx="520" ry="110" fill="#bfe5d6" opacity=".12"/>
    <g class="gurney-sheet"><path d="M560 705C650 735 760 690 860 730S1050 760 1160 735C1090 782 960 786 860 770S660 790 540 745z" fill="#c9cdc2" opacity=".9"/><path d="M640 735C740 740 860 725 960 750" stroke="#8d9288" stroke-width="3" fill="none"/></g>
    <ellipse cx="430" cy="768" rx="330" ry="26" fill="#000" opacity=".5"/>
    <g transform="translate(430 640) rotate(166)">
      <rect x="-280" y="-64" width="560" height="52" rx="10" fill="#d9dccf"/>
      <rect x="-280" y="-14" width="560" height="12" fill="#6e777a"/>
      <path d="M-280 -12V-26" stroke="#bbb" stroke-width="2"/>
      <path d="M-210 -2V128M210 -2V128M-110 -2V128M110 -2V128" stroke="#59646a" stroke-width="10"/>
      ${wheel(-210, false)}${wheel(-110, true)}${wheel(110, false)}${wheel(210, false)}
    </g>
    <g class="gurney-sheet2"><path d="M470 770C400 795 330 790 260 812C340 830 440 820 520 790z" fill="#c9cdc2" opacity=".85"/></g>
    <rect class="gurney-dim" width="1600" height="900" fill="#02070a"/>
    <rect width="1600" height="900" fill="url(#aa-vig)"/>`).replace('</defs>', '<radialGradient id="aa-vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient></defs>');
  };

  // ---- invoice: pinned to a dark wall, swaying, stamp pulsing, bare bulb
  AFTERMATHS.invoice = () => {
    const rows = [
      [pick('Fright treatment', 'Schreckbehandlung'), 'CHF 450.--'],
      [pick('Screaming surcharge', 'Schreizuschlag'), 'CHF 80.--'],
      ['Total', 'CHF 530.--'],
    ];
    return svg(`<defs>
      <radialGradient id="aa-i-light" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd98a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
      <radialGradient id="aa-i-vig" cx=".5" cy=".5" r=".75"><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#14100e"/>
    <g stroke="#241c18" stroke-width="3" opacity=".8">${Array.from({ length: 10 }, (_, i) => `<path d="M0 ${60 + i * 90}H1600"/>`).join('')}${Array.from({ length: 22 }, (_, i) => `<path d="M${(i * 150 + (i % 2) * 75) % 1650} ${60 + (i % 10) * 90}v90"/>`).join('')}</g>
    <path d="M980 0C990 160 960 300 990 460" stroke="#2c1a14" stroke-width="6" fill="none" opacity=".6"/>
    <g transform="translate(1260 0)"><g class="invoice-bulb"><path d="M0 0V250" stroke="#050505" stroke-width="5"/><rect x="-14" y="248" width="28" height="30" fill="#2a2a2a"/><ellipse cx="0" cy="304" rx="26" ry="32" fill="#ffe3a0"/><ellipse class="invoice-glow" cx="0" cy="304" rx="420" ry="380" fill="url(#aa-i-light)"/></g></g>
    <g transform="translate(500 110)"><g class="invoice-paper">
      <rect x="6" y="10" width="600" height="640" fill="#000" opacity=".5"/>
      <rect width="600" height="640" fill="#e4d9bd"/>
      <path d="M0 0H600V640H0z" fill="none" stroke="#b9ab88" stroke-width="3"/>
      <circle cx="300" cy="22" r="10" fill="#7b1715"/><circle cx="237" cy="19" r="3" fill="#c9625a"/>
      <text x="40" y="100" font-family="var(--type)" font-size="40" fill="#11140f">${pick('INVOICE', 'RECHNUNG')}</text>
      <text x="40" y="132" font-family="var(--type)" font-size="20" fill="#3a3a30">Blackthorne Institute</text>
      <text x="560" y="100" text-anchor="end" font-family="var(--type)" font-size="20" fill="#3a3a30">Nr. 0666</text>
      <path d="M40 160H560" stroke="#11140f" stroke-width="2"/>
      <text x="40" y="205" font-family="var(--type)" font-size="20" fill="#11140f">${pick('Patient: you', 'Patient: Sie')}</text>
      ${rows.map(([a, b], i) => `<text x="40" y="${275 + i * 52}" font-family="var(--type)" font-size="20" fill="#11140f"${i === 2 ? ' font-weight="700"' : ''}>${a}</text><text x="560" y="${275 + i * 52}" text-anchor="end" font-family="var(--type)" font-size="20" fill="#11140f">${b}</text>`).join('')}
      <path d="M40 398H560" stroke="#11140f" stroke-width="2"/>
      <text x="40" y="425" font-family="var(--type)" font-size="18" fill="#4a4a3c">${pick('Not covered by your insurance.', 'Von Ihrer Versicherung nicht gedeckt.')}</text>
      <rect x="40" y="520" width="90" height="90" fill="none" stroke="#11140f" stroke-width="3" stroke-dasharray="10 6"/>
      <g class="invoice-stamp" transform="translate(250 575) rotate(-10)"><rect x="-30" y="-44" width="250" height="124" fill="none" stroke="#9c1c18" stroke-width="7"/>
        <text x="95" y="-2" text-anchor="middle" font-family="var(--type)" font-size="38" fill="#9c1c18">${pick('PAID?', 'BEZAHLT?')}</text>
        <text x="95" y="52" text-anchor="middle" font-family="var(--type)" font-size="38" fill="#9c1c18">${pick('NO.', 'NEIN.')}</text></g>
    </g></g>
    <rect class="invoice-dim" width="1600" height="900" fill="#000"/>
    <rect width="1600" height="900" fill="url(#aa-i-vig)"/>`);
  };

  // ---- lights: scattered pairs of eyes in the dark
  AFTERMATHS.lights = () => {
    const spots = [[210, 190, 1], [470, 560, 0.8], [330, 760, 1.2], [690, 250, 0.7], [820, 640, 1.4], [980, 170, 0.9], [1150, 470, 1.1], [1340, 260, 0.8], [1420, 690, 1.3], [1010, 790, 0.7], [90, 470, 0.9], [610, 420, 0.6], [1230, 120, 0.7], [1500, 480, 0.8], [760, 90, 0.6], [550, 130, 1]];
    const hues = ['#f2e9a0', '#9fe0a8', '#e8f0ee', '#e0a070', '#c9f0f0', '#f0b8a8'];
    const kinds = ['blink', 'close', 'blink', 'fade'];
    const pairs = spots.map(([x, y, s], i) => {
      const dur = (5.3 + ((i * 3.7) % 7.9)).toFixed(1);
      const delay = (-((i * 2.9) % 11)).toFixed(1);
      const gap = 28 * s;
      const eye = (cx) => `<ellipse cx="${cx}" cy="0" rx="${(11 * s).toFixed(1)}" ry="${(7 * s).toFixed(1)}" fill="${hues[i % hues.length]}"/><ellipse cx="${cx}" cy="0" rx="${(3 * s).toFixed(1)}" ry="${(6 * s).toFixed(1)}" fill="#050505"/>`;
      return `<g transform="translate(${x} ${y})"><g class="lights-pair lights-${kinds[i % 4]}" style="animation-duration:${dur}s;animation-delay:${delay}s">${eye(-gap)}${eye(gap)}</g></g>`;
    }).join('');
    return svg(`<defs><radialGradient id="aa-l-fog" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3a4a52" stop-opacity=".35"/><stop offset="1" stop-color="#3a4a52" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="900" fill="#020304"/>
      <ellipse class="lights-fog" cx="500" cy="450" rx="700" ry="280" fill="url(#aa-l-fog)"/>
      <ellipse class="lights-fog2" cx="1100" cy="560" rx="650" ry="240" fill="url(#aa-l-fog)"/>
      ${pairs}`);
  };

  // ---- syringe: used syringe on a steel tray, drops into a pool
  AFTERMATHS.syringe = () => svg(`<defs>
      <linearGradient id="aa-s-tray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f7f87"/><stop offset=".5" stop-color="#aab8bd"/><stop offset="1" stop-color="#55646c"/></linearGradient>
      <radialGradient id="aa-s-vig" cx=".5" cy=".5" r=".75"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".88"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#0a0f12"/>
    <path d="M180 250L1420 250L1560 840L40 840z" fill="url(#aa-s-tray)"/>
    <path d="M230 295L1370 295L1480 790L120 790z" fill="#8a999f"/>
    <path d="M230 295L1370 295L1380 340L220 340z" fill="#5d6b72"/>
    <path d="M300 360H1300" stroke="#c6d2d6" stroke-width="3" opacity=".25"/>
    <ellipse cx="800" cy="650" rx="190" ry="50" fill="#3b0b0b"/>
    <ellipse cx="800" cy="646" rx="150" ry="34" fill="#5a0e0e"/>
    <ellipse cx="760" cy="640" rx="40" ry="8" fill="#a04040" opacity=".35"/>
    <g fill="none" stroke="#c9d9de" stroke-width="3"><ellipse class="syringe-ring syringe-ring1" cx="800" cy="646" rx="150" ry="34"/><ellipse class="syringe-ring syringe-ring2" cx="800" cy="646" rx="150" ry="34"/></g>
    <g fill="none" stroke="#c9d9de" stroke-width="3"><ellipse class="syringe-ringb" cx="800" cy="646" rx="150" ry="34"/></g>
    <g transform="translate(1039 103) rotate(125) scale(.8)">
      <rect x="-30" y="-24" width="360" height="48" rx="6" fill="#d9e4e6" opacity=".9"/>
      <rect x="40" y="-14" width="250" height="28" fill="#6d1111" opacity=".85"/>
      <path d="M60 -24V24M110 -24V24M160 -24V24M210 -24V24M260 -24V24" stroke="#26343a" stroke-width="2"/>
      <rect x="-70" y="-6" width="60" height="12" fill="#b9c7cb"/><rect x="-86" y="-34" width="14" height="68" rx="4" fill="#cdd9dc"/>
      <rect x="326" y="-40" width="10" height="80" rx="4" fill="#cdd9dc"/>
      <rect x="336" y="-16" width="30" height="32" fill="#2e8aa0" opacity=".9"/>
      <path d="M366 0H520" stroke="#d6e0e3" stroke-width="5" stroke-linecap="round"/>
    </g>
        <circle class="syringe-drop" cx="800" cy="444" r="9" fill="#4a0b0b"/>
    <circle class="syringe-drop2" cx="800" cy="444" r="7" fill="#4a0b0b"/>
    <rect class="syringe-flicker" width="1600" height="900" fill="#cfe9ff"/>
    <rect class="syringe-dim" width="1600" height="900" fill="#000"/>
    <rect width="1600" height="900" fill="url(#aa-s-vig)"/>`);

  // ---- duck: nurse-cap duck rocking in a pool of light
  AFTERMATHS.duck = () => {
    const duck = DUCK.replace('<svg ', '<svg x="520" y="190" width="560" height="504" ');
    return svg(`<defs>
      <radialGradient id="aa-d-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2c8" stop-opacity=".75"/><stop offset=".6" stop-color="#fff2c8" stop-opacity=".22"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></radialGradient>
      <radialGradient id="aa-d-vig" cx=".5" cy=".5" r=".7"><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".95"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#08090a"/>
    <g stroke="#17130f" stroke-width="3" opacity=".9">${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${480 + i * 55}H1600"/>`).join('')}</g>
    <ellipse class="duck-pool" cx="800" cy="680" rx="640" ry="190" fill="url(#aa-d-pool)"/>
    <ellipse class="duck-shadow" cx="810" cy="688" rx="240" ry="26" fill="#000" opacity=".6"/>
    <g class="duck-rock"><g class="duck-wobble">${duck}</g></g>
    <rect width="1600" height="900" fill="url(#aa-d-vig)"/>`);
  };

  // ---- cctv: lost signal, static, rolling bar, REC dot
  AFTERMATHS.cctv = () => `<div class="cctv-screen">
      <div class="cctv-static"></div><div class="cctv-grain"></div><div class="cctv-lines"></div><div class="cctv-bar"></div>
      <div class="cctv-msg"><p>${pick('SIGNAL LOST', 'SIGNAL VERLOREN')}</p></div>
      <p class="cctv-tag cctv-cam">CAM 07</p>
      <p class="cctv-tag cctv-rec"><i></i>REC</p>
      <p class="cctv-tag cctv-place">${pick('WARD 3 EAST', 'STATION 3 OST')}</p>
      <div class="cctv-vig"></div>
    </div>`;

  // ---- eye: huge bloodshot eye, half closed
  AFTERMATHS.eye = () => {
    const open = 'M260 450Q800 100 1340 450Q800 800 260 450Z';
    const veins = ['M270 450Q420 430 560 400', 'M280 462Q400 480 520 520', 'M1330 450Q1180 420 1060 380', 'M1320 462Q1200 500 1090 540', 'M420 360Q470 410 500 450', 'M1180 350Q1130 410 1100 440', 'M560 580Q600 540 640 520', 'M1010 590Q990 550 960 520', 'M360 520Q450 560 470 610', 'M1250 520Q1160 570 1140 610', 'M700 250Q690 310 710 350', 'M900 250Q920 300 900 340'];
    return svg(`<defs>
      <clipPath id="aa-e-clip"><path d="${open}"/></clipPath>
      <radialGradient id="aa-e-white" cx=".5" cy=".5" r=".6"><stop offset=".45" stop-color="#efe1d2"/><stop offset=".8" stop-color="#d98d80"/><stop offset="1" stop-color="#6e140f"/></radialGradient>
      <radialGradient id="aa-e-iris" cx=".5" cy=".5" r=".5"><stop offset=".3" stop-color="#d6c13a"/><stop offset=".65" stop-color="#8d7d1b"/><stop offset=".92" stop-color="#3d3208"/><stop offset="1" stop-color="#150f02"/></radialGradient>
      <radialGradient id="aa-e-vig" cx=".5" cy=".5" r=".75"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#1a0e0c"/>
    <path d="M0 0H1600V900H0z" fill="#241310"/>
    <g class="eye-all">
      <path d="${open}" fill="url(#aa-e-white)"/>
      <g clip-path="url(#aa-e-clip)">
        <g fill="none" stroke="#b3140f" stroke-linecap="round" stroke-width="4" opacity=".85">${veins.map((d) => `<path d="${d}"/>`).join('')}</g>
        <g class="eye-look">
          <circle cx="800" cy="450" r="200" fill="url(#aa-e-iris)"/>
          <g stroke="#2c2405" stroke-width="2.5" opacity=".55">${Array.from({ length: 28 }, (_, i) => `<path d="M800 450L${(800 + 200 * Math.cos(i * 0.2244)).toFixed(0)} ${(450 + 200 * Math.sin(i * 0.2244)).toFixed(0)}"/>`).join('')}</g>
          <circle cx="800" cy="450" r="200" fill="none" stroke="#120d01" stroke-width="14"/>
          <circle class="eye-pupil" cx="800" cy="450" r="86" fill="#030303"/>
          <ellipse cx="730" cy="370" rx="42" ry="22" fill="#fff" opacity=".8" transform="rotate(-25 730 370)"/>
        </g>
        <path class="eye-lid" d="M-100 -200H1700V470Q800 280 -100 470Z" fill="#2a1512"/>
        <path class="eye-lower" d="M-100 1100H1700V560Q800 700 -100 560Z" fill="#2a1512"/>
        <path d="M260 450Q800 100 1340 450" stroke="#000" stroke-width="40" fill="none" opacity=".35"/>
      </g>
      <path d="${open}" fill="none" stroke="#0d0605" stroke-width="12"/>
    </g>
    <rect width="1600" height="900" fill="url(#aa-e-vig)"/>`);
  };

  // ---- xray: stuttering lightbox, empty film with a faint skull outline
  AFTERMATHS.xray = () => svg(`<defs>
      <radialGradient id="aa-x-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#cfe4ff" stop-opacity=".5"/><stop offset="1" stop-color="#cfe4ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="aa-x-vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#06090c"/>
    <ellipse class="xray-glow" cx="800" cy="450" rx="900" ry="560" fill="url(#aa-x-glow)"/>
    <rect x="300" y="110" width="1000" height="680" rx="14" fill="#1a1f23" stroke="#080a0c" stroke-width="10"/>
    <g class="xray-panel"><rect x="332" y="142" width="936" height="616" fill="#e5f0ff"/>
      <path d="M332 142H1268M332 450H1268" stroke="#c6d6ea" stroke-width="3"/></g>
    <g class="xray-film"><rect x="470" y="170" width="660" height="560" fill="#1c2a3a" opacity=".78"/>
      <rect x="470" y="170" width="660" height="560" fill="none" stroke="#0a121a" stroke-width="6"/>
      <g fill="#6a7482"><rect x="520" y="156" width="40" height="28" rx="4"/><rect x="1040" y="156" width="40" height="28" rx="4"/></g>
      <g class="xray-skull" fill="none" stroke="#b7cbe0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M800 230C690 230 630 310 640 400C645 450 670 480 690 500V560H910V500C930 480 955 450 960 400C970 310 910 230 800 230Z"/>
        <ellipse cx="742" cy="410" rx="40" ry="34"/><ellipse cx="858" cy="410" rx="40" ry="34"/>
        <path d="M800 450L780 500H820z"/><path d="M720 560V600H880V560M760 560V600M800 560V600M840 560V600"/>
      </g></g>
    <rect x="332" y="142" width="936" height="616" fill="none" stroke="#000" stroke-width="3" opacity=".4"/>
    <rect class="xray-dim" width="1600" height="900" fill="#000"/>
    <rect width="1600" height="900" fill="url(#aa-x-vig)"/>`);
}

// Aftermath scenes, group b: mirror, rip, file, surgeon, teeth, phew, crash, door.
{
  const L = (en, de) => (language === 'de' ? de : en);
  const svg = (inner) => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">${inner}</svg>`;

  // ---- mirror
  AFTERMATHS.mirror = () => {
    const word = L('TURN AROUND', 'HINTER IHNEN');
    const drips = Array.from({ length: 8 }, (_, i) => {
      const x = 540 + i * 74 + (i % 3) * 9;
      return `<line class="mi-drip" x1="${x}" y1="${350 + (i % 2) * 8}" x2="${x}" y2="${470 + ((i * 37) % 70)}" style="animation-duration:${(8 + ((i * 5) % 7) * 1.3).toFixed(1)}s;animation-delay:${-i * 1.7}s"/>`;
    }).join('');
    return svg(`<defs>
      <pattern id="abTile" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#34413f"/><path d="M0 0H80V80" fill="none" stroke="#1a2321" stroke-width="3"/></pattern>
      <linearGradient id="abGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f8285"/><stop offset=".55" stop-color="#3d4e51"/><stop offset="1" stop-color="#27363a"/></linearGradient>
      <radialGradient id="abVig" cx=".5" cy=".42" r=".75"><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#abTile)"/>
    <rect x="410" y="40" width="780" height="620" rx="16" fill="#1d2221" stroke="#0b0e0d" stroke-width="6"/>
    <rect x="440" y="70" width="720" height="560" rx="6" fill="url(#abGlass)"/>
    <path d="M440 520L700 70H820L440 420z" fill="#cfe4e6" opacity=".07"/>
    <rect class="mi-fog" x="440" y="70" width="720" height="560" rx="6" fill="#d8e6e6"/>
    <g class="mi-crack" fill="none" stroke="#e8f2f2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" opacity=".7">
      <path d="M980 250L890 330L820 300L740 390M890 330L930 440L880 520M980 250L1060 210L1120 120M980 250L1090 300L1150 280M820 300L760 220L690 190M740 390L600 410L520 480M930 440L1020 470L1100 560"/>
      <path d="M980 250L900 300L860 360" stroke-width="1.2"/><path d="M930 440L960 520L940 600" stroke-width="1.2"/>
    </g>
    <text class="mi-words" x="800" y="350" text-anchor="middle">${word}</text>
    <g class="mi-drips">${drips}</g>
    <rect x="300" y="700" width="1000" height="200" fill="#222b2a"/><rect x="300" y="694" width="1000" height="14" fill="#53605e"/>
    <path d="M560 760Q800 700 1040 760V900H560z" fill="#aab6b8" opacity=".14"/>
    <ellipse cx="800" cy="820" rx="250" ry="48" fill="#0f1514" stroke="#4a5755" stroke-width="5"/>
    <ellipse cx="800" cy="826" rx="215" ry="36" fill="#1b2526"/>
    <path d="M880 694V670Q880 650 860 650H800V690" fill="#9aa5a7" stroke="#2d3535" stroke-width="3"/>
    <rect x="770" y="640" width="64" height="16" rx="4" fill="#b4bfc1" stroke="#2d3535" stroke-width="3"/>
    <circle class="mi-ripple" cx="800" cy="830" r="90" fill="none" stroke="#9fb7c0" stroke-width="3"/>
    <circle class="mi-ripple2" cx="800" cy="830" r="90" fill="none" stroke="#9fb7c0" stroke-width="2"/>
    <ellipse class="mi-drop" cx="800" cy="722" rx="7" ry="10" fill="#cfe8f2"/>
    <rect width="1600" height="900" fill="url(#abVig)"/>
    <rect class="mi-dark" width="1600" height="900" fill="#000"/>`);
  };

  // ---- rip
  AFTERMATHS.rip = () => {
    const inkLines = (x, y, w) => [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x}" y="${y + i * 38}" width="${w - ((i * 53) % 130)}" height="7" rx="3" fill="#2a2a24" opacity=".45"/>`).join('');
    return svg(`<defs>
      <linearGradient id="abFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090706"/><stop offset="1" stop-color="#1c1713"/></linearGradient>
      <radialGradient id="abPool" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#e9e0c4" stop-opacity=".18"/><stop offset="1" stop-color="#e9e0c4" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#010101"/>
    <path d="M0 400L1600 400V900H0z" fill="url(#abFloor)"/>
    <ellipse cx="800" cy="650" rx="800" ry="300" fill="url(#abPool)"/>
    <g class="rp-eyes" fill="#f4f6ee">
      <g class="rp-eye"><ellipse cx="745" cy="235" rx="30" ry="14" transform="rotate(12 745 235)"/></g>
      <g class="rp-eye"><ellipse cx="855" cy="235" rx="30" ry="14" transform="rotate(-12 855 235)"/></g>
    </g>
    <ellipse cx="520" cy="790" rx="330" ry="26" fill="#000" opacity=".5"/><ellipse cx="1080" cy="800" rx="330" ry="26" fill="#000" opacity=".5"/>
    <g class="rp-left">
      <path d="M240 560L770 520L752 565L782 610L748 655L774 700L744 745L762 790L226 835z" fill="#d6ccb0" stroke="#7a705a" stroke-width="3" stroke-linejoin="round"/>
      ${inkLines(290, 580, 410)}
      <path class="rp-lip" d="M770 520L752 565L782 610L748 655L774 700L744 745L762 790L742 790L728 745L756 700L730 655L762 610L734 565L750 524z" fill="#f2ead2"/>
    </g>
    <g class="rp-right">
      <path d="M840 515L1370 545L1388 805L852 792L876 745L842 700L872 655L840 610L866 565z" fill="#d1c7aa" stroke="#7a705a" stroke-width="3" stroke-linejoin="round"/>
      ${inkLines(910, 590, 400)}
      <path class="rp-lip" d="M840 515L866 565L840 610L872 655L842 700L876 745L852 792L870 792L896 745L862 700L892 655L860 610L886 565L860 520z" fill="#efe6cc"/>
    </g>
    <rect width="1600" height="900" fill="#000" class="rp-dark"/>`);
  };

  // ---- file
  AFTERMATHS.file = () => {
    const lines = L(['PATIENT: YOU', 'DIAGNOSIS: INCURABLE', 'DISCHARGE: NEVER'], ['PATIENT: SIE', 'DIAGNOSE: UNHEILBAR', 'ENTLASSUNG: NIE']);
    const head = L('Blackthorne Institute / admission record', 'Blackthorne Institut / Aufnahmeprotokoll');
    const stamp = L('ADMITTED', 'AUFGENOMMEN');
    return svg(`<defs>
      <linearGradient id="abDesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#30221a"/><stop offset="1" stop-color="#150e0a"/></linearGradient>
      <radialGradient id="abLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b8ffc4" stop-opacity=".34"/><stop offset=".6" stop-color="#6fe08c" stop-opacity=".1"/><stop offset="1" stop-color="#6fe08c" stop-opacity="0"/></radialGradient>
      <radialGradient id="abVig2" cx=".5" cy=".5" r=".72"><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".92"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#abDesk)"/>
    <g stroke="#0c0705" stroke-width="2" opacity=".5"><path d="M0 150H1600M0 330H1600M0 520H1600M0 710H1600"/></g>
    <g transform="rotate(-4 800 480)">
      <rect x="505" y="205" width="600" height="560" fill="#ab9158" stroke="#4b3d20" stroke-width="4"/>
      <path d="M505 205V178H640L660 205z" fill="#9b834d" stroke="#4b3d20" stroke-width="4"/>
      <rect x="535" y="230" width="540" height="510" fill="#e0d8bd"/>
      <g class="fl-type" fill="#26231b">
        <text x="565" y="285" font-size="21">${head}</text>
        <text x="565" y="390" font-size="34">${lines[0]}</text>
        <text x="565" y="460" font-size="34">${lines[1]}</text>
        <text x="565" y="530" font-size="34">${lines[2]}</text>
      </g>
      <g transform="rotate(-11 820 640)"><rect x="620" y="590" width="400" height="100" fill="none" stroke="#a11f1b" stroke-width="9" opacity=".85" rx="6"/><text class="fl-stamp" x="820" y="663" text-anchor="middle" font-size="${language === 'de' ? 56 : 68}" fill="#a11f1b" opacity=".85">${stamp}</text></g>
    </g>
    <g class="fl-lamp">
      <ellipse cx="800" cy="450" rx="760" ry="470" fill="url(#abLamp)"/>
    </g>
    <g class="fl-fan"><g class="fl-spin">
      <g fill="#000" opacity=".3"><rect x="800" y="-40" width="560" height="80" rx="40"/><rect x="800" y="-40" width="560" height="80" rx="40" transform="rotate(90)"/><rect x="800" y="-40" width="560" height="80" rx="40" transform="rotate(180)"/><rect x="800" y="-40" width="560" height="80" rx="40" transform="rotate(270)"/><circle r="90"/></g></g></g>
    <g>
      <ellipse cx="170" cy="850" rx="120" ry="24" fill="#0b0b09"/>
      <path d="M170 840V560L250 330" fill="none" stroke="#1c2a21" stroke-width="16" stroke-linecap="round"/>
      <path d="M170 840V560L250 330" fill="none" stroke="#2a4a36" stroke-width="6" stroke-linecap="round"/>
      <path d="M160 330Q250 220 360 290L330 380Q240 400 160 330z" fill="#1f5c3c" stroke="#0a2015" stroke-width="5"/>
      <ellipse class="fl-bulb" cx="300" cy="372" rx="48" ry="16" fill="#d8ffd6"/>
    </g>
    <rect width="1600" height="900" fill="url(#abVig2)"/>
    <rect class="fl-dark" width="1600" height="900" fill="#000"/>`);
  };

  // ---- surgeon
  AFTERMATHS.surgeon = () => {
    const spatter = [[210, 160, 16], [250, 205, 8], [180, 240, 11], [1380, 120, 13], [1440, 180, 7], [1310, 90, 6], [1210, 260, 9], [300, 330, 5]]
      .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="#5c0e0c"/>`).join('');
    return svg(`<defs>
      <linearGradient id="abOR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1614"/><stop offset="1" stop-color="#050807"/></linearGradient>
      <radialGradient id="abPoolS" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e4fff6" stop-opacity=".5"/><stop offset=".6" stop-color="#bfece0" stop-opacity=".14"/><stop offset="1" stop-color="#bfece0" stop-opacity="0"/></radialGradient>
      <linearGradient id="abBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4fff6" stop-opacity=".28"/><stop offset="1" stop-color="#e4fff6" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#abOR)"/>
    <g opacity=".5">${spatter}<path d="M210 170V300M1380 130V230" stroke="#5c0e0c" stroke-width="4"/></g>
    <rect x="0" y="720" width="1600" height="180" fill="#080c0b"/>
    <g class="su-pool"><ellipse cx="800" cy="690" rx="560" ry="170" fill="url(#abPoolS)"/></g>
    <g>
      <rect x="520" y="560" width="560" height="42" rx="10" fill="#2c3a38" stroke="#4b5d5a" stroke-width="3"/>
      <rect x="760" y="602" width="80" height="128" fill="#1c2625"/><rect x="660" y="728" width="280" height="22" rx="6" fill="#1c2625"/>
      <path d="M560 560V520H1040V560" fill="#34433f" opacity=".7"/>
    </g>
    <g>
      <rect x="1180" y="620" width="260" height="14" fill="#4b5d5a"/><rect x="1196" y="634" width="12" height="150" fill="#2a3533"/><rect x="1412" y="634" width="12" height="150" fill="#2a3533"/>
      <rect x="1170" y="590" width="280" height="30" rx="5" fill="#8d9a98" stroke="#2c3736" stroke-width="3"/>
      <path d="M1220 600H1370L1396 586H1224z" fill="#c4cfcc"/><path d="M1224 586H1396" stroke="#e9f1ef" stroke-width="2"/>
      <path d="M1230 586l6-9 6 9 6-9 6 9 6-9 6 9 6-9 6 9 6-9 6 9 6-9 6 9" fill="none" stroke="#b9c4c1" stroke-width="3"/>
      <rect x="1380" y="580" width="60" height="12" rx="5" fill="#2a2a2a"/>
      <ellipse cx="1290" cy="607" rx="22" ry="5" fill="#6d1210"/>
    </g>
    <g class="su-beam"><path d="M780 420L820 420L1060 700H540z" fill="url(#abBeam)"/></g>
    <g class="su-swing">
      <path d="M800 0V190" stroke="#2c3736" stroke-width="12"/>
      <path d="M800 190V420" stroke="#1d2625" stroke-width="10"/>
      <ellipse cx="800" cy="420" rx="210" ry="52" fill="#aab6b4" stroke="#38433f" stroke-width="5"/>
      <ellipse cx="800" cy="432" rx="190" ry="34" fill="#e7fff7"/>
      <g fill="#fff" opacity=".9"><circle cx="800" cy="432" r="9"/><circle cx="740" cy="430" r="7"/><circle cx="860" cy="430" r="7"/><circle cx="690" cy="427" r="6"/><circle cx="910" cy="427" r="6"/></g>
      <ellipse cx="800" cy="372" rx="90" ry="22" fill="#798683"/>
    </g>
    <rect class="su-dark" width="1600" height="900" fill="#000"/>`);
  };

  // ---- teeth
  AFTERMATHS.teeth = () => {
    const row = (up) => Array.from({ length: 10 }, (_, i) => {
      const t = (i - 4.5) / 4.5;
      const x = i * 52 - 234;
      const y = (up ? 1 : -1) * t * t * 18;
      const h = up ? 78 - Math.abs(t) * 14 : 66 - Math.abs(t) * 12;
      return `<rect x="${x}" y="${up ? y : y - h}" width="46" height="${h}" rx="${up ? 14 : 13}" fill="#f2ecd8" stroke="#8a826a" stroke-width="3"/>`;
    }).join('');
    return svg(`<defs>
      <linearGradient id="abWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1410"/><stop offset="1" stop-color="#0a0706"/></linearGradient>
      <radialGradient id="abPoolT" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f1e1b8" stop-opacity=".3"/><stop offset="1" stop-color="#f1e1b8" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#abWood)"/>
    <g stroke="#050303" stroke-width="3" opacity=".7"><path d="M0 160H1600M0 340H1600M0 520H1600M0 700H1600M380 0V160M1100 160V340M600 340V520M1300 520V700M300 700V900"/></g>
    <ellipse class="te-pool" cx="800" cy="520" rx="640" ry="330" fill="url(#abPoolT)"/>
    <ellipse cx="800" cy="676" rx="320" ry="26" fill="#000" opacity=".55"/>
    <g transform="translate(800 560) scale(1.55) translate(-800 -540)"><g class="te-body">
      <g fill="#d7742a" stroke="#4a2205" stroke-width="4" transform="translate(0 -78)"><path d="M590 690Q560 720 520 712Q530 740 600 735z"/><path d="M1010 690Q1040 720 1080 712Q1070 740 1000 735z"/></g>
      <g transform="translate(800 520)">
        <g transform="translate(0 -50)"><g class="te-key" transform="translate(245 -8)">
          <rect x="-30" y="-5" width="70" height="10" fill="#b9a05a" stroke="#4a3b12" stroke-width="3"/>
          <g class="te-wing" fill="#c9b266" stroke="#4a3b12" stroke-width="3"><ellipse cx="46" cy="0" rx="26" ry="60"/></g>
        </g>
        <path d="M-264 0Q0 -44 264 0L264 14Q0 -30 -264 14z" fill="#d86a73" stroke="#6a1f26" stroke-width="4"/>
        <g>${row(true)}</g></g>
        <g class="te-jaw" transform="translate(0 70)">
          <g>${row(false)}</g>
          <path d="M-264 0Q0 44 264 0L264 -14Q0 30 -264 -14z" fill="#d86a73" stroke="#6a1f26" stroke-width="4"/>
          <path d="M-264 0Q0 44 264 0" fill="none" stroke="#6a1f26" stroke-width="2"/>
        </g>
      </g>
    </g>
    </g><rect class="te-dark" width="1600" height="900" fill="#000"/>`);
  };

  // ---- phew
  AFTERMATHS.phew = () => svg(`<defs>
      <radialGradient id="abBulb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0c4" stop-opacity=".95"/><stop offset=".12" stop-color="#ffd98a" stop-opacity=".55"/><stop offset=".5" stop-color="#b3772b" stop-opacity=".18"/><stop offset="1" stop-color="#b3772b" stop-opacity="0"/></radialGradient>
      <linearGradient id="abWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2c25"/><stop offset="1" stop-color="#14160f"/></linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#abWall)"/>
    <g stroke="#0c0d09" stroke-width="2" opacity=".5"><path d="M200 0V900M520 0V900M880 0V900M1240 0V900"/></g>
    <rect x="0" y="780" width="1600" height="120" fill="#0b0c08"/>
    <g class="ph-shadow"><path d="M630 305L1000 340L990 740L640 715z" fill="#000" opacity=".5"/></g>
    <g class="ph-note">
      <rect x="620" y="270" width="380" height="440" fill="#d9d1b4" stroke="#8a826a" stroke-width="3"/>
      <path d="M620 270H1000V300H620z" fill="#b9b196" opacity=".5"/>
      <text class="ph-text" x="810" y="520" text-anchor="middle" font-size="${language === 'de' ? 82 : 160}" fill="#8a1816">${L('Yet.', 'Noch nicht.')}</text>
      <circle cx="810" cy="296" r="13" fill="#6e1010" stroke="#2a0707" stroke-width="3"/>
    </g>
    <g class="ph-swing">
      <circle class="ph-glow" cx="800" cy="330" r="780" fill="url(#abBulb)"/>
      <path d="M800 0V280" stroke="#050505" stroke-width="5"/>
      <rect x="784" y="272" width="32" height="40" rx="6" fill="#2d2d29"/>
      <ellipse cx="800" cy="338" rx="24" ry="30" fill="#fff3cb"/>
    </g>
    <rect class="ph-dark" width="1600" height="900" fill="#000"/>`);

  // ---- crash
  AFTERMATHS.crash = () => `<div class="cr-screen">
      <p class="cr-boot">C:\\PATIENT&gt; reboot</p>
      <p class="cr-hello">${L('HELLO. I CAN SEE YOU.', 'HALLO. ICH SEHE SIE.')}<u></u></p>
      <i class="cr-bar"></i><i class="cr-lines"></i><i class="cr-dark"></i></div>`;

  // ---- door
  AFTERMATHS.door = () => {
    const foot = (x, y) => `<path transform="translate(${x} ${y})" d="M-26 0H26L30 12L48 120H-48L-30 12z" fill="#000" opacity=".82"/>`;
    const rivets = Array.from({ length: 10 }, (_, i) => `<circle cx="${590 + (i % 5) * 105 + 0}" cy="${i < 5 ? 80 : 740}" r="7" fill="#1d2120" stroke="#050606" stroke-width="2"/>`).join('');
    return svg(`<defs>
      <linearGradient id="abDoor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2d3331"/><stop offset=".5" stop-color="#3b4341"/><stop offset="1" stop-color="#262c2a"/></linearGradient>
      <linearGradient id="abSpill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dca0" stop-opacity=".55"/><stop offset="1" stop-color="#f3dca0" stop-opacity="0"/></linearGradient>
      <clipPath id="abGap"><rect x="486" y="774" width="628" height="126"/></clipPath>
    </defs>
    <rect width="1600" height="900" fill="#090a0a"/>
    <rect x="0" y="788" width="1600" height="112" fill="#0e1010"/>
    <rect x="480" y="40" width="640" height="748" fill="url(#abDoor)" stroke="#0a0c0b" stroke-width="8"/>
    <rect x="530" y="90" width="540" height="660" fill="none" stroke="#1b201f" stroke-width="5"/>
    <rect x="530" y="90" width="540" height="660" fill="none" stroke="#4b5754" stroke-width="1.5" opacity=".6" transform="translate(2 2)"/>
    ${rivets}
    <rect x="690" y="230" width="220" height="110" rx="6" fill="#1a1e1d" stroke="#0a0c0b" stroke-width="5"/>
    <rect x="700" y="240" width="200" height="90" fill="#2c3330" stroke="#4b5754" stroke-width="2"/>
    <rect class="dr-hatchlight" x="700" y="326" width="200" height="4" fill="#f3dca0"/>
    <rect x="984" y="460" width="46" height="90" rx="6" fill="#1b201f" stroke="#050606" stroke-width="3"/><circle cx="1007" cy="505" r="12" fill="#58625f"/>
    <text x="800" y="170" text-anchor="middle" font-size="64" fill="#7d8985" opacity=".55" class="dr-num">13</text>
    <g class="dr-spill"><path d="M500 788H1100L1320 900H280z" fill="url(#abSpill)"/></g>
    <g class="dr-slit"><rect x="486" y="778" width="628" height="10" fill="#fff0c4"/></g>
    <g clip-path="url(#abGap)"><g class="dr-feetA">${foot(0, 776)}${foot(110, 776)}</g>
      <g class="dr-feetB">${foot(0, 776)}${foot(120, 776)}</g></g>
    <rect class="dr-dark" width="1600" height="900" fill="#000"/>`);
  };
}

{
  const de = () => (typeof language !== 'undefined' && language === 'de');
  const SVG = (cls, inner) => `<svg class="${cls}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">${inner}</svg>`;
  const R = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / Math.max(1, n - 1));

  // ---- cat
  AFTERMATHS.cat = () => SVG('ac-cat', `<defs>
    <linearGradient id="ac-cat-door" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dfa8"/><stop offset="1" stop-color="#b8863f"/></linearGradient>
    <linearGradient id="ac-cat-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c37a" stop-opacity=".55"/><stop offset="1" stop-color="#e9c37a" stop-opacity="0"/></linearGradient>
    <radialGradient id="ac-cat-glow"><stop offset="0" stop-color="#8dff62" stop-opacity=".55"/><stop offset="1" stop-color="#8dff62" stop-opacity="0"/></radialGradient>
    <radialGradient id="ac-cat-vig" cx=".5" cy=".5" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></radialGradient></defs>
    <rect width="1600" height="900" fill="#08090b"/><rect y="780" width="1600" height="120" fill="#0c0b0a"/>
    <g class="cat-light"><polygon points="560,780 1040,780 1450,900 150,900" fill="url(#ac-cat-spill)"/>
      <rect x="560" y="110" width="480" height="670" fill="url(#ac-cat-door)"/>
      <path d="M640 110V780M960 110V780" stroke="#fff3c8" stroke-opacity=".12" stroke-width="3"/></g>
    <rect x="548" y="98" width="504" height="694" fill="none" stroke="#14100c" stroke-width="26"/>
    <ellipse cx="830" cy="790" rx="200" ry="22" fill="#000" opacity=".6"/>
    <path class="cat-tail" d="M892 748C960 746 1010 734 1042 696C1066 664 1056 630 1032 640" fill="none" stroke="#030303" stroke-width="28" stroke-linecap="round"/>
    <path d="M700 764C688 640 720 560 760 520L840 520C880 560 912 640 902 764Z" fill="#030303"/>
    <path class="cat-paw" d="M758 596q-8 62 -4 126q16 14 32 0q4 -64 -6 -126z" fill="#030303"/>
    <path d="M826 600q8 80 4 160h32q4 -80 -6 -160z" fill="#030303"/>
    <g class="cat-head"><path d="M748 438L742 366L788 414M852 438L858 366L812 414" fill="#030303"/>
      <ellipse cx="800" cy="474" rx="64" ry="54" fill="#030303"/>
      <circle cx="772" cy="468" r="30" fill="url(#ac-cat-glow)" class="cat-eyeglow"/><circle cx="828" cy="468" r="30" fill="url(#ac-cat-glow)" class="cat-eyeglow"/>
      <g class="cat-eyes"><ellipse cx="772" cy="468" rx="13" ry="10" fill="#9bff6c"/><ellipse cx="828" cy="468" rx="13" ry="10" fill="#9bff6c"/>
        <ellipse cx="772" cy="468" rx="3.5" ry="9" fill="#031003"/><ellipse cx="828" cy="468" rx="3.5" ry="9" fill="#031003"/></g>
      <path d="M796 490l4 5 4-5z" fill="#2a1a1a"/></g>
    <rect width="1600" height="900" fill="url(#ac-cat-vig)"/>`);

  // ---- belly
  AFTERMATHS.belly = () => {
    const strips = [[1020, 90, 3], [1060, 130, -2], [1100, 110, 2], [1140, 150, -3], [1180, 80, 2]]
      .map(([x, h, r], i) => `<path class="belly-strip belly-strip-${i % 3}" d="M${x} 560l30 -6 4 ${h + 56} -16 -14 -10 18 -12 -20z" fill="#b9c2c8" stroke="#6d7b82" stroke-width="3"/>`).join('');
    return SVG('ac-belly', `<defs>
      <linearGradient id="ac-belly-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2535"/><stop offset="1" stop-color="#0c1018"/></linearGradient>
      <linearGradient id="ac-belly-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5476a6"/><stop offset="1" stop-color="#26385a"/></linearGradient>
      <linearGradient id="ac-belly-moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8c4f0" stop-opacity=".3"/><stop offset="1" stop-color="#a8c4f0" stop-opacity=".02"/></linearGradient>
      <radialGradient id="ac-belly-vig" cx=".5" cy=".5" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#ac-belly-wall)"/><polygon points="0,700 1600,700 1600,900 0,900" fill="#090c12"/><rect y="690" width="1600" height="14" fill="#05070a"/>
      <g class="belly-moonlight"><polygon points="150,470 450,470 980,900 240,900" fill="url(#ac-belly-moon)"/>
        <path d="M300 470L610 900M150 470L340 900" stroke="#05070a" stroke-opacity=".5" stroke-width="10"/></g>
      <rect x="150" y="90" width="300" height="380" fill="url(#ac-belly-glass)"/><circle cx="330" cy="200" r="46" fill="#eef3ff" opacity=".9"/>
      <g class="belly-clouds" fill="#1d2a45" opacity=".8"><ellipse cx="260" cy="250" rx="120" ry="22"/><ellipse cx="400" cy="160" rx="90" ry="16"/></g>
      <path d="M300 90V470M150 280H450" stroke="#080b10" stroke-width="14"/><rect x="144" y="84" width="312" height="392" fill="none" stroke="#080b10" stroke-width="16"/>
      <path class="belly-curtain belly-curtain-a" d="M450 70h110v570q-26 24 -55 0q-28 -24 -55 0z" fill="#27324a"/>
      <path class="belly-curtain belly-curtain-b" d="M50 70h110v560q-26 24 -55 0q-28 -24 -55 0z" fill="#222c42"/>
      <g stroke="#0a0d14" stroke-width="10" stroke-linecap="round"><path d="M660 380V760M700 380V760M1440 380V760M660 380H1440"/></g>
      <rect x="640" y="540" width="820" height="76" rx="14" fill="#8e99a6"/><rect x="640" y="540" width="820" height="16" rx="8" fill="#c9d3dc" opacity=".6"/>
      <path d="M650 616H1450Q1440 690 1410 704H690Q660 690 650 616z" fill="#a4aeb8"/><path d="M700 640q60 20 120 0M1200 640q60 22 120 0" fill="none" stroke="#6d7b82" stroke-width="4"/>
      <g stroke="#0a0d14" stroke-width="12" stroke-linecap="round"><path d="M680 700V780M1420 700V780"/></g>
      <path d="M980 548L1010 500L1040 540L1070 480L1100 536L1130 490L1160 544L1200 520L1210 560L980 566z" fill="#07040b"/>
      <path d="M1000 566h190v40q-30 14 -60 0q-30 -14 -60 0q-30 14 -70 -4z" fill="#2a1442" stroke="#4b2d6a" stroke-width="2"/>
      <g class="belly-strips">${strips}</g>
      <ellipse cx="1110" cy="808" rx="190" ry="32" fill="#24123a"/><ellipse cx="1110" cy="808" rx="190" ry="32" fill="none" stroke="#4b2d6a" stroke-width="3"/><ellipse cx="1080" cy="800" rx="60" ry="7" fill="#6d4a8c" opacity=".35"/>
      <ellipse class="belly-ripple belly-ripple-a" cx="1090" cy="808" rx="90" ry="16" fill="none" stroke="#8a64ad" stroke-width="3"/>
      <ellipse class="belly-ripple belly-ripple-b" cx="1146" cy="810" rx="90" ry="16" fill="none" stroke="#8a64ad" stroke-width="3"/>
      <circle class="belly-drop belly-drop-a" cx="1090" cy="690" r="9" fill="#1d0f2a" stroke="#6d4a8c" stroke-width="2"/>
      <circle class="belly-drop belly-drop-b" cx="1146" cy="700" r="7" fill="#1d0f2a" stroke="#6d4a8c" stroke-width="2"/>
      <rect width="1600" height="900" fill="url(#ac-belly-vig)"/>`);
  };

  // ---- elevator
  AFTERMATHS.elevator = () => SVG('ac-elevator', `<defs>
    <linearGradient id="ac-el-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a3034"/><stop offset=".5" stop-color="#4a545a"/><stop offset="1" stop-color="#2a3034"/></linearGradient>
    <radialGradient id="ac-el-hum" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff6a2a" stop-opacity=".4"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient>
    <linearGradient id="ac-el-gap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd890" stop-opacity="0"/><stop offset=".5" stop-color="#ffd890" stop-opacity=".5"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></linearGradient>
    <linearGradient id="ac-el-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd890" stop-opacity=".4"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></linearGradient>
    <radialGradient id="ac-el-vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient></defs>
    <rect width="1600" height="900" fill="#0b0d0f"/><rect y="800" width="1600" height="100" fill="#07080a"/>
    <path d="M300 0V800M1300 0V800" stroke="#14181b" stroke-width="6"/>
    <ellipse class="elevator-hum" cx="800" cy="440" rx="560" ry="480" fill="url(#ac-el-hum)"/>
    <rect x="540" y="240" width="520" height="570" fill="#050607"/><rect x="560" y="260" width="480" height="540" fill="#1a1e21"/>
    <rect x="564" y="264" width="232" height="536" fill="url(#ac-el-steel)"/><rect x="804" y="264" width="232" height="536" fill="url(#ac-el-steel)"/>
    <g stroke="#0a0c0d" stroke-opacity=".5" stroke-width="2">${R(590, 780, 12).map((x) => `<path d="M${x.toFixed(0)} 270V796"/>`).join('')}${R(830, 1020, 12).map((x) => `<path d="M${x.toFixed(0)} 270V796"/>`).join('')}</g>
    <g class="elevator-gap"><rect x="760" y="264" width="80" height="536" fill="url(#ac-el-gap)"/><rect x="796" y="264" width="8" height="536" fill="#ffe7b0"/>
      <polygon points="796,800 804,800 960,900 640,900" fill="url(#ac-el-spill)"/></g>
    <rect x="690" y="130" width="220" height="86" rx="8" fill="#030303" stroke="#2a3034" stroke-width="6"/>
    <text class="elevator-floor" x="800" y="198" text-anchor="middle" font-size="64" font-family="'Courier New',monospace" font-weight="bold" fill="#ff5a2a">B13</text>
    <path d="M730 150l16 -14 16 14z" fill="#3a1408"/><path class="elevator-arrow" d="M838 144l16 14 16 -14z" fill="#ff5a2a"/>
    <rect x="1100" y="470" width="56" height="110" rx="8" fill="#1a1e21" stroke="#2a3034" stroke-width="3"/>
    <circle cx="1128" cy="506" r="12" fill="#3a1408"/><circle class="elevator-btn" cx="1128" cy="546" r="12" fill="#ff5a2a"/>
    <rect class="elevator-tube" x="500" y="0" width="600" height="14" fill="#cfe0e8" opacity=".25"/>
    <rect width="1600" height="900" fill="url(#ac-el-vig)"/>`);

  // ---- flatline
  AFTERMATHS.flatline = () => SVG('ac-flatline', `<defs>
    <clipPath id="ac-fl-clip"><rect x="300" y="150" width="1000" height="500"/></clipPath>
    <linearGradient id="ac-fl-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7dffa0" stop-opacity="0"/><stop offset=".85" stop-color="#7dffa0" stop-opacity=".8"/><stop offset="1" stop-color="#d8ffe4"/></linearGradient>
    <radialGradient id="ac-fl-room" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#2dff7a" stop-opacity=".22"/><stop offset="1" stop-color="#2dff7a" stop-opacity="0"/></radialGradient>
    <radialGradient id="ac-fl-vig" cx=".5" cy=".5" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></radialGradient></defs>
    <rect width="1600" height="900" fill="#050709"/><ellipse class="flatline-room" cx="800" cy="400" rx="900" ry="600" fill="url(#ac-fl-room)"/>
    <rect x="240" y="90" width="1120" height="690" rx="40" fill="#14181b" stroke="#252b30" stroke-width="6"/>
    <rect x="290" y="140" width="1020" height="520" rx="14" fill="#010503"/>
    <g clip-path="url(#ac-fl-clip)"><g class="flatline-screen">
      <g stroke="#2dff7a" stroke-opacity=".08" stroke-width="2">${R(300, 1300, 11).map((x) => `<path d="M${x.toFixed(0)} 150V650"/>`).join('')}${R(150, 650, 6).map((y) => `<path d="M300 ${y.toFixed(0)}H1300"/>`).join('')}</g>
      <path d="M300 400H1300" stroke="#3dff7a" stroke-opacity=".18" stroke-width="16"/><path d="M300 400H1300" stroke="#3dff7a" stroke-opacity=".6" stroke-width="4"/>
      <rect class="flatline-sweep" x="300" y="395" width="260" height="10" fill="url(#ac-fl-sweep)"/>
      <text class="flatline-text" x="800" y="290" text-anchor="middle" font-size="${de() ? 96 : 110}" font-family="var(--type)" fill="#9dffb8" stroke="#2dff7a" stroke-opacity=".25" stroke-width="12" paint-order="stroke">${de() ? 'ER IST WACH' : 'HE IS AWAKE'}</text>
      <path d="M1300 150L1190 262L1226 290L1120 400L1150 410L1060 520M1190 262L1120 250M1120 400L1060 380" fill="none" stroke="#e8fff0" stroke-opacity=".5" stroke-width="2.5"/>
      <path d="M300 650L380 590L360 560L440 500" fill="none" stroke="#e8fff0" stroke-opacity=".35" stroke-width="2"/></g></g>
    <path d="M1300 150L1330 120L1350 90M1330 120L1360 140" fill="none" stroke="#6f7c84" stroke-width="2" opacity=".6"/>
    <rect x="320" y="700" width="260" height="46" rx="6" fill="#0b0e10"/><circle class="flatline-led" cx="1270" cy="722" r="10" fill="#ff3a2a"/>
    <g fill="#222a2f"><circle cx="1180" cy="722" r="14"/><circle cx="1110" cy="722" r="14"/></g>
    <rect width="1600" height="900" fill="url(#ac-fl-vig)"/>`);

  // ---- morgue
  AFTERMATHS.morgue = () => {
    const open = { '0,1': 1, '0,3': 1, '1,0': 1, '1,2': 2, '2,1': 1, '2,3': 1 };
    let cells = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = 190 + c * 310, y = 70 + r * 260, w = 290, h = 170, o = open[`${r},${c}`];
      cells += `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" fill="#06090b"/>`;
      if (!o) {
        cells += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ac-mo-steel)" stroke="#1a2226" stroke-width="3"/>
          <rect x="${x + 100}" y="${y + 100}" width="90" height="12" rx="6" fill="#0d1215"/><rect x="${x + 100}" y="${y + 98}" width="90" height="3" fill="#a9bbc4" opacity=".5"/>
          <rect x="${x + 28}" y="${y + 26}" width="70" height="38" fill="#cfc7ae" opacity=".7"/><path d="M${x + 36} ${y + 40}h50M${x + 36} ${y + 52}h34" stroke="#3a3a30" stroke-width="3"/>`;
      } else {
        cells += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#010203" stroke="#1a2226" stroke-width="3"/>
          <path d="M${x + 20} ${y + 60}H${x + w - 20}M${x + 20} ${y + 120}H${x + w - 20}" stroke="#0e1417" stroke-width="3"/>
          <g class="${o === 2 ? 'morgue-slide' : ''}"><polygon points="${x + 10},${y + h - 20} ${x + w - 10},${y + h - 20} ${x + w + 4},${y + h + 40} ${x - 4},${y + h + 40}" fill="#7f9099"/>
            <polygon points="${x + 10},${y + h - 20} ${x + 60},${y + h - 20} ${x + 40},${y + h + 40} ${x - 4},${y + h + 40}" fill="#a5b6bf" opacity=".5"/>
            <rect x="${x - 8}" y="${y + h + 40}" width="${w + 16}" height="40" fill="url(#ac-mo-steel)" stroke="#1a2226" stroke-width="3"/>
            <rect x="${x + 100}" y="${y + h + 52}" width="90" height="10" rx="5" fill="#0d1215"/></g>`;
      }
    }
    return SVG('ac-morgue', `<defs>
      <linearGradient id="ac-mo-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6e77"/><stop offset="1" stop-color="#2c3840"/></linearGradient>
      <radialGradient id="ac-mo-vig" cx=".5" cy=".45" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></radialGradient></defs>
      <rect width="1600" height="900" fill="#0a0f12"/>
      <g stroke="#0e1519" stroke-width="2">${R(0, 1600, 17).map((x) => `<path d="M${x.toFixed(0)} 0V900"/>`).join('')}</g>
      ${cells}<rect y="810" width="1600" height="90" fill="#06090b"/>
      <rect class="morgue-cold" width="1600" height="900" fill="#bfe4f5" opacity=".08"/>
      <rect class="morgue-tube" x="400" y="0" width="800" height="12" fill="#e0f4ff" opacity=".4"/>
      <rect width="1600" height="900" fill="url(#ac-mo-vig)"/>`);
  };

  // ---- lockdown
  AFTERMATHS.lockdown = () => SVG('ac-lockdown', `<defs>
    <linearGradient id="ac-ld-slat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a646b"/><stop offset=".15" stop-color="#3c454b"/><stop offset=".9" stop-color="#252c31"/><stop offset="1" stop-color="#0a0c0e"/></linearGradient>
    <pattern id="ac-ld-pat" width="40" height="44" patternUnits="userSpaceOnUse"><rect width="40" height="44" fill="url(#ac-ld-slat)"/></pattern>
    <pattern id="ac-ld-haz" width="60" height="80" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="30" height="80" fill="#8a6b10"/><rect x="30" width="30" height="80" fill="#0a0a08"/></pattern>
    <radialGradient id="ac-ld-beam" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff2a1e" stop-opacity=".7"/><stop offset=".6" stop-color="#ff2a1e" stop-opacity=".25"/><stop offset="1" stop-color="#ff2a1e" stop-opacity="0"/></radialGradient>
    <radialGradient id="ac-ld-dome"><stop offset="0" stop-color="#ff4a3a"/><stop offset="1" stop-color="#ff2a1e" stop-opacity="0"/></radialGradient>
    <radialGradient id="ac-ld-vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient></defs>
    <rect width="1600" height="900" fill="#050607"/><rect y="90" width="1600" height="730" fill="url(#ac-ld-pat)"/>
    <rect width="1600" height="90" fill="#101214"/><rect y="86" width="1600" height="8" fill="#000"/>
    <g class="lockdown-text"><text x="800" y="${de() ? 505 : 520}" text-anchor="middle" font-size="${de() ? 150 : 200}" font-family="var(--type)" font-weight="bold" letter-spacing="10" fill="#8c1d18">${de() ? 'ABRIEGELUNG' : 'LOCKDOWN'}</text>
      <rect x="0" y="${de() ? 440 : 450}" width="1600" height="8" fill="#2f373c"/><rect x="0" y="${de() ? 505 : 510}" width="1600" height="8" fill="#2f373c"/></g>
    <rect class="lockdown-beam" x="-100" y="-100" width="1000" height="1100" fill="url(#ac-ld-beam)"/>
    <rect y="820" width="1600" height="80" fill="url(#ac-ld-haz)" opacity=".55"/><rect y="816" width="1600" height="8" fill="#000"/>
    <rect x="740" y="60" width="120" height="40" rx="10" fill="#2a0806"/><circle class="lockdown-dome" cx="800" cy="82" r="90" fill="url(#ac-ld-dome)"/><circle cx="800" cy="82" r="14" fill="#ffb0a0"/>
    <rect class="lockdown-dim" width="1600" height="900" fill="#000"/>
    <rect width="1600" height="900" fill="url(#ac-ld-vig)"/>`);

  // ---- wheelchair
  AFTERMATHS.wheelchair = () => SVG('ac-wheelchair', `<defs>
    <linearGradient id="ac-wc-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeec0" stop-opacity=".4"/><stop offset="1" stop-color="#ffeec0" stop-opacity=".14"/></linearGradient>
    <radialGradient id="ac-wc-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffeec0" stop-opacity=".3"/><stop offset="1" stop-color="#ffeec0" stop-opacity="0"/></radialGradient>
    <radialGradient id="ac-wc-vig" cx=".5" cy=".5" r=".75"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".88"/></radialGradient></defs>
    <rect width="1600" height="900" fill="#0b0d10"/><rect y="722" width="1600" height="178" fill="#07080a"/><rect y="716" width="1600" height="8" fill="#14171b"/>
    <g class="wheelchair-lamp"><polygon points="780,22 820,22 1080,722 520,722" fill="url(#ac-wc-cone)"/><ellipse cx="800" cy="760" rx="440" ry="60" fill="url(#ac-wc-pool)"/></g>
    <rect x="740" y="0" width="120" height="26" rx="8" fill="#1c1f23"/><rect x="770" y="20" width="60" height="8" fill="#ffeec0" opacity=".8" class="wheelchair-lamp"/>
    <g class="wheelchair-roll"><ellipse cx="800" cy="728" rx="230" ry="14" fill="#000" opacity=".6"/>
      <g class="wheelchair-rock">
        <g stroke-linecap="round" fill="none">
          <path d="M690 520H910M820 600L800 520" stroke="#3b444c" stroke-width="12"/>
          <path d="M900 515L930 345M930 345H985" stroke="#2c333a" stroke-width="22"/>
          <path d="M740 430H890M760 430V505M880 430V505" stroke="#3a434b" stroke-width="10"/>
          <path d="M700 525L650 660M620 668H685" stroke="#3b444c" stroke-width="12"/>
          <path d="M690 530L674 674" stroke="#3b444c" stroke-width="10"/>
          <path d="M692 520H908M742 430H888M930 345H985" stroke="#9aa8b2" stroke-width="2.5" opacity=".7"/></g>
        <rect x="705" y="498" width="205" height="24" rx="6" fill="#262b31"/><path d="M712 500H902" stroke="#4a545c" stroke-width="2"/>
        <circle cx="672" cy="700" r="26" fill="none" stroke="#2a3036" stroke-width="11"/><circle cx="672" cy="700" r="5" fill="#505a62"/>
        <g class="wheelchair-wheel"><circle cx="820" cy="600" r="120" fill="none" stroke="#2a3036" stroke-width="16"/><circle cx="820" cy="600" r="104" fill="none" stroke="#7f8b94" stroke-width="4" opacity=".8"/>
          <g stroke="#5b666e" stroke-width="2.5">${R(0, 165, 12).map((a) => `<path d="M820 ${600 - 104}V${600 + 104}" transform="rotate(${a.toFixed(0)} 820 600)"/>`).join('')}</g>
          <circle cx="820" cy="600" r="16" fill="#2d343a"/><circle cx="820" cy="600" r="5" fill="#8a96a0"/></g>
      </g></g>
    <rect width="1600" height="900" fill="url(#ac-wc-vig)"/>`);

  // ---- scratches
  AFTERMATHS.scratches = () => {
    const size = de() ? 138 : 200;
    const word = de() ? 'IMMER NOCH DA' : 'STILL HERE';
    const xs = de() ? [270, 470, 640, 880, 1010, 1210, 1330] : [350, 530, 700, 900, 1050, 1220];
    const drips = xs.map((x, i) => `<rect class="scratches-drip" style="--d:${(19 + i * 3.7).toFixed(1)}s;--w:${-(i * 5.3).toFixed(1)}s" x="${x}" y="${470 + (i % 3) * 8}" width="${9 + (i % 3) * 4}" height="${300 + ((i * 97) % 220)}" rx="3" fill="#1c0404"/>`).join('');
    const t = (extra) => `<text x="800" y="440" text-anchor="middle" font-size="${size}" font-family="var(--type)" font-weight="bold" ${extra}>${word}</text>`;
    return SVG('ac-scratches', `<defs>
      <linearGradient id="ac-sc-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2d26"/><stop offset="1" stop-color="#14140f"/></linearGradient>
      <radialGradient id="ac-sc-lamp" cx=".25" cy=".15" r=".8"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".3"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient>
      <radialGradient id="ac-sc-vig" cx=".5" cy=".5" r=".75"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".88"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#ac-sc-wall)"/>
      <g fill="#000" opacity=".18"><ellipse cx="300" cy="700" rx="200" ry="80"/><ellipse cx="1250" cy="200" rx="220" ry="70"/><ellipse cx="900" cy="780" rx="260" ry="60"/></g>
      <path d="M1400 0L1360 120L1390 200L1340 330M180 900L220 760L190 640" fill="none" stroke="#0a0a07" stroke-width="3" opacity=".7"/>
      <path d="M1180 120l-60 120M1200 112l-60 124M1220 104l-60 128M1240 96l-60 132" stroke="#080806" stroke-width="5" stroke-linecap="round" opacity=".8"/>
      ${t('fill="none" stroke="#9a937a" stroke-opacity=".35" stroke-width="3" transform="translate(-4 -4) rotate(-3 800 440)"')}
      ${t('fill="#070605" stroke="#070605" stroke-width="3" transform="rotate(-3 800 440)"')}
      ${drips}
      <rect class="scratches-lamp" width="1600" height="900" fill="url(#ac-sc-lamp)"/>
      <rect class="scratches-dim" width="1600" height="900" fill="#000"/>
      <rect width="1600" height="900" fill="url(#ac-sc-vig)"/>`);
  };

  // ---- blood
  AFTERMATHS.blood = () => {
    const word = de() ? 'STIFTE WEG' : 'PENS DOWN';
    const xs = [110, 240, 400, 560, 700, 880, 1010, 1180, 1330, 1480];
    const stat = xs.map((x, i) => `<path d="M${x + 40} 100v${70 + ((i * 53) % 110)}q0 14 -12 14t-12 -14v-${70 + ((i * 53) % 110)}z" fill="#3b0606"/>`).join('');
    const runs = xs.map((x, i) => {
      const dx = x + 70 + ((i * 37) % 30), L = 430 + ((i * 71) % 250), w = 20 + ((i * 7) % 5) * 4, dur = (16 + i * 2.9).toFixed(1), del = -((i * 6.7) % 15).toFixed(1);
      return `<g class="blood-run" style="--L:${L};--dur:${dur}s;--del:${del}s"><rect class="blood-stem" x="${dx - w / 2}" y="120" width="${w}" height="${L}" fill="#3f0606"/>
        <path class="blood-head" d="M${dx - w / 2} ${120 + L}a${w / 2} ${w / 2} 0 0 0 ${w} 0v${w * 0.6}a${w / 2} ${w * 0.8} 0 0 1 ${-w} 0z" fill="#3f0606"/>
        <rect class="blood-stem" x="${dx - w / 2 + 3}" y="120" width="4" height="${L}" fill="#a02a22" opacity=".55"/></g>`;
    }).join('');
    return SVG('ac-blood', `<defs>
      <linearGradient id="ac-bl-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1010"/><stop offset="1" stop-color="#430606"/></linearGradient>
      <radialGradient id="ac-bl-vig" cx=".5" cy=".5" r=".75"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#ac-bl-wall)"/>
      <g fill="#000" opacity=".15"><ellipse cx="260" cy="620" rx="260" ry="90"/><ellipse cx="1300" cy="760" rx="300" ry="80"/></g>
      <path d="M0 0H1600V110Q1520 150 1460 100Q1340 170 1260 100Q1160 150 1060 100Q940 180 860 100Q760 150 660 100Q540 170 440 100Q340 160 240 100Q130 170 0 110z" fill="#2c0404"/>
      ${stat}${runs}
      <g class="blood-text"><text x="800" y="500" text-anchor="middle" font-size="${de() ? 170 : 200}" font-family="var(--type)" font-weight="bold" fill="#1a0202" fill-opacity=".5" stroke="#1a0202" stroke-opacity=".5" stroke-width="14" paint-order="stroke">${word}</text>
        <text x="800" y="500" text-anchor="middle" font-size="${de() ? 170 : 200}" font-family="var(--type)" font-weight="bold" fill="#e6dcc2">${word}</text></g>
      <rect class="blood-dim" width="1600" height="900" fill="#000"/>
      <rect width="1600" height="900" fill="url(#ac-bl-vig)"/>`);
  };
}
