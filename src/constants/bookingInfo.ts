/**
 * Short explanations shown behind the (i) icons across the booking flow.
 * KEEP IN SYNC with the mobile copy (IleSure/src/constants/bookingInfo.ts).
 */
export interface InfoCopy {
  title: string;
  body: string;
}

export const BOOKING_INFO = {
  timeline: {
    title: 'How booking works',
    body: 'Every long-term rental follows the same steps: you request the booking, view the apartment in person, confirm it matches the listing, then sign the agreement and pay. Shortlets skip the viewing and go straight to payment.',
  },
  stepRequested: {
    title: 'Booking requested',
    body: 'Your request has been sent to the agent or landlord. Nothing is charged at this point.',
  },
  stepInspection: {
    title: 'Physical inspection',
    body: 'Pick a date and time to view the apartment in person. Never pay anyone before you have seen the place.',
  },
  stepVerified: {
    title: 'Inspection verified',
    body: 'After the viewing, you (not the agent) confirm that the apartment matches the listing. Payment only opens once you confirm. If it does not match, report it and you will not be asked to pay.',
  },
  stepPayment: {
    title: 'Payment',
    body: 'You review the fee breakdown, sign the tenancy agreement, then pay securely through Paystack. Only pay inside the app, never by direct transfer to an agent.',
  },
  stepMoveIn: {
    title: 'Move in',
    body: 'Once your payment is confirmed the apartment is yours. It appears under My Apartments with your receipts.',
  },
  bookingStatus: {
    title: 'Booking status',
    body: 'Pending or Confirmed: the booking is open and waiting on the next step, such as the inspection or payment. Completed: payment has been received. Cancelled or Rejected: the booking is closed and cannot be paid for.',
  },
  paymentProgress: {
    title: 'Payment progress',
    body: 'This rental is paid in instalments. The bar shows how many payments you have made out of the total, and when the next one is due.',
  },
  rentRenewal: {
    title: 'Rent renewal',
    body: 'When your next rent period is due. A renewal covers that period’s rent plus the platform fee only. Caution and agency fees are one-time and are not charged again.',
  },
  bookingDetails: {
    title: 'Booking details',
    body: 'The key facts of this booking: its status, the rent, how the rent is paid and the dates. Use the chat button to message the agent or landlord about it.',
  },
  paymentPlan: {
    title: 'Payment plan',
    body: 'How often the rent is paid, as set by the property owner: once a year, in periods such as monthly or quarterly, or in custom instalments.',
  },
  feeBreakdown: {
    title: 'Fee breakdown',
    body: 'Everything that makes up the amount you pay. Tap the (i) beside a line to see what it covers.',
  },
  cautionFee: {
    title: 'Caution fee',
    body: 'A one-time refundable security deposit. It covers damage or unpaid bills and is returned when you move out, less any deductions allowed by the tenancy agreement.',
  },
  agencyFee: {
    title: 'Agency fee',
    body: 'A one-time fee for the agent who handles the property. You pay it on your first payment only, not on renewals.',
  },
  serviceFee: {
    title: 'Platform fee',
    body: 'The iléSure fee for verified listings, secure payment and support. It is a percentage of the rent, caution fee and agency fee added together, at the rate shown on this line.',
  },
  roommateMatchingFee: {
    title: 'Roommate matching fee',
    body: 'Charged only because you asked to be matched with a roommate for this apartment. It is 1% of the rent, caution fee and agency fee added together.',
  },
  totalToPay: {
    title: 'Total to pay',
    body: 'The exact amount you will be charged at checkout. It is calculated by iléSure, so no one can ask you for a different figure.',
  },
  confirmations: {
    title: 'Confirmations',
    body: 'Tick both boxes to continue. Next you read and sign the tenancy agreement, and only after that are you taken to payment.',
  },
  sharedStatus: {
    title: 'Shared booking status',
    body: 'A shared booking is confirmed only when every roommate has paid their share. The countdown shows how long is left to finish paying.',
  },
  sharedProgress: {
    title: 'Payment progress',
    body: 'The amount paid so far by all roommates, out of the total needed to secure the apartment.',
  },
  sharedParticipants: {
    title: 'Participants',
    body: 'Each roommate pays only their own share. You can see who has paid and who is still pending.',
  },
  sharedDeadline: {
    title: 'Payment deadline',
    body: 'Everyone must pay before this date. If the booking is not fully paid by then it expires and any share already paid is refunded.',
  },
} satisfies Record<string, InfoCopy>;
