import { Component, ComponentProps } from "solid-js";
import { Link } from "solid-app-router";
import { useUserContext, testUser } from "../context/UserContext";

interface NavbarProps extends ComponentProps<any> {
  // add props here
}

const Navbar: Component<NavbarProps> = (props: NavbarProps) => {
  const [{ navigate, animate, path, eraseCookie, socket}, { setNotification, setUser }] = useUserContext();
  const logout = async () => {
    try {
      // await api.get("/logout", { withCredentials: true });
      setUser(testUser);
      setNotification(false, "Logged out!");
      eraseCookie("POSAPI")
      navigate("/login");
      socket().close()
    } catch {
      //
    }
  };

  const helper = () => {
    switch (path()) {
      case "/createorder":
        return animate(true, ".createOrder", navigate, "/");
      case "/createaccount":
        return animate(true, ".create", navigate, "/");
      case "/login":
        return animate(true, ".login", navigate, "/");
      case "/contact":
        return animate(true, ".contact", navigate, "/");
      case "/settings":
        return animate(true, ".setting", navigate, "/");
      case "/orders":
        return animate(true, ".orders", navigate, "/");
      case "/data":
        return animate(true, ".data", navigate, "/");
      default:
        return navigate("/");
    }
  };
  return (
    <div>
      <nav class="navbar nav-stick navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a type="button" onClick={helper} class="navbar-brand">
            POS-APP
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <Link href="/login" class="nav-link">
                  Log in
                </Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link" href="/contact">
                  Contact
                </Link>
              </li>
              <li class="nav-item">
                <a type="button" onClick={logout} class="nav-link">
                  Log out
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
