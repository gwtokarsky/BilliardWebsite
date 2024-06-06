"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import * as d3 from 'd3';
import { Console } from 'console';
import { getCoversFromRegionWithCorners, getCoversWithCorners, getRegionsWithCorners, claimCover, getUser, getUsernameFromId, completeCover} from '@/actions/actions';
import { get } from 'http';

interface Polygon {
  points: [number, number][];
  fillColor?: string;
  fillOpacity?: number;
  stroke?: string;
}
const leaderboardData = [
  { rank: 1, name: 'Alice', score: 1500 },
  { rank: 2, name: 'Bob', score: 1400 },
  { rank: 3, name: 'Charlie', score: 1300 },
  { rank: 4, name: 'David', score: 1200 },
  { rank: 5, name: 'Eve', score: 1100 },
  { rank: 4, name: 'David', score: 1200 },
];

const recentCompletions = [
  { player: 'Frank', score: 1000, date: '2024-06-05' },
  { player: 'Grace', score: 900, date: '2024-06-04' },
  { player: 'Heidi', score: 800, date: '2024-06-03' },
  { player: 'Ivan', score: 700, date: '2024-06-02' },
  { player: 'Judy', score: 600, date: '2024-06-01' },
  { player: 'Mallory', score: 500, date: '2024-05-31' },
  { player: 'Oscar', score: 400, date: '2024-05-30' },
];

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',

};

const headerStyle = {
  margin: '10px',
};

const canvasStyle = {
  margin: '10px',
  border: '1px solid #ddd',
  borderRadius: '8px',
};

const leaderboardStyle = {
  margin: '10px',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  backgroundColor: '#f9f9f9',
};

const leaderboardHeaderStyle = {
  marginBottom: '10px',
  fontSize: '1.2em',
  borderBottom: '2px solid #ddd',
  paddingBottom: '5px',
};

const playerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '5px 0',
  borderBottom: '1px solid #eee',
};

const playerNameStyle = {
  fontWeight: 'bold',
};

const playerScoreStyle = {
  color: '#666',
};
interface Props {
  user_id: string;
}

const sectionStyle = {
  margin: '10px',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  backgroundColor: '#f9f9f9',
};

const sectionHeaderStyle = {
  marginBottom: '10px',
  fontSize: '1.2em',
  borderBottom: '2px solid #ddd',
  paddingBottom: '5px',
};

