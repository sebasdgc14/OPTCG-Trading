import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <h1>Home component</h1>
      <Link to="/users/new">Create a user</Link>
    </div>
  );
};

export default Home;
