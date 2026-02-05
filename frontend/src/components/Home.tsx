import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <h1>Home component</h1>
      <Link to="/users/login">login</Link>
      <p></p>
      <Link to="/profile">profile</Link>
    </div>
  );
};

export default Home;
