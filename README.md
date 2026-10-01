# Valheim Traders Finder (updated)

Find Haldor, Hildir and the Bog Witch without all the stress and spoilers.

### 👉 Use it here: https://valheim-trader-finder-updated.vercel.app/

> [!IMPORTANT]
> **This is the updated version that works with current Valheim (tested on 1.0.16, October 2026).**
>
> Valheim changed how worlds are saved. Each world is now a folder of `.db2` / `.chunk` files instead of a single `world.db`.
> The older sites below **cannot read these new saves** and will say no traders were found:
>
> - ~~valheim-trader-finder.vercel.app~~ (original by morinted)
> - ~~valheim-traders-finder.vercel.app~~ (shudnal's version with Hildir and Bog Witch)
>
> If your world was created or saved with a recent version of the game, use the link above.

## Instructions

1. Open https://valheim-trader-finder-updated.vercel.app/
2. Drop your world folder from
   `%userprofile%\AppData\LocalLow\IronGate\Valheim\worlds_local\<your world>`
   (or just its newest `_main.*.db2` file)
3. Get RPG-friendly directions to the nearest traders from spawn
4. Or, if you want, see a full map of all spots

Old single-file `world.db` saves still work too.

Your file is read entirely in your browser. Nothing is uploaded.

## What changed in this version

- **Supports the new world save format.** Worlds are now saved as a folder
  (`worlds_local/<world>/`) containing `_main.<n>.db2`, `_main.<n>.fwl2` and
  several `.chunk` files.
- **New parser for `.db2` files.** The location list is a gzip-compressed block
  inside `_main.<n>.db2`, and location names (`Vendor_BlackForest`, `Hildir_camp`,
  `BogWitch_Camp`, `StartTemple`) are no longer stored as text. They are stored as
  Valheim's 32-bit `GetStableHashCode` of the name, followed by the x / height / z
  position. The app decompresses the block in the browser and looks up those hashes.
- **Drop the whole folder.** The newest save (highest `<n>`) is picked automatically,
  and the world name is read from the `.fwl2` file.
- **Legacy `.db` worlds still supported** with the original text search.
- Clearer error and loading messages.

## Development

- Clone repository
- `yarn install`
- `yarn dev`

## Key Files

- `valheim/Dropzone` has the logic for reading save files and parsing locations
- `valheim/WorldMap` is the code for the map component
- `valheim/Hint` calculates the closest merchant and creates the text to send you there

## Credits

- Originally created by [morinted](https://github.com/morinted) ([original project](https://github.com/morinted/valheim-trader-finder))
- Hildir and Bog Witch support by [shudnal](https://github.com/shudnal/valheim-trader-finder)
- Location parsing adapted from [this JSFiddle](https://jsfiddle.net/b7mjeuan/)
- Updated for the new `.db2` world save format by [zerkhos](https://github.com/zerkhos)
