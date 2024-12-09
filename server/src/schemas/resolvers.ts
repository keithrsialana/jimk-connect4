import { User } from "../models/index.js";
import { signToken, AuthenticationError } from "../utils/auth.js";
import bcrypt from "bcrypt";

// Define types for the arguments
interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
    games_played?: number; // Optional field
    games_won?: number; // Optional field
    games_lost?: number; // Optional field
  };
}

interface UpdateUserArgs {
  input: {
    username?: string;
    email?: string;
    password?: string;
    games_played?: number; // Optional field
    games_won?: number; // Optional field
    games_lost?: number; // Optional field
  };
}

interface LoginUserArgs {
  email: string;
  password: string;
}

interface UserArgs {
  username: string;
}

interface DeleteUserArgs {
  userId: string; // The ID of the user to delete
}

const resolvers = {
  Query: {
    users: async () => {
      return User.find();
    },
    user: async (_parent: any, { username }: UserArgs) => {
      return User.findOne({ username });
    },
    // Query to get the authenticated user's information
    // The 'me' query relies on the context to check if the user is authenticated
    me: async (_parent: any, _args: any, context: any) => {
      // If the user is authenticated, find and return the user's information along with their thoughts
      if (context.user) {
        try {
          return await User.findOne({ _id: context.user._id });
        } catch (error) {
          console.error("Error fetching User:", error);
          throw new Error("Failed to fetch user data...");
        }
      }
      // If the user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError("Could not authenticate user.");
    },
  },
  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      // Create a new user with the provided username, email, and password and optional parameters...
      const user = await User.create({ ...input });

      // Sign a token with the user's information
      const token = signToken(user.username, user.email, user._id);

      // Return the token and the user
      return { token, user };
    },

    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      // Find a user with the provided email
      const user = await User.findOne({ email });

      // If no user is found, throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError("Could not authenticate user.");
      }

      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, throw an AuthenticationError
      if (!correctPw) {
        throw new AuthenticationError("Could not authenticate user.");
      }

      // Sign a token with the user's information
      const token = signToken(user.username, user.email, user._id);

      // Return the token and the user
      return { token, user };
    },

    updateUser: async (
      _parent: any,
      { input }: UpdateUserArgs,
      context: any
    ) => {
      if (context.user) {
        const updates: any = {};

        // Only add fields to updates if they are provided
        if (input.username) updates.username = input.username;
        if (input.email) updates.email = input.email;

        // Check if the password is being updated
        if (
          input.password &&
          typeof input.password === "string" &&
          input.password.trim() !== ""
        ) {
          const saltRounds = 10;
          updates.password = await bcrypt.hash(input.password, saltRounds);
        }

        if(input.games_played)  updates.games_played = input.games_played;
        if(input.games_won)  updates.games_won = input.games_won;
        if(input.games_lost)  updates.games_lost = input.games_lost;

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $set: updates }, // Only set the provided fields
          { new: true }
        );
        // Check if the user was found and updated
        if (!updatedUser) {
          throw new Error("User not found or could not be updated.");
        }

        // Sign a new token with the updated user information
        const token = signToken(
          updatedUser.username,
          updatedUser.email,
          updatedUser._id
        );

        console.log(JSON.stringify(updatedUser));

        // Return the updated user and the new token
        return { token, updatedUser };
      }
      throw new AuthenticationError("Could not authenticate user.");
    },
    
    deleteUser: async (_parent: any, { userId }: DeleteUserArgs, context: any) => {
      if (context.user) {
        const deletedUser = await User.findOneAndDelete({ _id: userId });
        if (!deletedUser) {
          throw new Error("User not found or could not be deleted.");
        }
        return deletedUser; // Return the deleted user information
      }
      throw new AuthenticationError("Could not authenticate user.");
    },

  },
};

export default resolvers;