const Game: React.FC<Props> = ({ user_id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(500);
  const [renderFlag, setRenderFlag] = useState(false);
  const [translate, setTranslate] = useState([0, 0]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedCover, setSelectedCover] = useState(null);
  const [selectedCorners, setSelectedCorners] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [isSelectedComplete, setIsSelectedComplete] = useState(false);
  const [regions, setRegions] = useState([]);
  const [covers, setCovers] = useState([]);
  const [userInfo, setUserInfo] = useState("");  
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [showAllRecentCompletions, setShowAllRecentCompletions] = useState(false);


  const loadRegions = async () => {
    const response = await getRegionsWithCorners();
    await setRegions(response);
    const response2 = await getCoversWithCorners();
    await setCovers(response2);
  };

  const getRegions = async () => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    const p: Polygon[] = [
      {
        points: [[0, canvasSize], [0, 0], [canvasSize, canvasSize]],
        fillColor: 'grey',
      },
    ];

    regions.map(async (region: any) => {
      const corners = region.corners.map((corner: any) => [corner.f1 / 180 * canvasSize, (180 - corner.f2) / 180 * canvasSize]);  
      const polygon: Polygon = {
        points: corners,
        fillColor: region.region_color
      };

      p.push(polygon);
      await setPolygons(p);
      await new Promise(r => setTimeout(r, 1000));
    });

    const ptempcomplete = [] as Polygon[];
    const ptempclaimed = [] as Polygon[];
    await covers.map(async (region: any) => {
      const corners = region.corners.map((corner: any) => [corner.f1 / 180 * canvasSize, (180 - corner.f2) / 180 * canvasSize]);  
      let s;
      if (region.completed) {
        s = 'green';
      }
      else if (region.claimed) {
        s = 'orange';
      }
      else {
        s = 'maroon';
      }
      const polygon: Polygon = {
        points: corners,
        stroke: s,
      };

      if (s === 'maroon') {
        p.push(polygon);
      }
      else if (s === 'orange') {
        ptempclaimed.push(polygon);
      }
      else {
        ptempcomplete.push(polygon);
      }
    });

    for (let i = 0; i < ptempclaimed.length; i++) {
      p.push(ptempclaimed[i]);
    }
    for (let i = 0; i < ptempcomplete.length; i++) {
      p.push(ptempcomplete[i]);
    } 
    await setPolygons(p);
  };

  const findContainingCover = async (x: number, y: number) => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    console.log(x,y)
    const response = await getRegionsWithCorners();
    let containing_region = null;
    for (let i = 0; i < response.length; i++) {
      console.log(response[i].corners)
      const corners = response[i].corners.map((corner: any) => [corner.f1, corner.f2]);
      console.log(corners);
      if(d3.polygonContains(corners, [x, y])) {
        containing_region = response[i];
        console.log(containing_region);
        break;
      }
    }
    if (!containing_region) {
      return null;
    }
    const response2 = await getCoversFromRegionWithCorners(containing_region.region_id);
    console.log(response2);
    let containing_cover = null;
    for (let i = 0; i < response2.length; i++) {
      const corners = response2[i].corners.map((corner: any) => [corner.f1, corner.f2]);
      console.log(corners);
      if(d3.polygonContains(corners, [x, y])) {
        containing_cover = response2[i];
        break;
      }
    }
    console.log(containing_cover);
    return containing_cover;
  };


  useEffect(() => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    setScale(canvasSize);

    getRegions();

    const canvas = d3.select(canvasRef.current);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // Adjust mouse position based on scale factor
        const adjustedX = (relativeX - translate[0]) / scale * 180 / zoom;
        const adjustedY = 180 - (relativeY - translate[1]) / scale * 180 / zoom;

        setMousePosition({ 
        x: adjustedX,
        y: adjustedY
        });
    };

    const zoomBehavior: any = d3.zoom().on('zoom', (event) => {
      setZoom(event.transform.k);
      setTranslate([event.transform.x, event.transform.y]);
    });

    // Add zoom behavior
    canvas.call(zoomBehavior);

    // Add event listeners when component mounts
    canvasRef.current!.addEventListener('mousemove', handleMouseMove);
    
    if (!renderFlag) {
      setRenderFlag(true);
    }
    // Clean up event listeners when component unmounts
    return () => {
      canvasRef.current!.removeEventListener('mousemove', handleMouseMove);
    };




  }, [zoom, renderFlag]); // Re-run effect when zoom changes

  useEffect(() => {
    getRegions();
    render();
  }, [covers]);

  useEffect(() => {
    if (!(user_id === null || user_id === undefined || user_id === '')) {
      setUserId(user_id);
    }
    const handleMouseClick = async (e: MouseEvent) => {
      let cover = await findContainingCover(mousePosition.x, mousePosition.y);
      if (cover !== null) {
        await setSelectedCover(cover);
        //add a button beneath the canvas that says "claim cover" and when clicked, it will set cover to claimed by the user


      }
    };
    canvasRef.current!.removeEventListener('click', handleMouseClick);
    canvasRef.current!.addEventListener('click', handleMouseClick);
    return () => {
      canvasRef.current!.removeEventListener('click', handleMouseClick);
    };
  }, [mousePosition]);

  useEffect(() => {
    loadRegions();
  }
  , []);

  useEffect(() => {
    async function getUserInfo() {
      if (user_id === null || user_id === undefined || user_id === '') {
        return;
      }
      const username = await getUsernameFromId(userId);
      await setUsername(username);
    }
    getUserInfo();
  }, [userId]);

  const polygonLength = (polygon: Polygon) => {
    //get maximum distance between two consecutive points
    let maxDistance = 0;
    polygon.points.forEach((point, index) => {
      const nextPoint = polygon.points[(index + 1) % polygon.points.length];
      const distance = Math.sqrt((nextPoint[0] - point[0]) ** 2 + (nextPoint[1] - point[1]) ** 2);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    });
    return maxDistance;
  };

  //if userId is null, check for a user id in the props




  const render = () => {
    const canvas = d3.select(canvasRef.current);
    canvas.style('border', '3px solid black');
    const context = canvas.node()!.getContext('2d');

    if (!context) {
      throw new Error("Could not create 2D rendering context.");
    }
    context.clearRect(-10000, -10000, context.canvas.width * 10000, context.canvas.height * 10000);
    context.save();
    context.scale(zoom, zoom);
    context.translate(translate[0] / zoom, translate[1] / zoom);

    // Draw polygons
    polygons.forEach(polygon => {
      context.beginPath();
      context.moveTo((polygon.points[0][0]), polygon.points[0][1]);
      polygon.points.slice(1).forEach(point => {
        context.lineTo(point[0], point[1]);
      });
      context.closePath();
      context.fillStyle = polygon.fillColor ?? 'transparent';
      context.lineWidth = Math.min((polygonLength(polygon) / 25), 4 / zoom);
      context.strokeStyle = polygon.stroke ?? 'black';
      context.stroke();
      context.globalAlpha = polygon.fillOpacity ?? 1;
      context.fill();
    });

    // Reset transformations to draw fixed text
    context.restore();
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix
    let regex = /[\{\}\[\]:]/g
    context.font = '14px Arial';
    context.fillStyle = 'black';
    const infoLines = [
      `X: ${mousePosition.x.toFixed(2)} ` + 
      `Y: ${mousePosition.y.toFixed(2)}`,
      `Zoom: ${zoom.toFixed(2)}`,
      `Cover Point Count: ${(selectedCover as any) ? (selectedCover as any).cover_points : 'None'}`,
      `Selected Cover: ${(selectedCover as any) ? JSON.stringify((selectedCover as any).corners)
        .replace(/"f1"/g, "").replace(/,/g, "").replace(/"f2"/g, ",").replaceAll('}{', ' ').replaceAll(regex, '') : 'None'}`,
      `${(selectedCover as any) ? (selectedCover as any).info : ''}`
    ];
    infoLines.forEach((line, index) => {
      context.fillText(line, 10, 20 + index * 20);
    });

    context.restore();
  };

  useEffect(() => {
    render();
  }, [polygons, mousePosition, zoom, selectedCover]);

  return (
    <div>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Profile</div>
            {/* Add content for profile here */}
          </div>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Cover Info</div>
            {/* Add content for cover info here */}
          </div>
        </div>
        <div>
          <canvas 
            ref={canvasRef}
            width={scale}
            height={scale}
            style={canvasStyle}
          />
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Leaderboard</div>
            {(showAllLeaderboard ? leaderboardData : leaderboardData.slice(0, 5)).map((player) => (
              <div key={player.rank} style={playerStyle}>
                <div>{player.rank}. <span style={playerNameStyle}>{player.name}</span></div>
                <div style={playerScoreStyle}>{player.score}</div>
              </div>
            ))}
            <button 
              onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
            >
              {showAllLeaderboard ? 'View Less' : 'View More'}
            </button>
          </div>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Most Recent Completions</div>
            {(showAllRecentCompletions ? recentCompletions : recentCompletions.slice(0, 5)).map((completion, index) => (
              <div key={index} style={playerStyle}>
                <div><span style={playerNameStyle}>{completion.player}</span></div>
                <div style={playerScoreStyle}>{completion.score}</div>
                <div style={{ color: '#666' }}>{completion.date}</div>
              </div>
            ))}
            <button 
              onClick={() => setShowAllRecentCompletions(!showAllRecentCompletions)}
            >
              {showAllRecentCompletions ? 'View Less' : 'View More'}
            </button>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', top: '10px', left: '80px' }}>
        <button
          style={{
            position: 'fixed',
            top: `calc(${scale + 100}px)`,
            left: `calc(50% - ${scale / 2 - 50}px)`,
            transform: 'translateX(-50%)'
          }}
          onClick={async () => {
            if (selectedCover) {
              await claimCover((selectedCover as any).cover_id, user_id)
            }
          }}
        >
          Claim Cover
        </button>
        <button
          style={{
            position: 'fixed',
            top: `calc(${scale + 100}px)`,
            left: `calc(50% + ${scale / 2 - 50}px)`,
            transform: 'translateX(-50%)'
          }}

          onClick={async () => {
            if (selectedCover) {
              await completeCover((selectedCover as any).cover_id, user_id)
            }
          }}
        >
        Complete Cover
        </button>
      </div>
    </div>
  );
};

export default Game;