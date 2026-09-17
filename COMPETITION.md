# ParFolio Mini · Competition Submission Pack

## 250-word submission draft

ParFolio Mini turns a golf round into a wallet-signed digital record.

The experience is intentionally simple: open ParFolio Mini in Nimiq Pay, connect your wallet, choose a GPS-ready California golf course, play and score the round hole by hole, then sign the completed result with your Nimiq wallet. The signed record can be saved and shared from the device.

Nimiq is not an add-on to the product. The wallet is the identity layer that attributes the completed record to the person who approved the signature. ParFolio Mini never stores private keys or takes custody of funds.

The competition edition focuses on a reliable end-to-end loop rather than feature volume: **Choose course → Play → Score → Finish → Sign → Share.** During play, the golfer receives a full-screen golf experience with course mapping, hole navigation, scoring controls and available GPS context.

ParFolio Mini is transparent about what the signature proves. It confirms which wallet signed the submitted round details; it does not independently certify that the golfer's entered score is true. This distinction is displayed in the product and shared record.

The app is built with Vite and the Nimiq Mini App SDK, with reviewed course-reference data for the California competition catalog. Local profile, golf-bag and signed-round information stays on the device unless a feature explicitly needs a network or location provider.

**Play. Score. Sign. Your golf record, tied to your wallet.**

## Judge demo path

1. Launch inside Nimiq Pay.
2. Tap Connect Wallet and approve the account prompt.
3. Open Play / course finder.
4. Choose a GPS-ready California course.
5. Start a round.
6. Enter scores on several holes and demonstrate map/GPS controls.
7. Finish the round.
8. Review the result.
9. Approve the wallet signature.
10. Open My Rounds and share/view the signed record.

## Required final QA

- [ ] Production home page loads on iPhone and desktop.
- [ ] Connect Wallet opens the Nimiq Pay approval prompt.
- [ ] Wallet rejection produces a clear recoverable message.
- [ ] California course search returns usable courses.
- [ ] Location denial does not block manual course use or scoring.
- [ ] GPS-ready course starts in full-screen golf mode.
- [ ] Hole navigation works forward and backward.
- [ ] Score controls work for all holes.
- [ ] Round survives ordinary navigation/re-rendering.
- [ ] Finish Round shows the correct total.
- [ ] Wallet signing succeeds on the completed record.
- [ ] Signing rejection keeps the completed round intact.
- [ ] Signed round appears in My Rounds.
- [ ] Share signed record works or falls back safely.
- [ ] Offline state gives a clear message instead of a dead screen.
- [ ] No visible unfinished/prototype-only features in the judged path.
- [ ] No uncaught console errors during the complete path.
- [ ] README, MIT license and submission description are current.

## Usage evidence to capture

Record these before submission and during public testing:

- Unique testers
- Wallet-connect attempts / successes
- Courses selected
- Rounds started
- Rounds completed
- Signed rounds created
- Shared signed records
- Bugs found
- Bugs fixed
- Short tester feedback quotes (with permission)

Do not inflate or invent usage numbers. Only report observed results.

## 60-second demo outline

**0–7 sec:** ParFolio Mini home screen — “Play. Score. Sign.”

**7–15 sec:** Connect Nimiq wallet.

**15–25 sec:** Find and select a California GPS-ready golf course.

**25–40 sec:** Full-screen round view: map, hole navigation and scoring.

**40–50 sec:** Finish the round and review the total.

**50–58 sec:** Sign the completed round in Nimiq Pay.

**58–60 sec:** Show the saved wallet-signed record and share button.
