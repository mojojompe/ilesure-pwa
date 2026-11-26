import { writeFileSync } from 'fs';
import { join } from 'path';

const base = 'C:/Users/HP/Desktop/Work/React/ileSure Dir/ilesure-pwa/public/images';

const svgs = {
  categories: {
    'category_services': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<circle cx="80" cy="52" r="22" fill="#FAF1CC"/>
<circle cx="80" cy="44" r="14" fill="#E1AD01"/>
<rect x="68" y="66" width="24" height="38" rx="6" fill="#3E1F0A"/>
<line x1="80" y1="78" x2="56" y2="96" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<line x1="80" y1="78" x2="104" y2="96" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<line x1="68" y1="104" x2="68" y2="130" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<line x1="92" y1="104" x2="92" y2="130" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<rect x="96" y="90" width="32" height="22" rx="5" fill="#E1AD01"/>
<rect x="99" y="93" width="12" height="8" rx="2" fill="#3E1F0A" opacity="0.5"/>
<rect x="113" y="93" width="12" height="8" rx="2" fill="#3E1F0A" opacity="0.5"/>
<rect x="99" y="104" width="26" height="4" rx="2" fill="#3E1F0A" opacity="0.3"/>
<circle cx="37" cy="80" r="8" fill="#E1AD01" opacity="0.5"/>
<circle cx="128" cy="65" r="6" fill="#3E1F0A" opacity="0.2"/>
</svg>`,
  },
  services: {
    'electrician': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<circle cx="72" cy="45" r="20" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2"/>
<circle cx="72" cy="37" r="12" fill="#E1AD01"/>
<rect x="64" y="65" width="16" height="38" rx="5" fill="#3E1F0A"/>
<line x1="72" y1="76" x2="48" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="72" y1="76" x2="96" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="64" y1="103" x2="64" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="80" y1="103" x2="80" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<circle cx="118" cy="68" r="20" fill="#FAF1CC" stroke="#E1AD01" stroke-width="2"/>
<line x1="114" y1="58" x2="118" y2="68" stroke="#E1AD01" stroke-width="2.5"/>
<line x1="122" y1="58" x2="118" y2="68" stroke="#E1AD01" stroke-width="2.5"/>
<line x1="118" y1="68" x2="118" y2="78" stroke="#E1AD01" stroke-width="2.5"/>
<circle cx="118" cy="80" r="3" fill="#E1AD01"/>
<circle cx="38" cy="110" r="10" fill="#E1AD01" opacity="0.3"/>
</svg>`,

    'plumber': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<circle cx="72" cy="45" r="20" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2"/>
<circle cx="72" cy="37" r="12" fill="#E1AD01"/>
<rect x="64" y="65" width="16" height="38" rx="5" fill="#3E1F0A"/>
<line x1="72" y1="76" x2="48" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="72" y1="76" x2="96" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="64" y1="103" x2="64" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="80" y1="103" x2="80" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<rect x="96" y="58" width="38" height="10" rx="5" fill="#E1AD01" transform="rotate(-25 96 58)"/>
<rect x="104" y="45" width="16" height="8" rx="4" fill="#3E1F0A" opacity="0.5" transform="rotate(-25 104 45)"/>
<circle cx="38" cy="115" r="12" fill="#3E1F0A" opacity="0.1"/>
</svg>`,

    'carpenter': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<circle cx="72" cy="45" r="20" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2"/>
<circle cx="72" cy="37" r="12" fill="#E1AD01"/>
<rect x="64" y="65" width="16" height="38" rx="5" fill="#3E1F0A"/>
<line x1="72" y1="76" x2="48" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="72" y1="76" x2="96" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="64" y1="103" x2="64" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="80" y1="103" x2="80" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<rect x="98" y="82" width="38" height="22" rx="4" fill="#E1AD01"/>
<rect x="101" y="85" width="32" height="16" rx="2" fill="#FAF1CC"/>
<rect x="104" y="88" width="10" height="10" rx="2" fill="#3E1F0A" opacity="0.4"/>
<rect x="119" y="88" width="10" height="10" rx="2" fill="#3E1F0A" opacity="0.4"/>
</svg>`,

    'painter': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<circle cx="72" cy="45" r="20" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2"/>
<circle cx="72" cy="37" r="12" fill="#E1AD01"/>
<rect x="64" y="65" width="16" height="38" rx="5" fill="#3E1F0A"/>
<line x1="72" y1="76" x2="48" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="72" y1="76" x2="96" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="64" y1="103" x2="64" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="80" y1="103" x2="80" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<rect x="98" y="68" width="6" height="32" rx="3" fill="#3E1F0A"/>
<rect x="88" y="96" width="26" height="18" rx="4" fill="#E1AD01"/>
<ellipse cx="96" cy="72" rx="5" ry="7" fill="#E1AD01" opacity="0.9"/>
<circle cx="38" cy="112" r="8" fill="#E1AD01" opacity="0.3"/>
</svg>`,

    'cleaning': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<circle cx="72" cy="45" r="20" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2"/>
<circle cx="72" cy="37" r="12" fill="#E1AD01"/>
<rect x="64" y="65" width="16" height="38" rx="5" fill="#3E1F0A"/>
<line x1="72" y1="76" x2="48" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="72" y1="76" x2="96" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="64" y1="103" x2="64" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="80" y1="103" x2="80" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<rect x="102" y="55" width="14" height="26" rx="6" fill="#E1AD01"/>
<polygon points="102,78 116,78 120,95 98,95" fill="#E1AD01" opacity="0.85"/>
<circle cx="106" cy="90" r="2.5" fill="#FAF1CC"/>
<circle cx="114" cy="88" r="2.5" fill="#FAF1CC"/>
<circle cx="118" cy="82" r="2.5" fill="#FAF1CC"/>
</svg>`,

    'fumigation': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<circle cx="72" cy="45" r="20" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2"/>
<circle cx="72" cy="37" r="12" fill="#E1AD01"/>
<rect x="68" y="37" width="8" height="6" rx="2" fill="#3E1F0A" opacity="0.6"/>
<rect x="64" y="65" width="16" height="38" rx="5" fill="#3E1F0A"/>
<line x1="72" y1="76" x2="48" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="72" y1="76" x2="96" y2="92" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="64" y1="103" x2="64" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<line x1="80" y1="103" x2="80" y2="128" stroke="#3E1F0A" stroke-width="4" stroke-linecap="round"/>
<circle cx="116" cy="78" r="18" fill="#E1AD01" opacity="0.7"/>
<path d="M108 70 Q116 58 124 70" fill="none" stroke="#3E1F0A" stroke-width="1.5" opacity="0.5"/>
<path d="M110 75 Q116 63 122 75" fill="none" stroke="#3E1F0A" stroke-width="1.5" opacity="0.5"/>
<path d="M112 80 Q116 68 120 80" fill="none" stroke="#3E1F0A" stroke-width="1.5" opacity="0.5"/>
</svg>`,

    'furnishing': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<rect x="28" y="90" width="104" height="38" rx="10" fill="#E1AD01"/>
<rect x="38" y="74" width="84" height="26" rx="8" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2"/>
<rect x="28" y="122" width="18" height="16" rx="4" fill="#3E1F0A"/>
<rect x="114" y="122" width="18" height="16" rx="4" fill="#3E1F0A"/>
<rect x="48" y="58" width="28" height="22" rx="6" fill="#E1AD01" opacity="0.8"/>
<rect x="54" y="42" width="16" height="20" rx="4" fill="#3E1F0A" opacity="0.3"/>
<circle cx="118" cy="62" r="14" fill="#FAF1CC" stroke="#E1AD01" stroke-width="2"/>
<line x1="118" y1="48" x2="118" y2="53" stroke="#E1AD01" stroke-width="2.5" stroke-linecap="round"/>
<line x1="118" y1="71" x2="118" y2="76" stroke="#E1AD01" stroke-width="2.5" stroke-linecap="round"/>
<line x1="104" y1="62" x2="109" y2="62" stroke="#E1AD01" stroke-width="2.5" stroke-linecap="round"/>
<line x1="127" y1="62" x2="132" y2="62" stroke="#E1AD01" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

    'appliances': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<rect width="160" height="160" fill="none"/>
<rect x="22" y="58" width="74" height="54" rx="8" fill="#E1AD01"/>
<rect x="27" y="63" width="64" height="36" rx="5" fill="#FAF1CC"/>
<rect x="30" y="66" width="58" height="28" rx="3" fill="#3E1F0A" opacity="0.08"/>
<circle cx="52" cy="90" r="6" fill="#E1AD01"/>
<circle cx="68" cy="90" r="6" fill="#E1AD01"/>
<rect x="30" y="102" width="12" height="5" rx="2" fill="#3E1F0A" opacity="0.5"/>
<rect x="22" y="107" width="74" height="5" rx="2" fill="#3E1F0A" opacity="0.3"/>
<rect x="108" y="62" width="30" height="54" rx="6" fill="#3E1F0A" opacity="0.75"/>
<rect x="111" y="65" width="24" height="22" rx="3" fill="#FAF1CC" opacity="0.25"/>
<circle cx="116" cy="104" r="5" fill="#E1AD01"/>
<circle cx="128" cy="104" r="5" fill="#E1AD01"/>
</svg>`,

    'services_banner': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
<rect width="300" height="180" fill="none"/>
<circle cx="80" cy="52" r="28" fill="#FAF1CC" stroke="#3E1F0A" stroke-width="2.5"/>
<circle cx="80" cy="40" r="17" fill="#E1AD01"/>
<rect x="68" y="80" width="24" height="50" rx="7" fill="#3E1F0A"/>
<line x1="80" y1="96" x2="50" y2="118" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<line x1="80" y1="96" x2="110" y2="118" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<line x1="68" y1="130" x2="68" y2="162" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<line x1="92" y1="130" x2="92" y2="162" stroke="#3E1F0A" stroke-width="5" stroke-linecap="round"/>
<circle cx="118" cy="80" r="16" fill="#FAF1CC" stroke="#E1AD01" stroke-width="2"/>
<line x1="113" y1="68" x2="118" y2="80" stroke="#E1AD01" stroke-width="2.5"/>
<line x1="123" y1="68" x2="118" y2="80" stroke="#E1AD01" stroke-width="2.5"/>
<line x1="118" y1="80" x2="118" y2="92" stroke="#E1AD01" stroke-width="2.5"/>
<circle cx="118" cy="94" r="4" fill="#E1AD01"/>
<rect x="38" y="110" width="34" height="12" rx="6" fill="#E1AD01" opacity="0.9"/>
<ellipse cx="45" cy="102" rx="12" ry="7" fill="#E1AD01" opacity="0.8"/>
<circle cx="30" cy="145" r="16" fill="#E1AD01" opacity="0.25"/>
<circle cx="128" cy="28" r="9" fill="#3E1F0A" opacity="0.18"/>
</svg>`,
  }
};

for (const [name, svg] of Object.entries(svgs.categories)) {
  writeFileSync(`${base}/categories/${name}.svg`, svg);
  console.log(`✓ categories/${name}.svg`);
}
for (const [name, svg] of Object.entries(svgs.services)) {
  writeFileSync(`${base}/services/${name}.svg`, svg);
  console.log(`✓ services/${name}.svg`);
}
console.log('Done.');
