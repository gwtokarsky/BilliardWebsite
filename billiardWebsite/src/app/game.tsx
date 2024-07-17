"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import * as d3 from 'd3';
import { Console } from 'console';
import { getCoversWithCorners, getRegionsWithCorners, claimCover, getUser, getUsernameFromId, deleteAllSessionsForUser, getClaimedCoversForUser, getLeaderboard, getMostRecentCompletionData, getCompletedCoversForUser, getUserPoints, getAllClaimants, setLogoForUser, updateInfoForUser, getInfoForUser, getLogoForUser, getUserIdFromCookie, getDefaultLogo} from '@/actions/actions';
import { ToastContainer, toast } from 'react-toastify';
import { get } from 'http';
import Modal from './modal';

interface Polygon {
  points: [number, number][];
  fillColor?: string;
  fillOpacity?: number;
  stroke?: string;
  image?: any;
}

const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };

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

const buttonStyle = {
  marginTop: '15px',
  padding: '2px 5px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#6c757d',
  color: '#fff',
  cursor: 'pointer',
  width: 'auto',
  fontSize: '12px',
};

const redButtonStyle = {
  marginTop: '15px',
  padding: '2px 5px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'maroon',
  color: '#fff',
  cursor: 'pointer',
  width: 'auto',
  fontSize: '12px',
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
  border: '3px solid black',
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

const Game: React.FC<Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(500);
  const [translate, setTranslate] = useState([0, 0]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedCover, setSelectedCover] = useState(null);
  const [regions, setRegions] = useState([]);
  const [covers, setCovers] = useState<any>([]);
  const [username, setUsername] = useState("");
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [showAllRecentCompletions, setShowAllRecentCompletions] = useState(false);
  const [clamimedCovers, setClaimedCovers] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompletionsModalOpen, setIsCompletionsModalOpen] = useState(false);
  const [isClaimantsModalOpen, setIsClaimantsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [recentCompletions, setRecentCompletions] = useState([]);
  const [completedCovers, setCompletedCovers] = useState([]);
  const [isMyModalOpen, setIsMyModalOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [claimants, setClaimants] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [userIdTryCount, setUserIdTryCount] = useState(0);
  const [newInfo, setNewInfo] = useState("");
  const [userId, setUserId] = useState("");

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader: FileReader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage((reader.result as string));
      };
      reader.readAsDataURL(file);
    }
  };

  const loadImage = (src: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };


  const loadRegions = async () => {
    const regionLoad = await getRegionsWithCorners();
    await setRegions(regionLoad);
    const coverLoad = await getCoversWithCorners();
    await setCovers(coverLoad);
    const leaderboard = await getLeaderboard();
    await setLeaderboardData(leaderboard);
    const recentCompletions = await getMostRecentCompletionData();
    await setRecentCompletions(recentCompletions);
  };

  const getRegions = async () => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;

    // Draw background polygon
    const polygonList: Polygon[] = [
      {
        points: [[0, canvasSize], [0, 0], [canvasSize, canvasSize]],
        fillColor: 'grey',
      },
    ];

    //get regions and add them to the polygon list
    regions.map(async (region: any) => {
      const corners = region.corners.map((corner: any) => [corner.f1 / 180 * canvasSize, (180 - corner.f2) / 180 * canvasSize]);  
      const polygon: Polygon = {
        points: corners,
        fillColor: region.region_color
      };

      polygonList.push(polygon);
    });

    const incompletePolygonList = [] as Polygon[];
    const claimedPolygonList = [] as Polygon[];
    await Promise.all(await covers.map(async (region: any) => {
      const corners = region.corners.map((corner: any) => [corner.f1 / 180 * canvasSize, (180 - corner.f2) / 180 * canvasSize]);  
      let border;
      let img;
      if (region.claimed) {
        border = 'yellow';
      }
      else if (!region.completed) {
        border = 'maroon';
      }

      
      
      let polygon: Polygon 
      if (region.completed && region.logo !== null && region.logo !== undefined && region.logo !== "") {
        img = await loadImage(region.logo);
        polygon = {
          points: corners,
          stroke: border,
          image: img
        };
      }
      else {
        polygon = {
          points: corners,
          stroke: border
        };
      }

      if (border == 'maroon') {
        await incompletePolygonList.push(polygon);
      }
      else if (border == 'yellow') {
        await claimedPolygonList.push(polygon);
      }
      else {
        await polygonList.push(polygon);
      }
    }));

    
    for (let i = 0; i < incompletePolygonList.length; i++) {
      polygonList.push(incompletePolygonList[i]);
    } 
    for (let i = 0; i < claimedPolygonList.length; i++) {
      polygonList.push(claimedPolygonList[i]);
    }

    let reflectedPolygonList = [] as Polygon[];
    polygonList.forEach(polygon => {
      reflectedPolygonList.push(polygon);
      let newPolygon = {...polygon};
      newPolygon.points = polygon.points.map(point => [canvasSize - point[1], canvasSize - point[0]]);
      reflectedPolygonList.push(newPolygon);
      newPolygon = {...polygon};
      newPolygon.points = polygon.points.map(point => [point[0], canvasSize - point[1] + point[0]]);
      reflectedPolygonList.push(newPolygon);
      newPolygon = {...polygon};
      newPolygon.points = polygon.points.map(point => [canvasSize - point[1], canvasSize - point[1] + point[0]]);
      reflectedPolygonList.push(newPolygon);
      newPolygon = {...polygon};
      newPolygon.points = polygon.points.map(point => [point[1] - point[0], canvasSize - point[0]]);
      reflectedPolygonList.push(newPolygon);
      newPolygon = {...polygon};
      newPolygon.points = polygon.points.map(point => [point[1] - point[0], point[1]]);
      reflectedPolygonList.push(newPolygon);
    });
    await setPolygons(reflectedPolygonList);
  };

  const findContainingCover = async (x: number, y: number) => {
    // let containing_region = null;
    // for (let i = 0; i < regions.length; i++) {
    //   const corners = regions[i].corners.map((corner: any) => [corner.f1, corner.f2]);
    //   if(d3.polygonContains(corners, [x, y])) {
    //     containing_region = regions[i];
    //     break;
    //   }
    // }
    // if (!containing_region) {
    //   return null;
    // }
    // const response2 = await getCoversFromRegionWithCorners(containing_region.region_id);
    let containing_cover = null;
    let actuals = [x,y,180 - x - y];
    actuals.sort((a, b) => a - b);
    let actualx = actuals[0];
    let actualy = actuals[1];
    for (let i = 0; i < covers.length; i++) {
      
      const corners = covers[i].corners.map((corner: any) => [corner.f1, corner.f2]);
      if(d3.polygonContains(corners, [actualx, actualy])) {
        containing_cover = covers[i];
        break;
      }
    }
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
        const adjustedX = (relativeX - translate[0]) / canvasSize * 180 / zoom;
        const adjustedY = 180 - (relativeY - translate[1]) / canvasSize * 180 / zoom;

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
    
    // Clean up event listeners when component unmounts
    return () => {
      canvasRef.current!.removeEventListener('mousemove', handleMouseMove);
    };
  }, [zoom]); // Re-run effect when zoom changes

  const setClaimedCoversFront = async () => {
    await setClaimedCovers(await getClaimedCoversForUser(userId));
  }


  useEffect(() => {
    getRegions();
    render();
    setClaimedCoversFront();

    setUserIdTryCount(userIdTryCount + 1);
    getUserInfo();
  }, [covers]);

  useEffect(() => {
    const handleMouseClick = async (e: MouseEvent) => {
      console.log(mousePosition);
      let cover = await findContainingCover(mousePosition.x, mousePosition.y);
      if (cover !== null) {
        console.log(cover);
        await setSelectedCover(cover);
        await handleSetClaimant(cover.cover_id);
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

  async function getUserInfo() {
    const user_id = await getUserIdFromCookie();
    if (user_id === null) {
      window.location.href = '/login';
    }
    await setUserId(user_id);
    const username = await getUsernameFromId(user_id);
    await setUsername(username);
    const coversForUser = await getCompletedCoversForUser(user_id);
    await setCompletedCovers(coversForUser);
    const total_points = await getUserPoints(user_id);
    await setPoints(total_points);
    const info = await getInfoForUser(user_id);
    await setNewInfo(info);
    const logo = await getLogoForUser(user_id);
    await setSelectedImage(logo);
  }

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

  const render = () => {
    // Get canvas context
    const canvas = d3.select(canvasRef.current);
    canvas.style('border', '5px solid white')
      .style('box-shadow', 'inset 0 0 0 10px black')
      .style('outline', '10px solid black')
    const context = canvas.node()!.getContext('2d');

    if (!context) {
      throw new Error("Could not create 2D rendering context.");
    }

    // Clear canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.save();
    context.scale(zoom, zoom);
    context.translate(translate[0] / zoom, translate[1] / zoom);

    polygons.forEach(polygon => {
      context.beginPath();
      context.moveTo(polygon.points[0][0], polygon.points[0][1]);
      polygon.points.slice(1).forEach(point => {
        context.lineTo(point[0], point[1]);
      });
      context.closePath();
      context.fillStyle = polygon.fillColor ?? 'transparent';
      context.lineWidth = Math.min(0.5, 4 / zoom);
      context.strokeStyle = polygon.stroke ?? 'black';

      if (polygon.stroke == 'maroon') {
        context.lineWidth /= 2.3;
      } 
      else if (polygon.stroke == 'yellow') {
        context.lineWidth /= 10;
      }

      context.stroke();
      context.globalAlpha = polygon.fillOpacity ?? 1;
      context.fill();
    
      // Check if it's a 4-point polygon and there's a selected image)
      if (polygon.points.length === 4 && polygon.image !== null && polygon.image !== undefined) {
        // Calculate dimensions of the polygon
        const width = polygon.points[2][0] - polygon.points[0][0];
        const height = polygon.points[2][1] - polygon.points[0][1];
    
        // Calculate scaling factors to fit image within polygon
        const scaleX = width / polygon.image.width;
        const scaleY = height / polygon.image.height;
        const scale = Math.min(scaleX, scaleY);
    
        // Calculate center position of the polygon
        const centerX:any = d3.mean(polygon.points.map(point => point[0]));
        const centerY:any = d3.mean(polygon.points.map(point => point[1]));
    
        // Calculate position to center the image
        
        const offsetX = centerX - (polygon.image.width * scale) / 2;
        const offsetY = centerY - (polygon.image.height * scale) / 2;
    
        // Save the current context state before clipping
        context.save();
        // Set the clipping path to the polygon
        context.beginPath();
        context.moveTo(polygon.points[0][0], polygon.points[0][1]);
        polygon.points.slice(1).forEach(point => {
          context.lineTo(point[0], point[1]);
        });
        context.closePath();
        context.clip();
    
        // Apply transformations
        context.translate(offsetX, offsetY);
        context.scale(scale, scale);
        context.drawImage(polygon.image, 0, 0);
    
        // Restore the context to remove the clipping path
        context.restore();
      }
    });

    // Reset transformations to draw fixed text
    context.restore();
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix
    let regex = /[\{\}\[\]:]/g
    context.font = '14px Arial';
    context.fillStyle = 'gold'; // Set the fill color to gold
    context.strokeStyle = 'black'; // Set the stroke color to black
    
    context.lineWidth = 3; // Set the outline width

    const infoLines = [
      `X: ${mousePosition.x.toFixed(2)} ` + 
      `Y: ${mousePosition.y.toFixed(2)}`,
      `Zoom: ${(zoom > 1.001 ? "+" : "") + (zoom > 1.001 || zoom < 0.999 ? ((zoom - 1) * 100).toFixed(0).toString() + '%' : 'Default')}`,
    ];

    infoLines.forEach((line, index) => {
      const y = 20 + index * 20;
      context.strokeText(line, 10, y); // Draw the outline
      context.fillText(line, 10, y); // Fill the text
    });

    context.restore();
  };

  const handleSetClaimant = async (cover_id: number) => {
    await getAllClaimants(cover_id).then((res) => {
      setClaimants(res);
    });
  }

  const getCoverInfo = () => {
    if (selectedCover === null) {
      return (
        <div>
          <p>No Selected Cover</p>
        </div>
      );
    }
    return (
      <div>
        <p>Points: {(selectedCover as any).cover_points || "Immeasurable"}</p>
        <p>Corners: {JSON.stringify((selectedCover as any).corners)
          .replace(/"f1"/g, "").replace(/,/g, "").replace(/"f2"/g, ",").replaceAll('}{', ' ').replaceAll(/[\{\}\[\]:]/g, '')}</p>
        <p>{(selectedCover as any).completed ? (
            <>
              Completed by: <br />
              {(selectedCover as any).info ?? 'An Anonymous Hunter'}
            </>
          ) : (
            <>
              Incomplete <br />
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <p>
                  <button
                    style={buttonStyle}
                    onClick={async () => {
                      if (selectedCover) {
                        const res = await claimCover((selectedCover as any).cover_id, userId)
                        if (res) {
                          //toast success
                          toast("Claimed successfully", { type: "success" })
                          loadRegions()
                        }
                        else {
                          //toast failure
                          if (clamimedCovers.length >= 2) {
                            toast("You have already claimed two covers", { type: "error" })
                          }
                          else {
                            toast("You have already claimed this cover", { type: "error" })  
                          }
                        }
                      }
                    }}
                  >
                    Claim
                  </button>
                </p>
                <p>{(selectedCover as any).claimed ? (
                  <>
                    <button style={{...buttonStyle, marginLeft: 10}} onClick={() => {
                      setIsClaimantsModalOpen(true);
                    }}>View All Claimants</button>
                  </>
                ) : <h2 style={{marginLeft: 10, marginTop: 14}}>unclaimed</h2>}</p>

                <Modal isOpen={isClaimantsModalOpen} onClose={() => setIsClaimantsModalOpen(false)}>
                  <div>
                    <h1 style={sectionHeaderStyle}>All Claimants</h1>
                    {claimants?.length ? (
                      <div>
                        {claimants.map((claimant: any) => (
                          <div style={playerStyle}>
                            <div><span>{claimant.username}</span></div>
                            <div><span>{(claimant.total_points || "0") + " Total Points"}</span></div>
                            <div><span>{claimant.date.toLocaleDateString('en-US', dateOptions)}</span></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No claimants found.</p>
                    )}
                  </div>
                </Modal>

              </div>
                {/*
                <button
                  onClick={async () => {
                    if (selectedCover) {
                      const res = await completeCoverRequest((selectedCover as any).cover_id, userId)

                      if (res) {
                        //toast success
                        toast("Completed successfully", { type: "success" })
                        loadRegions()
                      }
                      else {
                        //toast failure
                        toast("Completion failed", { type: "error" })
                      }
                    }
                  }}
                >
                  Complete 
                </button>
                */}
            </>
          )}</p>
      </div>
    );
  }

  const logout = () => {
    const doLogout = async () => {
      await deleteAllSessionsForUser(userId);
      window.location.href = '/login';
    }
    doLogout();
  }

  useEffect(() => {
    render();
  }, [zoom, selectedCover, mousePosition]);

  const getCoverOne = () => {
    if (clamimedCovers.length > 0) {
      return clamimedCovers[0].points + " Points"; 
    }
    return 'None';
  }
  const getCoverTwo = () => {
    if (clamimedCovers.length > 1) {
      return clamimedCovers[1].points + " Points"; 
    }
    return 'None';
  }

  const getCoverCornersOne = () => {
    if (clamimedCovers.length > 0) {
      return "Corners: " +  JSON.stringify(clamimedCovers[0].corners).replace(/"f1"/g, "").replace(/,/g, "").replace(/"f2"/g, ",").replaceAll('}{', ' ').replaceAll(/[\{\}\[\]:]/g, '');
    }
  }

  const getCoverCornersTwo = () => {
    if (clamimedCovers.length > 1) {
      return "Corners: " +  JSON.stringify(clamimedCovers[1].corners).replace(/"f1"/g, "").replace(/,/g, "").replace(/"f2"/g, ",").replaceAll('}{', ' ').replaceAll(/[\{\}\[\]:]/g, '');
    }
  }
  const handleSubmitChange = async () => {
    await updateInfoForUser(userId, newInfo);
    await setLogoForUser(userId, selectedImage);
    window.location.reload();
  }

  return (
    <div>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Profile: {username}</div>
            <p>Total Score: {points || 0} Points</p>
            <p>Your First Cover: {getCoverOne()}</p>
            <p>{getCoverCornersOne()}</p>
            <p>Your Second Cover: {getCoverTwo()}</p>
            <p>{getCoverCornersTwo()}</p>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <p><button style={{...buttonStyle, marginRight: 10}} onClick={() => setIsEditProfileModalOpen(true)}>Edit Profile</button></p>
              <button onClick={() => setIsMyModalOpen(true)} style={buttonStyle}>View Your Covers</button><br></br>
            </div>
            <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)}>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="newInfo">Change Display Name:</label><br />
                <input
                  type="text"
                  id="newInfo"
                  name="newInfo"
                  value={newInfo}
                  style={{width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box' as 'border-box'}}
                  onChange={(e) => setNewInfo(e.target.value)}
                  required
                />
                <p style={{ fontSize: '10px', textAlign: 'center' }}>Note: the display name will be shown on completed covers and on the leaderboard</p>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <h2>Upload Completion Logo</h2>
                <input type="file" accept="image/*" onChange={handleFileChange} required />
              </div>
              {selectedImage && (
                <div style={{ marginBottom: '10px' }}>
                  <h3>Selected Image:</h3>
                  <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                </div>
              )}
              <button style={{...redButtonStyle, marginTop: '10px' }} onClick={handleSubmitChange}>Submit Change</button>
            </Modal>
            <Modal isOpen={isMyModalOpen} onClose={() => setIsMyModalOpen(false)}>
              <h1 style={sectionHeaderStyle}>Completions</h1>
              {completedCovers.map((cover:any) => (
                <div style={playerStyle}>
                  <div><span style={playerNameStyle}>{JSON.stringify(cover.corners).replace(/"f1"/g, "").replace(/,/g, "").replace(/"f2"/g, ",").replaceAll('}{', ' ').replaceAll(/[\{\}\[\]:]/g, '')}</span></div>
                  <div style={playerScoreStyle}>{cover.completion_date.toLocaleDateString('en-US', dateOptions)}</div>
                  <div style={playerScoreStyle}>{cover.points}</div>
                </div>
              ))}
            </Modal>
            <button onClick={logout} style={redButtonStyle}>Logout</button>
          </div>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Cover Info</div>
            {getCoverInfo()}           
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
            {leaderboardData.slice(0, 3).map((player:any) => (
            <div style={playerStyle}>
              <div><span style={playerNameStyle}>{player.name || "Anonymous Hunter"}</span></div>
              <div style={playerScoreStyle}>{player.total_points}</div>
            </div>
            ))}
            <button style={buttonStyle} onClick={() => setIsModalOpen(true)}>
              View More
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <h1 style={sectionHeaderStyle}>Leaderboard</h1>
              {leaderboardData.map((player:any) => (
                <div style={playerStyle}>
                  <div><span style={playerNameStyle}>{player.name || "Anonymous Hunter"}</span></div>
                  <div style={playerScoreStyle}>{player.total_points < 0.1 ?  "Immeasurable" : player.total_points}</div>
                </div>
              ))}
            </Modal>
          </div>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Most Recent Completions</div>
            {recentCompletions.slice(0, 3).map((completion:any, index) => (
              <div key={index} style={playerStyle}>
                <div><span style={playerNameStyle}>{completion.name || "Anonymous Hunter"}</span></div>
                <div style={{ color: '#666' }}>{completion.date.toLocaleDateString('en-US', dateOptions)}</div>
              </div>
            ))}
            <button style={buttonStyle} onClick={() => setIsCompletionsModalOpen(true)}>
              View More
            </button>

            <Modal isOpen={isCompletionsModalOpen} onClose={() => setIsCompletionsModalOpen(false)}>
              <h1 style={sectionHeaderStyle}>Recent Completions</h1>
              {recentCompletions.map((completion:any, index) => (
                <div key={index} style={playerStyle}>
                  <div><span style={playerNameStyle}>{completion.name || "Anonymous Hunter"}</span></div>
                  <div style={{ color: '#666' }}>{completion.date.toLocaleDateString('en-US', dateOptions)}</div>
                </div>
              ))}
            </Modal>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', top: '10px', left: '80px' }}>
        
      </div>
    </div>
  );
};

export default Game;

