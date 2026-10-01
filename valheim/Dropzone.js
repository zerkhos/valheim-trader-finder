import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const LOCATIONS = {
  haldor: { id: "Vendor_BlackForest", name: "Haldor" },
  hildir: { id: "Hildir_camp", name: "Hildir" },
  witch: { id: "BogWitch_Camp", name: "Bog Witch" },
  start: { id: "StartTemple", name: "Start" },
};

// Valheim's string.GetStableHashCode(), used by the new save format instead of location names
function stableHash(str) {
  let num = 5381;
  let num2 = num;
  for (let i = 0; i < str.length; i += 2) {
    num = (Math.imul(num, 33) ^ str.charCodeAt(i)) | 0;
    if (i === str.length - 1) break;
    num2 = (Math.imul(num2, 33) ^ str.charCodeAt(i + 1)) | 0;
  }
  return (num + Math.imul(num2, 1566083941)) | 0;
}

// get offset of bytes after occurrence of 'needle' that occurs at/after 'pos' in 'buf'
function findBytes(buf, pos, needle) {
  const end = buf.byteLength - needle.byteLength;
  for (let iter_buf = pos; iter_buf <= end; iter_buf++) {
    let iter_find = 0;
    while (iter_find < needle.byteLength && needle[iter_find] === buf[iter_buf + iter_find]) iter_find++;
    if (iter_find === needle.byteLength) return iter_buf + needle.byteLength;
  }
  return -1;
}

// little endian floats: x, height, z. Valheim worlds are ~10500m in radius.
function readPosition(buf, offset) {
  if (offset + 12 > buf.byteLength) return null;
  const view = new DataView(buf.buffer, buf.byteOffset + offset, 12);
  const x = view.getFloat32(0, true);
  const height = view.getFloat32(4, true);
  const y = view.getFloat32(8, true);
  const valid = [x, height, y].every(Number.isFinite) &&
    Math.abs(x) < 11000 && Math.abs(y) < 11000 && Math.abs(height) < 5000;
  return valid ? { x, y, z: height } : null;
}

function findLocations(buf, needle) {
  const locations = [];
  let offset = findBytes(buf, 0, needle);
  while (offset !== -1) {
    const position = readPosition(buf, offset);
    if (position) locations.push(position);
    offset = findBytes(buf, offset, needle);
  }
  return locations;
}

function getLocations(buf, { id, name }) {
  // new format (.db2): int32 stable hash, followed by position
  const hash = new Uint8Array(4);
  new DataView(hash.buffer).setInt32(0, stableHash(id), true);
  let locations = findLocations(buf, hash);
  // legacy format (.db): location name string, followed by position
  if (locations.length === 0) locations = findLocations(buf, new TextEncoder().encode(id));
  console.log(`found ${locations.length} ${name}`, locations);
  return locations.length === 0 ? [name + "'s not found.", locations] : [null, locations];
}

// .db2 files are a small header followed by a gzip stream, whose length precedes it
async function decompressDb2(buf) {
  const gzipStart = findBytes(buf, 0, new Uint8Array([0x1f, 0x8b, 0x08])) - 3;
  if (gzipStart < 0) throw new Error("This .db2 file does not look like a Valheim world.");
  let gzipEnd = buf.byteLength;
  if (gzipStart >= 4) {
    const length = new DataView(buf.buffer, buf.byteOffset + gzipStart - 4, 4).getUint32(0, true);
    if (gzipStart + length <= buf.byteLength) gzipEnd = gzipStart + length;
  }
  const stream = new Blob([buf.subarray(gzipStart, gzipEnd)])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// World name is the first string in .fwl2 (after int32 length and int32 version)
async function readWorldName(fwlFile) {
  const buf = new Uint8Array(await fwlFile.arrayBuffer());
  const length = buf[8];
  if (!length || length > 127 || 9 + length > buf.byteLength) return null;
  return new TextDecoder().decode(buf.subarray(9, 9 + length));
}

// New saves are a folder (worlds_local/<world>/) holding _main.<n>.db2; pick the newest one
function pickWorldFile(files) {
  const db2Files = files
    .filter((file) => file.name.endsWith(".db2"))
    .sort((a, b) => saveNumber(b) - saveNumber(a));
  if (db2Files.length > 0) return db2Files[0];
  return files.find((file) => file.name.endsWith(".db"));
}

function saveNumber(file) {
  const match = file.name.match(/\.(\d+)\.db2$/);
  return match ? parseInt(match[1], 10) : -1;
}

async function getWorldName(file, files) {
  if (!file.name.endsWith(".db2")) return file.name.slice(0, -".db".length);
  const fwlFile = files.find((f) => f.name === file.name.replace(/\.db2$/, ".fwl2"));
  const fwlName = fwlFile && (await readWorldName(fwlFile));
  if (fwlName) return fwlName;
  const folders = (file.path || "").split(/[\\/]/).filter(Boolean);
  return folders.length > 1 ? folders[folders.length - 2] : "your world";
}

export function Dropzone({ onLocationsFound }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(async (acceptedFiles) => {
    setError("");
    const worldFile = pickWorldFile(acceptedFiles);
    if (!worldFile) {
      setError("No world files were found. Drop your world folder (or its _main.*.db2 file), or a legacy .db file.");
      return;
    }
    setLoading(true);
    try {
      let buf = new Uint8Array(await worldFile.arrayBuffer());
      if (worldFile.name.endsWith(".db2")) buf = await decompressDb2(buf);
      const [errorHaldor, locationsHaldor] = getLocations(buf, LOCATIONS.haldor);
      const [errorHildir, locationsHildir] = getLocations(buf, LOCATIONS.hildir);
      const [errorWitch, locationsWitch] = getLocations(buf, LOCATIONS.witch);
      const [, locationStart] = getLocations(buf, LOCATIONS.start);
      if (errorHaldor && errorHildir && errorWitch) {
        setError(errorHaldor + " " + errorHildir + " " + errorWitch);
        return;
      }
      const worldName = await getWorldName(worldFile, acceptedFiles);
      onLocationsFound([worldName, locationsHaldor, locationsHildir, locationsWitch, locationStart]);
    } catch (e) {
      console.error(e);
      setError("Could not read " + worldFile.name + ": " + e.message);
    } finally {
      setLoading(false);
    }
  }, [onLocationsFound]);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{
        padding: "1rem 2rem",
        background: "#efefef",
        border: "1px dashed #aeaeae",
        borderRadius: "0.5rem",
      }}
    >
      {error && (
        <div
          style={{
            background: "#FFEBEE",
            border: '1px solid #D32F2F',
            borderRadius: '0.5rem',
            color: "#C62828",
            padding: "0.5rem 1rem",
          }}
        >
          {error}
        </div>
      )}
      <input {...getInputProps()} />
      <p>
        {loading
          ? "Reading your world…"
          : "Drop your world folder here (or its _main.*.db2 file, or a legacy world.db)"}
      </p>
    </div>
  );
}
