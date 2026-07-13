import { useEffect, useRef, useState } from "react";
// import { useNavigate } from 'react-router-dom'
import "./UserMenu.css";

function UserMenu() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null)
  const testUser = "Test User"
  // const navigate = useNavigate()

  useEffect(()=>{
    function handleClickEventOutside(event: MouseEvent){
      if(
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ){
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown",handleClickEventOutside)

    return () =>{
      document.removeEventListener("mousedown", handleClickEventOutside)
    }
  },[])

  function handleMyProfileClick(){
    //TODO: Navigate to profile page for the user
    setIsUserMenuOpen(false)
    // navigate("/profile")
  }

  function handleLogOutClick(){
    // TODO: Handle Log out Functionality for the user
    setIsUserMenuOpen(false)

  }

  function getUserInitials(name:string){
    const list = name.split(" ")
    var ans = ""
    for(const item of list ){
      ans += item.charAt(0).toUpperCase()
    }
    return ans
  }

  return (
    <div className="userMenu" ref={menuRef}>
      <button
        type="button" 
        className="user-initials" 
        onClick={()=>setIsUserMenuOpen((current) => !current)}>
        {getUserInitials(testUser)}
      </button>
      {isUserMenuOpen && (
        <div className="user-popup">
          <div className="user-popup-details">
            <p >Hi! <span className="user-popup-name">{testUser}</span></p>
            <hr/>  
          </div>

          <button
            type="button"
            className="user-popup-profilebtn"
            onClick={handleMyProfileClick}>
            My Profile
          </button>
          
          <button
            type="button"
            className="user-popup-logoutbtn"
            onClick={handleLogOutClick}>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu