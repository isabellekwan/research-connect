import AttendanceHistory from "./components/AttendanceHistory"
import Ratings from "./components/Ratings"
import UserDetail from "./components/UserDetail"

function ProfilePage() {
  return (
    <div>ProfilePage
        <UserDetail/>
        <Ratings/>
        <AttendanceHistory/>
    </div>
  )
}

export default ProfilePage