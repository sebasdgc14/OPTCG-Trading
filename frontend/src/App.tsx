import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "components/Home";
import Login from "components/login";
import NotFound from "components/NotFound";
import ProtectedPage from "components/Protected";
function App() {
  return (
    <Router>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users/login" element={<Login />} />
            <Route path="/profile" element={<ProtectedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
