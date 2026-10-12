# Wordly vocabulary data

The app bundles a 15,000-entry offline vocabulary bank in `data/vocabulary-bank.json`, loaded by `lib/vocabulary-bank.generated.ts`.

## Sources and attribution

- **wordfreq-en-25000**: frequency-ranked English words derived from the `wordfreq` project. The extracted list is distributed under **CC BY-SA 4.0**. Source: https://github.com/aparrish/wordfreq-en-25000
- **ECDICT**: English–Chinese dictionary entries, including phonetics, English definitions and Chinese translations. Source: https://github.com/skywind3000/ECDICT

The generated bank keeps the first 15,000 alphabetic entries from the frequency list and assigns them to the requested cumulative tiers: 2,000 Beginner, 5,000 Intermediate, 9,000 Advanced and 15,000 Expert. Existing curated lesson entries remain in the app and override generated metadata when the same word is present.

The generated JSON is the only vocabulary data imported into the app bundle; the original source downloads are intentionally not committed to keep deployments lightweight.
