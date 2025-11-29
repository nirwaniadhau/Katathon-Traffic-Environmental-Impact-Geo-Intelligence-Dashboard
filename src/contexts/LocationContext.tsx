"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type SelectedLocation = {
  name?: string;
  latitude: number;
  longitude: number;
};

export type LocationContextType = {
  selectedLocation: SelectedLocation | null;
  setSelectedLocation: (loc: SelectedLocation | null) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextType {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
}