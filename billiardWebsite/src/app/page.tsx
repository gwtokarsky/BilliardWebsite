"use client";
import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import background from "/public/Geometric-Background-1187.png";

import Game from "./game";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const [userID, setUserID] = useState("");
  const [windowScale, setWindowScale] = useState(1);

  useEffect(() => {
    const getUserIDFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("user_id");
    };

    setUserID(getUserIDFromURL() ?? "");
    window.addEventListener("resize", () => {
      setWindowScale(window.innerWidth / 800);
    });
  }, []);

  return (
    <div className="flex flex-col">
      <main
        className="flex-1 flex flex-col items-center justify-between p-0"
        style={{
          backgroundImage: `url(${background.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          minHeight: '100vh',
        }}
      >
      <div style={{ transform: `scale(${windowScale})` }} />
        <Game user_id={userID} />
        <ToastContainer />
      </main>
      <footer className="w-full py-4 bg-gray-900 text-white text-center shadow-md mt-auto">
        <div className="container mx-auto px-6" >
          <p>The Great Periodic Path Hunt Game by George Tokarsky and Kaiden Mastel</p>
        </div>
      </footer>
    </div>
  );
}