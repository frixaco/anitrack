import AbstractSource from "./abstract.js";

const QUALITIES = ["1080", "720", "540", "480"];

const ANY = "e*|a*|r*|i*|o*";

export default new (class Tosho extends AbstractSource {
  name = "AnimeTosho";
  description =
    "Anime Tosho is a free, completely automated service which mirrors most anime torrents. Provides high accuracy searches.";
  /** @type {import('./types.js').Accuracy} */
  accuracy = "High";

  url = atob("aHR0cHM6Ly9mZWVkLmFuaW1ldG9zaG8ub3JnL2pzb24=");

  buildQuery({ resolution, exclusions }) {
    let query = `&qx=1&q=!("${exclusions.join('"|"')}")`;
    if (resolution) {
      query += `((${ANY}|"${resolution}") !"${QUALITIES.filter(
        (q) => q !== resolution
      ).join('" !"')}")`;
    } else {
      query += ANY; // HACK: tosho NEEDS a search string, so we lazy search a single common vowel
    }

    return query;
  }

  /**
   * @param {import('./types.js').Tosho[]} entries
   * @param {boolean} batch
   * @returns {import('./types.js').Result[]}
   **/
  map(entries, batch = false) {
    return entries.map((entry) => {
      return {
        title: entry.title || entry.torrent_name,
        link: entry.magnet_uri,
        seeders: (entry.seeders || 0) >= 30000 ? 0 : entry.seeders || 0,
        leechers: (entry.leechers || 0) >= 30000 ? 0 : entry.leechers || 0,
        downloads: entry.torrent_downloaded_count || 0,
        hash: entry.info_hash,
        size: entry.total_size,
        verified: !!entry.anidb_fid,
        type: batch ? "batch" : undefined,
        date: new Date(entry.timestamp * 1000),
      };
    });
  }

  /** @type {import('./types.js').SearchFunction} */
  async single({ anidbEid, resolution, exclusions }) {
    if (!anidbEid) throw new Error("No anidbEid provided");
    const query = this.buildQuery({ resolution, exclusions });
    const res = await fetch(this.url + "?eid=" + anidbEid + query);

    /** @type {import('./types.js').Tosho[]} */
    const data = await res.json();

    if (data.length) return this.map(data);
    // TODO: this shouldn't really be required anymore? test.
    if (resolution) return this.single({ anidbEid, exclusions }); // some releases like dvd might be in weird resolutions like 540p
    return [];
  }

  /** @type {import('./types.js').SearchFunction} */
  async batch({ anidbAid, resolution, episodeCount, exclusions }) {
    if (!anidbAid) throw new Error("No anidbAid provided");
    if (episodeCount == null) throw new Error("No episodeCount provided");
    const query = this.buildQuery({ resolution, exclusions });
    const res = await fetch(this.url + "?order=size-d&aid=" + anidbAid + query);

    const data = /** @type {import('./types.js').Tosho[]} */ (
      await res.json()
    ).filter((entry) => entry.num_files >= episodeCount);

    if (data.length) return this.map(data, true);
    // TODO: this shouldn't really be required anymore? test.
    if (resolution) return this.batch({ anidbAid, episodeCount, exclusions }); // some releases like dvd might be in weird resolutions like 540p
    return [];
  }

  /** @type {import('./types.js').SearchFunction} */
  async movie({ anidbAid, resolution, exclusions }) {
    if (!anidbAid) throw new Error("No anidbAid provided");
    const query = this.buildQuery({ resolution, exclusions });
    const res = await fetch(this.url + "?aid=" + anidbAid + query);

    /** @type {import('./types.js').Tosho[]} */
    const data = await res.json();

    if (data.length) return this.map(data, true);
    // TODO: this shouldn't really be required anymore? test.
    if (resolution) return this.movie({ anidbAid, exclusions }); // some releases like dvd might be in weird resolutions like 540p
    return [];
  }
})();
