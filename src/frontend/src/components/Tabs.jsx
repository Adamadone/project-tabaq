import { NavLink } from "react-router-dom";

export const Tabs = ({ items }) => (
  <div role="tablist" className="tabs tabs-boxed">
    {items.map((item) => (
      <NavLink
        to={item.to}
        role="tab"
        className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
      >
        {item.text}
      </NavLink>
    ))}
  </div>
);
