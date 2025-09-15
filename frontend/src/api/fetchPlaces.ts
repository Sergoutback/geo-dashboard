export type Place = { id:number; name:string; city:string; lat:number; lon:number };

export async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch('/places.json');
  if (!res.ok) throw new Error(`Failed to load places.json: HTTP ${res.status}`);
  return res.json();
}
