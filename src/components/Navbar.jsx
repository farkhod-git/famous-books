import { Link, useLocation } from "react-router-dom";
import { LayoutList, Sun, Moon, LogOut, PlusCircle } from "lucide-react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, isLoggedIn, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="FamousBooks — bosh sahifa">
          <Logo size={28} />
        </Link>

        <div className="navbar-actions">
          <button className="btn-theme" onClick={toggle} title="Mavzuni o'zgartir">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLoggedIn && (
            <>
              {pathname !== "/add-book" && (
                <Link to="/add-book" className="btn-add" title="Post qo'shish">
                  <PlusCircle size={18} />
                  <span>Post qo'shish</span>
                </Link>
              )}

              {pathname !== "/my-posts" && (
                <Link to="/my-posts" className="btn-add ghost" title="Mening postlarim">
                  <LayoutList size={18} />
                  <span>Mening postlarim</span>
                </Link>
              )}

              <Link to="/profile" className="navbar-avatar" title="Profil">
                <Avatar profile={user} size={34} />
              </Link>

              <button className="btn-logout" onClick={logout} title="Chiqish">
                <LogOut size={17} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
