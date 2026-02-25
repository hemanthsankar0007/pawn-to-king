import Header from "./Header";
import Footer from "./Footer";
import BackButton from "./BackButton";
import MagneticCursor from "./MagneticCursor";

function Layout({ children, showFooter = false, mainClassName = "" }) {
  return (
    <div className="relative min-h-screen bg-bg text-text">
      <MagneticCursor />
      <Header />
      <BackButton />
      <main className={`site-main ${mainClassName}`.trim()}>{children}</main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}

export default Layout;
