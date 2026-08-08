const fs = require('fs');
const path = require('path');

const replaceInFile = (file, src, dst) => {
  const p = path.join('src', file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (typeof src === 'string') content = content.split(src).join(dst);
    else content = content.replace(src, dst);
    fs.writeFileSync(p, content);
  }
}

// Icons
replaceInFile('pages/booking/KYC.tsx', 'Shield01Icon', 'CheckmarkBadge01Icon');
replaceInFile('pages/booking/KYC.tsx', 'RibbonIcon', 'CheckmarkBadge01Icon');
replaceInFile('pages/tabs/Profile.tsx', 'Shield01Icon', 'CheckmarkBadge01Icon');
replaceInFile('pages/settings/TermsPrivacy.tsx', 'Shield01Icon', 'CheckmarkBadge01Icon');
replaceInFile('pages/booking/Payment.tsx', 'ReceiptIcon', 'Note01Icon');
replaceInFile('pages/booking/BookingDetail.tsx', 'Chating01Icon', 'Chatting01Icon');
replaceInFile('pages/details/ListingDetail.tsx', 'Shield02Icon', 'CheckmarkBadge01Icon');
replaceInFile('pages/details/ListingDetail.tsx', 'Shield01Icon', 'CheckmarkBadge01Icon');

// Auth errors
replaceInFile('pages/auth/Login.tsx', 'avatar: undefined', 'avatar: undefined, createdAt: new Date().toISOString()');
replaceInFile('pages/auth/Onboarding.tsx', 'hasEverLoggedIn: state.hasEverLoggedIn,', '');
replaceInFile('pages/auth/Splash.tsx', 'hasEverLoggedIn: state.hasEverLoggedIn,', '');

// ListingDetail TS errors
replaceInFile('pages/details/ListingDetail.tsx', 
  "listing.companyId ? `/company/${listing.companyId}` : `/agent/${listing.agentId}`",
  "`/agent/${(listing.agent as any)?.id || 'temp'}`"
);
replaceInFile('pages/details/ListingDetail.tsx', 
  "`/chat/${listing.agentId}`",
  "`/chat/${(listing.agent as any)?.id || 'temp'}`"
);
replaceInFile('pages/details/ListingDetail.tsx', 
  "{listing.companyName || listing.agentName || 'Agent'}",
  "{(listing.agent as any)?.fullName || 'Agent'}"
);
replaceInFile('pages/details/ListingDetail.tsx', 
  "listing.amenities.length > 0",
  "(listing.amenities && listing.amenities.length > 0)"
);

// MatchProfile
replaceInFile('pages/details/MatchProfile.tsx', 
  "/ {apartment.duration || 'year'}",
  "/ year"
);

console.log('Done');
