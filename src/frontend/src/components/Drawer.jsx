export const Drawer = ({ children, content }) => (
  <div className="drawer">
    <input id="drawer" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content">{children}</div>
    <div className="drawer-side">
      <label
        htmlFor="drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <div className="bg-base-100 shadow-xl border-r border-r-neutral text-base-content min-h-full p-4">
        {content}
      </div>
    </div>
  </div>
);

export const DrawerActivator = ({ children, className }) => (
  <label htmlFor="drawer" className={className}>
    {children}
  </label>
);
