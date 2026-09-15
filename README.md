# ParFolio Mini

**Your golf game. Recorded. Signed.**

ParFolio Mini is a focused Nimiq Pay edition of ParFolio built for the Global Mini Apps Building Competition. It lets golfers connect a Nimiq wallet, record a golf round, and cryptographically sign the player-entered round details to create a shareable record linked to the signing wallet. A wallet signature does not independently confirm the score.

## Competition concept

The core flow is intentionally simple:

1. Connect a Nimiq wallet inside Nimiq Pay.
2. Record a round: course, date, score, par, birdies, and optional longest drive.
3. Approve a wallet signature for the round summary.
4. Save the wallet-signed round on the current device and share the signed message, public key, and signature.
5. Next: enter skill-based golf challenges with transparent NIM-funded rewards.

## Why Nimiq belongs in the product

Nimiq Pay is not decorative in ParFolio Mini. The wallet provides player-controlled identity and a cryptographic signature on the player's entered round details. Mini does not verify the golf score against a course or another player. The next competition feature extends that same identity into measurable skill challenges and NIM rewards.

## Technology

- Vite
- `@nimiq/mini-app-sdk`
- Nimiq Pay injected provider
- `listAccounts()` for wallet connection
- `sign()` for verified golf rounds
- Mobile-first responsive UI

## Run locally

```bash
npm install
npm run dev
```

For real wallet operations, load the development URL inside Nimiq Pay according to the official Mini Apps development workflow.

## Privacy and security

ParFolio Mini never receives or stores wallet private keys. Sensitive wallet actions are approved through Nimiq Pay. No private keys, API secrets, or sensitive credentials should be committed to this repository.

## Competition status

- [x] Public repository
- [x] MIT licensed
- [x] Nimiq Mini App SDK integration
- [x] Wallet connection
- [x] Wallet-signed player-entered rounds and shareable signed records
- [ ] Skill challenge flow
- [ ] NIM reward/payment flow
- [x] Vercel production deployment
- [ ] Nimiq Pay wallet and signature testing on real devices
- [ ] 25+ real-wallet user test campaign
- [ ] Submission video and final 250-word description

## License

MIT
