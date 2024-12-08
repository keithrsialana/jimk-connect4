import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/LoginContext";

const Home = () => {

  const userContext: any = useContext(UserContext);
  const { loginToken } = userContext;
  const navigate = useNavigate();
  
  // if user isn't logged in, forcefully push user to login page
  useEffect(() => {
    if (!loginToken.username)
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
