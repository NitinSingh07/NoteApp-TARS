import React, { useState } from "react";
import Notes from "./Notes";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Add 'export default' to the Homepage component
export default function Homepage() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="pl-64 pt-16"> {/* Adjusted padding-top */}
        <div className="p-6">
          <Notes showFavoritesOnly={activeTab === "favorites"} />
        </div>
      </div>
    </div>
  );
}
