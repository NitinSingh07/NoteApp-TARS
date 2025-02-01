import React, { useState } from "react";
import Notes from "./Notes";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Add 'export default' to the Homepage component
export default function Homepage() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div>
      <Navbar className="z-10" />

      <div className="min-h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="pl-64">
          <div className="container mx-auto p-6">
            <Notes showFavoritesOnly={activeTab === "favorites"} />
          </div>
        </div>
      </div>
    </div>
  );
}
