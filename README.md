# Valheim Traders Finder

Find Haldor, Hildir and Bog Witch without all the stress and spoilers.

**Works with the latest Valheim releases** (tested on 1.0.16), including the new folder-based world saves (`worlds_local/<world>/_main.*.db2`). Legacy `.db` worlds are still supported.

## Instructions

- Go to http://valheim-traders-finder.vercel.app/
- Drop your world folder from `%userprofile%\AppData\LocalLow\IronGate\Valheim\worlds_local\<world>` (or its newest `_main.*.db2` file). Legacy `world.db` files are still supported.
- Get RPG-friendly instructions to the nearest trader from spawn
- Or, if you want, see a full map of all spots

## Development

- Clone repository
- `yarn install`
- `yarn dev`

## Key Files

- `valheim/Dropzone` has the logic for parsing locations
- `valheim/WorldMap` is the code for the map component
- `valheim/Hint` calculates the closest merchant and creates the text to send you there

## Credits

- Originally created by [morinted](https://github.com/morinted) — [original project](https://github.com/morinted/valheim-trader-finder)
- Hildir and Bog Witch support by [shudnal](https://github.com/shudnal/valheim-trader-finder)
- Location parsing adapted from [this JSFiddle](https://jsfiddle.net/b7mjeuan/)
- Updated to read the new Valheim `.db2` world save format
