/**
 * Maps printed QR codes (Supabase UUIDs) → manifest storage keys.
 * Supabase is offline; this table preserves links already in the wild.
 *
 * Source: printed QR batch (user-provided), matched to public/manifest.json.
 */

export const LEGACY_QR_TRACK_MAP: Record<string, string> = {
  // al-falaq
  "39a0c20e-dfd7-4c0f-80f8-db2aa19c8c7a": "audio/al_falaq.mp3",
  // al-ikhlas
  "69f37150-a05a-4e5b-9af3-8aaa7029331f": "audio/al_Ikhlas.mp3",
  // ayat kursi
  "8fa9de07-9f21-418a-bd4b-934aa9f6b712": "audio/ayat_kursi.mp3",
  // doa berserah diri (pagi)
  "aa61cdc9-730f-4d7b-8408-35c3d2789354": "audio/doa_berserah_diri.mp3",
  // Doa Pertolongan
  "39a892ef-1697-448f-9847-48e47fff6452": "audio/doa_pertolongan.mp3",
  // Doa Memohon Ilmu
  "3e05d697-ff13-4c05-9ed1-0f0bffeb9546": "audio/Doa Memohon Ilmu dan Amal.mp3",
  // doa keselamatan
  "987ec052-c311-4efc-bdeb-55003f61db5c": "audio/doa_keselamatan.mp3",
  // doa keridaan
  "81495f52-e12b-4cc8-bf5d-98058ebd1b63": "audio/doa_keridhaan.mp3",
  // Istighfar
  "4e0a6e96-7647-470f-b9b8-0f736d362cae": "audio/istighfar.mp3",
  // Sayyidul Istighfar
  "5c6590ba-d700-4b5e-895c-c5ba044be32d": "audio/sayyidul_istighfar.mp3",
  // Tasbih Tahmid
  "e7d056b9-cbf0-41c7-b9b5-3bf9482914fb": "audio/tasbih_tahmid.mp3",
  // Doa Fitrah Pagi
  "2a0b4a84-1897-4754-985a-db68ffbf0795": "audio/doa_fitrah.mp3",
  // Doa Perlindungan Pagi
  "a3ed100e-9fe9-4327-a857-b03da8675e48": "audio/doa_perlindungan.mp3",
  // Kalimat yg Menggabungkan Banyak Kebaikan
  "36e144d0-4e07-4cc6-9428-558d240f4f6e": "audio/membaca_kalimat_yg_menggabungkan_banyak.mp3",
  // Doa Fitrah Petang
  "814e335a-3f89-48de-a249-67a285c48c00": "audio/doa_fitrah_petang.mp3",
  // Doa Perlindungan Petang
  "1aac4829-2ce3-4c94-a155-dc7f88dd464e": "audio/doa_perlindungan_petang.mp3",
  // an-nas
  "9287c627-4923-4aa1-a919-b068eaff5e42": "audio/an_nas.mp3",
  // Dzikir Petang Full
  "703779d7-4ae9-47e3-8f41-a42ef0b61824": "audio/dzikir_petang.mp3",
  // Pemberat Timbangan
  "9b6f35f0-c585-480f-a659-eaff2432e94b": "audio/dzikir_pemberat_timbangan.mp3",
  // petang 2 (evening supplement — doa perlindungan alternatif)
  "6457b1aa-55f4-498a-baec-86880dbe03c6": "audio/doa_perlindungan_2.mp3",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLegacyQrTrackId(id: string): boolean {
  return UUID_PATTERN.test(id.trim());
}

/** Resolve a legacy Supabase UUID to a manifest storage key, if known. */
export function resolveLegacyStorageKey(id: string): string | null {
  const normalized = id.trim().toLowerCase();
  return LEGACY_QR_TRACK_MAP[normalized] ?? null;
}
