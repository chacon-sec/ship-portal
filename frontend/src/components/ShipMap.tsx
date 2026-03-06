import React from 'react';

interface Waypoint {
  lat: number;
  lng: number;
}

interface ShipMapProps {
  waypoints: Waypoint[];
  currentPosition?: Waypoint;
  onWaypointClick?: (index: number) => void;
  editable?: boolean;
}

export function ShipMap({ waypoints, currentPosition, onWaypointClick, editable }: ShipMapProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw waypoints and route
    if (waypoints.length > 0) {
      // Draw route line
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const firstPoint = normalizeCoords(waypoints[0], canvas.width, canvas.height);
      ctx.moveTo(firstPoint.x, firstPoint.y);
      for (let i = 1; i < waypoints.length; i++) {
        const point = normalizeCoords(waypoints[i], canvas.width, canvas.height);
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Draw waypoints
      waypoints.forEach((waypoint, index) => {
        const point = normalizeCoords(waypoint, canvas.width, canvas.height);
        ctx.fillStyle = index === 0 ? '#ff006e' : '#00d4ff';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`W${index + 1}`, point.x, point.y + 20);
      });
    }

    // Draw current position
    if (currentPosition) {
      const point = normalizeCoords(currentPosition, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [waypoints, currentPosition]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near any waypoint
    waypoints.forEach((waypoint, index) => {
      const point = normalizeCoords(waypoint, canvasRef.current!.width, canvasRef.current!.height);
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance < 15 && onWaypointClick) {
        onWaypointClick(index);
      }
    });
  };

  return (
    <div className="ship-map">
      <h3>Navigation Map</h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onClick={handleCanvasClick}
        style={{
          border: '2px solid #00d4ff',
          borderRadius: '4px',
          cursor: editable ? 'pointer' : 'default',
          backgroundColor: '#0f3460',
        }}
      />
    </div>
  );
}

function normalizeCoords(
  coord: { lat: number; lng: number },
  width: number,
  height: number
): { x: number; y: number } {
  // Simple normalization - in production, use proper map projection
  const x = ((coord.lng + 180) / 360) * width;
  const y = ((90 - coord.lat) / 180) * height;
  return { x, y };
}
