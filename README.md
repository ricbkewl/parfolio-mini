# ParFolio Mini

**Play your round. Save your score. Own your golf record.**

ParFolio Mini is the competition edition of ParFolio. It lets a golfer choose a GPS-ready course, play and score a round hole by hole, then sign the completed round with a Nimiq wallet to create a shareable golf record tied to the signing wallet.

## Competition flow

1. Connect a Nimiq wallet.
2. Search a GPS-ready California course.
3. Start a round using ParFolio-reviewed course geometry.
4. Track the round hole by hole with GPS/satellite mapping and score controls.
5. Finish the round.
6. Sign the completed result with Nimiq Pay.
7. Keep and share the signed golf record from My Rounds.

## Important proof language

A wallet signature proves which wallet signed the submitted round record. It does **not** independently verify that the golf score itself is true. ParFolio Mini labels this clearly in the interface and in shared records.

## Architecture

ParFolio Mini reuses ParFolio's public course-reference catalog and reviewed GPS hole geometry. It does not read or copy ParFolio or ATG player profiles, private rounds, chat, credentials, or tester data. Competition-specific round state remains inside Mini.

## Stack

- Vite
- Nimiq Mini App SDK
- ParFolio public course-reference RPCs
- Google Maps for the in-round course view
- Local device storage for signed-round history

## License

MIT
