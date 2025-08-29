import { Plane, Search, Route as RouteIcon, Tags, Home } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: "dashboard" | "routes" | "offers" | "alerts") => void;
}

const navigationItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: Home },
  { id: "routes" as const, label: "Rotas", icon: RouteIcon },
  { id: "offers" as const, label: "Ofertas", icon: Search },
  { id: "alerts" as const, label: "Alertas", icon: Tags }
];

export default function Navigation({
  currentPage,
  onPageChange
}: NavigationProps) {
  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Plane className="h-6 w-6" />
            <span className="text-xl font-bold">Flight Watcher</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "text-primary-foreground hover:text-primary-foreground",
                    currentPage === item.id && "bg-primary-foreground/20"
                  )}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start text-primary-foreground hover:text-primary-foreground",
                    currentPage === item.id && "bg-primary-foreground/20"
                  )}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
