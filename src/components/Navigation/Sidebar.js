import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../App.css';
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>My Calendar</h2>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <NavLink to="/" exact activeClassName="active">Month View</NavLink>
          </li>
          <li>
            <NavLink to="/week" activeClassName="active">Week View</NavLink>
          </li>
          <li>
            <NavLink to="/day" activeClassName="active">Day View</NavLink>
          </li>
          <li>
            <NavLink to="/community" activeClassName="active">Community Events</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
