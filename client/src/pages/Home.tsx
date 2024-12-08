import { useEffect } from "react";
import Auth from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  
  // if user isn't logged in, forcefully push user to login page
  useEffect(() => {
    if (!Auth.loggedIn())
      navigate('/login');
  }, []);

  return (
    <main>
      <div className="flex-row justify-center">
        <div
          className="col-12 col-md-10 mb-3 p-3"
          style={{ border: '1px dotted #1a1a1a' }}
        >
          <></>
        </div>
        <div className="col-12 col-md-8 mb-3">
          <></>
        </div>
      </div>
    </main>
  );
};

export default Home;
