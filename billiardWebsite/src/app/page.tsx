"use client"
import { getUsers } from "@/actions/actions";
import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';

import Game from "./game";
import { ToastContainer } from "react-toastify";
export default function Home() {
  const [userID, setUserID] = useState("");
  const getUsersFromServer = async () => {
    
    try {
      const response = await getUsers();
      console.log(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const getUserIDFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("user_id");
    };

    setUserID(getUserIDFromURL() ?? "");
  }, []);


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* make a game component that takes in a user_id prop get the user id from url*/}
      <Game user_id={userID} />
      <ToastContainer />
    </main>
  );
}
