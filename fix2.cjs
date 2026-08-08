const fs = require('fs');
const path = require('path');

// 1. Splash.tsx
let sp = fs.readFileSync('src/pages/auth/Splash.tsx', 'utf8');
sp = sp.replace('if (hasEverLoggedIn)', 'if (false)');
fs.writeFileSync('src/pages/auth/Splash.tsx', sp);

// 2. Onboarding.tsx
let ob = fs.readFileSync('src/pages/auth/Onboarding.tsx', 'utf8');
ob = ob.replace(/navigate\(\)/g, "navigate('/')");
ob = ob.replace(/handleNext\(\)/g, "handleNext(currentSlide)");
fs.writeFileSync('src/pages/auth/Onboarding.tsx', ob);

// 3. Login.tsx
let lg = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');
lg = lg.replace(/avatar: undefined/g, 'avatar: undefined, createdAt: new Date().toISOString()');
fs.writeFileSync('src/pages/auth/Login.tsx', lg);

// 4. ListingDetail.tsx
let ld = fs.readFileSync('src/pages/details/ListingDetail.tsx', 'utf8');
ld = ld.replace(/CheckmarkBadge01Icon,\s*InformationCircleIcon,/g, 'InformationCircleIcon,');
ld = ld.replace(/CheckmarkBadge01Icon,\s*HelpCircleIcon/g, 'CheckmarkBadge01Icon,\n  HelpCircleIcon');
ld = ld.replace(/import \{ \n  Building03Icon,\n  Location01Icon,\n  Share01Icon,\n  FavouriteIcon,\n  CheckmarkBadge01Icon,\n  Sofa01Icon,\n  FlashIcon,\n  DropletIcon,\n  ArrowLeft01Icon,\n  StarIcon,\n  Camera01Icon,\n  Alert02Icon,\n  BubbleChatIcon,\n  CheckmarkBadge01Icon,\n  HelpCircleIcon\n\} from '@hugeicons\/react';/g, `import { 
  Building03Icon, 
  Location01Icon, 
  Share01Icon, 
  FavouriteIcon,
  CheckmarkBadge01Icon,
  Sofa01Icon,
  FlashIcon,
  DropletIcon,
  ArrowLeft01Icon,
  StarIcon,
  Camera01Icon,
  Alert02Icon,
  BubbleChatIcon,
  InformationCircleIcon,
  HelpCircleIcon
} from '@hugeicons/react';`);
// dedupe CheckmarkBadge01Icon
const lines = ld.split('\n');
const newLines = [];
let seenCheckmark = false;
for (let line of lines) {
  if (line.includes('CheckmarkBadge01Icon,')) {
    if (seenCheckmark) continue;
    seenCheckmark = true;
  }
  newLines.push(line);
}
ld = newLines.join('\n');

ld = ld.replace(/navigate\(listing\.companyId \? `\/company\/\$\{listing\.companyId\}` : `\/agent\/\$\{listing\.agentId\}`\)/g, "navigate(`/agent/${(listing.agent as any)?.id || 'temp'}`)");
ld = ld.replace(/navigate\(`\/chat\/\$\{listing\.agentId\}`\)/g, "navigate(`/chat/${(listing.agent as any)?.id || 'temp'}`)");
ld = ld.replace(/listing\.amenities\.length > 0 \? \(/g, '(listing.amenities && listing.amenities.length > 0) ? (');
fs.writeFileSync('src/pages/details/ListingDetail.tsx', ld);

// 5. MatchProfile.tsx
let mp = fs.readFileSync('src/pages/details/MatchProfile.tsx', 'utf8');
mp = mp.replace(/\/ \{apartment\.duration \|\| 'year'\}/g, '/ year');
fs.writeFileSync('src/pages/details/MatchProfile.tsx', mp);

console.log('Done 2');
