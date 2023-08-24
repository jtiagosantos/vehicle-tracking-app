'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '../../hooks/use-map';
import { socket } from '../../lib/socket.io';
import type { Route } from '../../@types/route';

export default function AdminPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {
    socket.connect();

    socket.on(
      'admin-new-points', 
      async (data: { routeId: string, lat: number, lng: number }) => {
        if (!map?.hasRoute(data.routeId)) {
          const response = await fetch(`http://localhost:3333/api/routes/${data.routeId}`);
          const route: Route = await response.json();

          map?.removeRoute(data.routeId);

          await map?.addRouteWithIcons({
            routeId: data.routeId,
            startMarkerOptions: {
              position: route.directions.routes[0].legs[0].start_location,
            },
            endMarkerOptions: {
              position: route.directions.routes[0].legs[0].end_location,
            },
            carMarkerOptions: {
              position: route.directions.routes[0].legs[0].start_location,
            }
          });
        }

        map?.moveCar(data.routeId, {
          lat: data.lat,
          lng: data.lng,
        });
      }
    );

    return () => {
      socket.disconnect();
    }
  }, [map])

  return (
    <div style={{
      height: '100%',
      width: '100%',
    }}>
      <div 
        id="map" 
        style={{
          height: '100%',
          width: '100%',
        }}
        ref={mapContainerRef}
      />
    </div>
  );
}