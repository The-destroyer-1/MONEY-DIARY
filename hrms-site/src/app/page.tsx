"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Transport HRMS</p>
          <h1>Company Dashboard</h1>
          <p className="lead">Overview of operations, payroll, attendance, and logistics for your transport company.</p>
        </div>
        <div className="user-panel">
          <div>
            <p className="label">Logged in as</p>
            <p className="user-name">{user?.name || user?.username || "HR Manager"}</p>
          </div>
          <button className="button" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <a href="#" className="nav-item active">Dashboard</a>
        <a href="#" className="nav-item">Employees</a>
        <a href="#" className="nav-item">Fleet</a>
        <a href="#" className="nav-item">Payroll</a>
        <a href="#" className="nav-item">Attendance</a>
      </nav>

      <section className="input-grid">
        <article className="card input-card">
          <h2>Quick Search</h2>
          <div className="form-group">
            <label htmlFor="search">Search drivers or employees</label>
            <input id="search" type="search" placeholder="Search by name, truck, request..." />
          </div>
          <div className="form-group">
            <label htmlFor="filter">Filter by status</label>
            <select id="filter">
              <option>All status</option>
              <option>On duty</option>
              <option>Off duty</option>
              <option>Maintenance</option>
            </select>
          </div>
        </article>

        <article className="card input-card">
          <h2>New Request</h2>
          <div className="form-group">
            <label htmlFor="employee">Employee name</label>
            <input id="employee" type="text" placeholder="e.g. Ahmed Ali" />
          </div>
          <div className="form-group">
            <label htmlFor="request">Request type</label>
            <select id="request">
              <option>Leave request</option>
              <option>Expense approval</option>
              <option>Route change</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="note">Notes</label>
            <textarea id="note" rows={3} placeholder="Add details here..."></textarea>
          </div>
          <button className="button">Create request</button>
        </article>
      </section>

      <section className="stats-grid">
        <article className="card">
          <h2>Active Drivers</h2>
          <p className="metric">128</p>
          <p className="meta">All drivers currently available</p>
        </article>
        <article className="card">
          <h2>Trucks in Service</h2>
          <p className="metric">54</p>
          <p className="meta">Trucks running scheduled routes</p>
        </article>
        <article className="card">
          <h2>Payroll This Month</h2>
          <p className="metric">$87,400</p>
          <p className="meta">Salary and contractor payments</p>
        </article>
        <article className="card">
          <h2>Attendance Rate</h2>
          <p className="metric">96%</p>
          <p className="meta">Driver attendance this week</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card wide">
          <h2>Team Activity</h2>
          <ul>
            <li>12 new hires started this month</li>
            <li>4 safety trainings completed</li>
            <li>2 trucks scheduled for maintenance</li>
          </ul>
        </article>
        <article className="card wide">
          <h2>Pending Requests</h2>
          <ul>
            <li>5 leave approvals</li>
            <li>3 expense claims waiting</li>
            <li>1 route change request</li>
          </ul>
        </article>
      </section>

      <section className="section">
        <h2>Announcements</h2>
        <div className="notice">
          <p>New compliance training is due by the end of the month for all field staff.</p>
        </div>
      </section>
    </main>
  );
}
