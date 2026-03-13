import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
    return (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-150 ">
            <nav className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 px-5 py-3 text-white backdrop-blur-2xl pointer-events-none" style={{ backgroundColor: "#0000003a" }}>
                <a href="/" aria-label="Home" className="relative z-10 flex items-center justify-center rounded-xl px-3 py-1.5 text-white transition-colors hover:bg-white/10 pointer-events-auto">
                    <FontAwesomeIcon icon={faHouse} className="h-5 w-5" />
                </a>
            </nav>
        </div>
    );
}
