import "./Header.css"
import Logo from "./Logo/Logo"
import Navigation from "./Navigation/Navigation"
import UserMenu from "./UserMenu/UserMenu"

function Header() {
  return (
    <header className='header'>
        <Logo/>
        <Navigation role={"participant"}/>
        <UserMenu/>
    </header>
  )
}

export default Header