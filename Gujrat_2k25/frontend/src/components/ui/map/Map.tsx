import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { configureLeafletDefaultIcon } from './LeafletFix';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string | number;
  position: LatLng;
  title?: string;
  description?: string;
  onClick?: (id: string | number) => void;
}

interface MapProps {
  center: LatLng;
  zoom?: number;
  className?: string;
  height?: string | number;
  markers?: MapMarker[];
  useClusters?: boolean;
}

function MapRefresher({ center, zoom }: { center: LatLng; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom ?? map.getZoom());
  }, [center.lat, center.lng, zoom]);
  return null;
}

function InvalidateSizeOnMount({ center, zoom }: { center: LatLng; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
      map.setView([center.lat, center.lng], zoom ?? map.getZoom());
    }, 50);
    return () => clearTimeout(timeout);
  }, [center.lat, center.lng, zoom]);
  return null;
}

export function Map({ center, zoom = 13, className = '', height = 400, markers = [], useClusters = false }: MapProps) {
  useEffect(() => {
    configureLeafletDefaultIcon();
  }, []);

  const containerStyle = typeof height === 'number' ? { height: `${height}px` } : { height };

  const content = (
    <>
      {useClusters ? (
        <MarkerClusterGroup>
          {markers.map((m) => (
            <Marker key={m.id} position={[m.position.lat, m.position.lng]} eventHandlers={{ click: () => m.onClick?.(m.id) }}>
              {(m.title || m.description) && (
                <Popup>
                  <div>
                    {m.title && <div className="font-semibold mb-1">{m.title}</div>}
                    {m.description && <div className="text-sm text-gray-600">{m.description}</div>}
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MarkerClusterGroup>
      ) : (
        markers.map((m) => (
          <Marker key={m.id} position={[m.position.lat, m.position.lng]} eventHandlers={{ click: () => m.onClick?.(m.id) }}>
            {(m.title || m.description) && (
              <Popup>
                <div>
                  {m.title && <div className="font-semibold mb-1">{m.title}</div>}
                  {m.description && <div className="text-sm text-gray-600">{m.description}</div>}
                </div>
              </Popup>
            )}
          </Marker>
        ))
      )}
    </>
  );

  return (
    <div className={className} style={containerStyle}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRefresher center={center} zoom={zoom} />
        <InvalidateSizeOnMount center={center} zoom={zoom} />
        {content}
      </MapContainer>
    </div>
  );
} 