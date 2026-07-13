import type { NavigationConfig, NavLink } from "../../../types/navigation";
import type { UserRole } from "../../../types/UserRole";
import "./Navigation.css";

type NavProps = {
    role: UserRole;
};

const participantLinks: NavLink[] = [
    {label:"Explore Studies", path:"/studies"},
    {label:"My Applications", path:"/applications"},
]

const researcherLinks: NavLink[] = [
    {label:"My Studies", path:"/researcher/studies"},
    {label:"Create Study", path:"/studies/new"},
]

const navLinks : NavigationConfig = {
        participant: participantLinks,
        researcher:researcherLinks,
    };

function Navigation({role}:NavProps) {
    const links = navLinks[role];
  return (
    <nav className="navigation">
        {links.map((link) => (
            <a href={link.path} key={link.path}>
                {link.label}
            </a>
        ))}
    </nav>
  )
}

export default Navigation
