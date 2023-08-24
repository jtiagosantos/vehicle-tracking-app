'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '../../hooks/use-map';
import { sleep } from '../../utils/sleep';
import { socket } from '../../lib/socket.io';
import { Button, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { RouteSelect } from "../../components/route-select";
import type { Route } from '../../@types/route';

export default function DriverPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  const handleStartRoute = async () => {
    const routeId = (document.getElementById('route') as HTMLSelectElement).value;

    const response = await fetch(`http://localhost:3333/api/routes/${routeId}`);
    const route: Route = await response.json();

    map?.removeAllRoutes();

    await map?.addRouteWithIcons({
      routeId: routeId,
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

    const { steps } = route.directions.routes[0].legs[0];

    for (const step of steps) {
      await sleep(1500);
      map?.moveCar(routeId, step.start_location)
      socket.emit('new-points', {
        routeId,
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      });

      await sleep(1500);
      map?.moveCar(routeId, step.end_location);
      socket.emit('new-points', {
        routeId,
        lat: step.end_location.lat,
        lng: step.end_location.lng,
      });
    }
  }

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    }
  }, [])

  return (
    <Grid2 container sx={{ display: "flex", flex: 1 }}>
      <Grid2 xs={4} px={2}>
        <Typography variant="h4">Nova rota</Typography>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <RouteSelect id="route" />
          <Button variant="contained" onClick={handleStartRoute} fullWidth sx={{ mt: 1 }}>
            Iniciar a viagem
          </Button>
        </div>
      </Grid2>
      <Grid2 id="map" xs={8} ref={mapContainerRef}></Grid2>
    </Grid2>
  );
}