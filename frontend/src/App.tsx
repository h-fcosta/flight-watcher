import { useState } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Routes from "./components/Routes";
import Offers from "./components/Offers";
import Alerts from "./components/Alerts";
import RouteDetails from "./components/RouteDetails";
import "./App.css";

type ActivePage =
  | "dashboard"
  | "routes"
  | "offers"
  | "alerts"
  | "route-details";

function App() {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const handleRouteSelect = (routeId: number) => {
    setSelectedRouteId(routeId);
    setActivePage("route-details");
  };

  const handleBackToRoutes = () => {
    setSelectedRouteId(null);
    setActivePage("routes");
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onRouteSelect={handleRouteSelect} />;
      case "routes":
        return <Routes onRouteSelect={handleRouteSelect} />;
      case "route-details":
        return selectedRouteId ? (
          <RouteDetails routeId={selectedRouteId} onBack={handleBackToRoutes} />
        ) : (
          <Routes onRouteSelect={handleRouteSelect} />
        );
      case "offers":
        return <Offers />;
      case "alerts":
        return <Alerts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={activePage} onPageChange={setActivePage} />
      <main>{renderActivePage()}</main>
    </div>
  );
}

export default App;
