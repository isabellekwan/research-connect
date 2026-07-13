// TODO: Import a Better Logo Image
import "./Logo.css"
import logoImage from "/favicon.svg"

function Logo() {

   function goToHomePage(){ 
    // TODO: implement functionality to go back to home page
    // when the user clicks on the logo
    console.log("User clicked the Logo.")
  }

  return (
   <img src={logoImage} alt="App Logo" onClick={goToHomePage} className="logo"/>
  )
}

export default Logo