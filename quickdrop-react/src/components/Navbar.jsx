export default function Navbar({ user, onLogout }) {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <div>
          <h1> QuickDrop</h1>
          <p className="tagline">
            Logged in as <strong>{user.name}</strong> · {user.role === 'courier' ? 'Courier' : 'Customer'}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}