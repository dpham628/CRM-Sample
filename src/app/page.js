"use client"

import Earnings from "@/components/Earnings";
import Calls from "@/components/TodaysLogs";
import SearchBar from "@/components/Searchbar";
import { useEffect } from "react";
import { useCall } from "@/context/global-context";

const HomePage = () => {

  const {calls, setCalls} = useCall();
 
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/call-history');
        if (!res.ok) return;
        const data = await res.json();
        setCalls(data.interactions);
        } catch(err) {
        console.error('failed to fetch call logs', err);
      } 
    }
    fetchLogs();
  }, []);
  return (
    <div className="md:flex md:h-screen md:w-screen md:overflow-hidden">
      <div className="flex-1 flex flex-col md:overflow-y-auto px-4 py-4 md:px-8 md:py-6 bg-gray-50">
        <div className="w-full max-w-[500px] mb-6 ml-0">
          <SearchBar />
        </div>
        <main className="flex flex-col space-y-8 ml-0 w-full md:w-[800px]">
          <Earnings />
          <Calls />  
        </main>
      </div>
    </div>
  );
}

export default HomePage;