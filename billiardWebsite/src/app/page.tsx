"use client"
import { getUsers } from "@/actions/actions";
import Game from "./game";
export default function Home() {
  const getUsersFromServer = async () => {
    try {
      const response = await getUsers();
      console.log(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Game></Game>
    </main>
  );
}
