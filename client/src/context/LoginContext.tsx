import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react";

interface TokenPack {
	token: string;
	username: string;
}

interface UserContextType {
	loginToken: TokenPack;
	setLoginToken: Dispatch<SetStateAction<TokenPack>>;
}

interface UserProviderProps {
	children: ReactNode;
}

export const UserContext = createContext<UserContextType | undefined>(
	undefined
);
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [loginToken, setLoginToken] = useState<TokenPack>({} as TokenPack);

	return (
		<UserContext.Provider value={{ loginToken, setLoginToken }}>
			{children}
		</UserContext.Provider>
	);
};

export default UserContext;
