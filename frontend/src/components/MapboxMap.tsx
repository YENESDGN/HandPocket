import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

export interface MapMarker {
    lng: number;
    lat: number;
    color?: string;
    popup?: string;
}

interface MapboxMapProps {
    className?: string;
    center?: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    route?: [number, number][];
}

export default function MapboxMap({
    className = 'w-full h-full',
    center = [28.97, 41.005],
    zoom = 10,
    markers = [],
    route = [],
}: MapboxMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef       = useRef<mapboxgl.Map | null>(null);
    const markersRef   = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        mapRef.current = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center,
            zoom,
        });
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
        return () => { mapRef.current?.remove(); mapRef.current = null; };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const apply = () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            markers.forEach(m => {
                const marker = new mapboxgl.Marker({ color: m.color ?? '#004561' })
                    .setLngLat([m.lng, m.lat]);
                if (m.popup) marker.setPopup(new mapboxgl.Popup().setText(m.popup));
                marker.addTo(map);
                markersRef.current.push(marker);
            });

            if (map.getLayer('route')) map.removeLayer('route');
            if (map.getSource('route')) map.removeSource('route');

            if (route.length > 0) {
                map.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: { type: 'LineString', coordinates: route },
                    },
                });
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#08b4fb', 'line-width': 5, 'line-opacity': 0.85 },
                });
                const lngs = route.map(([lng]) => lng);
                const lats = route.map(([, lat]) => lat);
                map.fitBounds(
                    [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                    { padding: 60 }
                );
            } else if (markers.length >= 2) {
                const lngs = markers.map(m => m.lng);
                const lats = markers.map(m => m.lat);
                map.fitBounds(
                    [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                    { padding: 80 }
                );
            } else if (markers.length === 1) {
                map.flyTo({ center: [markers[0].lng, markers[0].lat], zoom: 14 });
            }
        };

        if (map.isStyleLoaded()) apply();
        else map.once('load', apply);
    }, [markers, route]);

    return <div ref={containerRef} className={className} />;
}
