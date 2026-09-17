# ParFolio Mini

**Play. Score. Sign.**

ParFolio Mini is a focused golf Mini App for Nimiq Pay. A golfer chooses a GPS-ready California course, plays and scores the round hole by hole, then signs the completed result with a Nimiq wallet to create a shareable wallet-signed golf record.

## Why it exists

Golf scores are easy to claim but hard to tie to a persistent digital identity. ParFolio Mini creates a simple record of the round details a golfer entered and binds that record to the wallet that signed it.

A wallet signature proves which wallet signed the submitted round record. It does **not** independently prove that the golf score itself is true. ParFolio Mini states this clearly in the interface and in every shared record.

## Core competition flow

1. Open ParFolio Mini inside Nimiq Pay.
2. Connect a Nimiq wallet.
3. Find a GPS-ready California course.
4. Start the round.
5. Use the full-screen golf view for hole navigation, GPS/map context and hole-by-hole scoring.
6. Finish the round.
7. Review the completed result.
8. Sign the result with Nimiq Pay.
9. Keep and share the wallet-signed golf record.

## Nimiq is core to the product

The signed-round feature is not a decorative wallet connection. The completed golf record becomes attributable to the wallet only after the golfer explicitly approves the signature in Nimiq Pay. Private keys remain in the wallet; ParFolio Mini never stores them.

## Reliability and graceful failure

The competition build is designed to avoid dead ends:

- Wallet connection failures display a recovery message instead of silently failing.
- Offline state is clearly indicated; local scoring can continue while network-dependent maps, course search and wallet signing wait for connectivity.
- GPS/location-dependent features explain when location permission or network access is required.
- Player-entered rounds remain stored locally on the device.
- Runtime failures surface a recoverable message rather than leaving an unexplained blank state.

## Course scope

The competition edition intentionally limits the playable catalog to **California GPS-ready courses**. This keeps the judged experience focused and reduces the chance of presenting incomplete course geometry as playable.

ParFolio Mini may reuse ParFolio's neutral public course-reference catalog and reviewed GPS hole geometry, but it does not read or copy ParFolio or ATG player profiles, private rounds, chat, credentials, or tester data.

## Privacy

Profile details, golf-bag selections and signed-round history used by Mini are stored on the device unless a feature explicitly requires a network provider. Location is requested only for features such as Near Me, live GPS, maps or wind. ParFolio Mini never stores wallet private keys and does not take custody of funds.

## Stack

- Vite
- Nimiq Mini App SDK
- Nimiq Pay wallet signing
- ParFolio public course-reference RPCs / reviewed GPS geometry
- Google Maps for the in-round course view
- Local device storage for Mini profile and signed-round history

## Competition positioning

ParFolio Mini is deliberately smaller than full ParFolio. The submission prioritizes a reliable end-to-end loop over feature volume:

**Choose course → Play → Score → Finish → Sign → Share**

Features that are not dependable enough for the competition build are hidden or disabled rather than presented as finished functionality.

## License

MIT
