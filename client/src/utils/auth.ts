import { type JwtPayload, jwtDecode } from 'jwt-decode';

// Extending the JwtPayload interface to include additional data fields specific to the application.
interface ExtendedJwt extends JwtPayload {
  data:{
    username:string,
    email:string,
    id:string
  }
};

class AuthService {
  // This method decodes the JWT token to get the user's profile information.
  getProfile() {
    // jwtDecode is used to decode the JWT token and return its payload.
    return jwtDecode<ExtendedJwt>(this.getToken());
  }

  // This method checks if the user is logged in by verifying the presence and validity of the token.
  loggedIn() {
    const token = this.getToken();
    // Returns true if the token exists and is not expired.
    return !!token && !this.isTokenExpired(token);
  }

  // This method checks if the provided token is expired.
  isTokenExpired(token: string) {
    try {
      // jwtDecode decodes the token to check its expiration date.
      const decoded = jwtDecode<JwtPayload>(token);

      // Returns true if the token has expired, false otherwise.
      if (decoded?.exp && decoded?.exp < Date.now() / 1000) {
        return true;
      }
    } catch (err) {
      // If decoding fails, assume the token is not expired.
      return false;
    }
  }

  // This method retrieves the token from localStorage.
  getToken(): string {
    const loggedUser = localStorage.getItem('id_token') || '';
    // Returns the token stored in localStorage.
    return loggedUser;
  }

  // This method logs in the user by storing the token in localStorage and redirecting to the home page.
  login(idToken: string) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  // This method logs out the user by removing the token from localStorage and redirecting to the home page.
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();
