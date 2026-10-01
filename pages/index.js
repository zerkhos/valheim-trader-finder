import Head from "next/head";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import { Dropzone } from "../valheim/Dropzone";
import { Hint } from "../valheim/Hint";
import { WorldMap } from "../valheim/WorldMap";

export default function Home() {
  const [locationsHaldor, setLocationsHaldor] = useState([]);
  const [locationsHildir, setLocationsHildir] = useState([]);
  const [locationsWitch, setLocationsWitch] = useState([]);
  const [locationStart, setLocationStart] = useState([]);
  const [worldName, setWorldName] = useState("");
  const [showMap, setShowMap] = useState(false);
  return (
    <div className={styles.container}>
      <Head>
        <title>Valheim Traders Finder (updated)</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Valheim Traders Finder (updated)</h1>
        <p className={styles.compat}>
          ✔ Updated October 2026: works with the latest Valheim releases (tested on 1.0.16) and the new
          folder-based world saves (<code className={styles.code}>.db2</code>).
          Older <code className={styles.code}>.db</code> worlds are still supported.
        </p>

        <div className={styles.description}>
          <p>
            Provide your world database file if you're having trouble locating
          </p>
          <ul className={styles.ol}>
            <li>Haldor, the vendor of fine goods</li>
            <li>Hildir, the quest giver</li>
            <li>Bog Witch, the rumorous cook</li>
          </ul>
          <p>
            It is safe and you will get zero map spoilers
          </p>
          <ol className={styles.ol}>
              <li>Your data stays offline</li>
              <li>You can get roleplay-friendly directions to nearby merchants</li>
              <li>A spoiler-free map is available if you want to find the best spot where multiple merchants intersect</li>
            </ol>
          <p>
            Your local worlds are folders (one per world) in:
            <br />
            <code className={styles.code}>
              %userprofile%\AppData\LocalLow\IronGate\Valheim\worlds_local
            </code>
            <br />
            Drop the whole world folder, or just its newest <code className={styles.code}>_main.*.db2</code> file.
            Older worlds saved as a single <code className={styles.code}>.db</code> file still work too.
          </p>
          <p>
            Your cloud saved remote worlds can be found in:
            <br />
            <code className={styles.code}>
              Steam\userdata\YOUR_NUMERIC_STEAM_ID\892970\remote\worlds
            </code>
          </p>
          <Dropzone
            onLocationsFound={([worldName, locationsHaldor, locationsHildir, locationsWitch, locationStart]) => {
              setLocationsHaldor(locationsHaldor);
              setLocationsHildir(locationsHildir);
              setLocationsWitch(locationsWitch);
              setLocationStart(locationStart);
              setWorldName(worldName);
            }}
          />
        </div>

        {worldName && (
          <div className={styles.description}>
            <p>I've heard rumors of traders in {worldName}…</p>
            <Hint start={locationStart} locations={locationsHaldor} name="Haldor" color="#965317" />
            <Hint start={locationStart} locations={locationsHildir} name="Hildir" color="#000078" />
            <Hint start={locationStart} locations={locationsWitch} name="Bog Witch" color="#559617" />
            {showMap ? (
              <p>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMap(false);
                  }}
                  href="#"
                >
                  Hide Map ↑
                </a>
              </p>
            ) : (
              <p>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMap(true);
                  }}
                  href="#"
                >
                  Show me a map please…
                </a>
              </p>
            )}
          </div>
        )}

        {showMap && (
          <div className={styles.map}>
            <WorldMap locationStart={locationStart} locationsHaldor={locationsHaldor} locationsHildir={locationsHildir} locationsWitch={locationsWitch} />
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          Originally created by{" "}
          <a href="https://github.com/morinted" target="_blank" rel="noopener noreferrer">
            morinted
          </a>{" "}
          (<a href="https://github.com/morinted/valheim-trader-finder" target="_blank" rel="noopener noreferrer">
            original project
          </a>), with Hildir and Bog Witch support by{" "}
          <a href="https://github.com/shudnal/valheim-trader-finder" target="_blank" rel="noopener noreferrer">
            shudnal
          </a>
          , adapted from{" "}
          <a href="https://jsfiddle.net/b7mjeuan/" target="_blank" rel="noopener noreferrer">
            this JSFiddle
          </a>
          . Updated for the latest Valheim save format.
        </p>
      </footer>
    </div>
  );
}
