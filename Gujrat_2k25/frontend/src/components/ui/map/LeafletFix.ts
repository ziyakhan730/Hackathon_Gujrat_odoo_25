import L from 'leaflet';

// Fix default icon paths for Leaflet when bundled
// Should be imported once before using react-leaflet components
export function configureLeafletDefaultIcon(): void {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // @ts-ignore - delete private property if it exists
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  });
} 