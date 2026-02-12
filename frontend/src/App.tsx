import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";
function App() {
  return (
    <Router>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users/login" element={<Login />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
