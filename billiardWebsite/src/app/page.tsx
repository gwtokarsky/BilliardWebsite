"use client";
import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import background from "/public/Geometric-Background-1187.png"; // Ensure this path is correct

import Game from "./game";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const [userID, setUserID] = useState("");

  useEffect(() => {
    const getUserIDFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("user_id");
    };

    setUserID(getUserIDFromURL() ?? "");
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-24"
      style={{
        backgroundImage: `url(${background.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Game user_id={userID} />
      <ToastContainer />
    </main>
  );
}