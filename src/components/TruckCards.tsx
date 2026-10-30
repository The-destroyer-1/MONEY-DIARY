"use client";

import React from "react";
import "./TruckCards.css";

interface Truck {
  id: string;
  title: string;
  image: string;
  location: string;
  customerOrder: string;
  companyName: string;
}

const trucks: Truck[] = [];

const TruckCards = () => {
  return (
    <div className="truck-container">
      {trucks.map((truck) => (
        <div className="truck-card" key={truck.id}>
          <div className="truck-card-header">
            <h3>{truck.title}</h3>
            <span>{truck.id}</span>
          </div>

          <img src={truck.image} alt={truck.title} className="truck-image" />

          <div className="truck-info">
            <div>
              <p className="truck-label">Location</p>
              <p className="truck-value">{truck.location}</p>
            </div>

            <div>
              <p className="truck-label">Customer Order</p>
              <p className="truck-value">{truck.customerOrder}</p>
            </div>
          </div>

          <div className="truck-company">
            <p className="truck-label">Company Name</p>
            <p className="truck-value">{truck.companyName}</p>
          </div>

          <button className="truck-edit-btn">Edit to Change Info</button>
        </div>
      ))}
    </div>
  );
};

export default TruckCards;
