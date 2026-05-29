 import type { AxiosInstance } from "axios";
import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  analysisCount?: number;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  api: AxiosInstance;

  loadUser: () => Promise<void>;

  login: (
    email: string,
    password: string
  ) => Promise<AuthResponse>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;

  logout: () => void;
}

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const AppContext = createContext<
  AppContextType | undefined
>(undefined);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(
      localStorage.getItem("token")
    );

  const [loading, setLoading] =
    useState(true);

  // axios instance
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: BACKEND_URL,
    });

    instance.interceptors.request.use(
      (config) => {
        const storedToken =
          localStorage.getItem(
            "token"
          );

        if (storedToken) {
          config.headers.Authorization =
            `Bearer ${storedToken}`;
        }

        return config;
      }
    );

    return instance;
  }, []);

  // load user
  const loadUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } =
        await api.get(
          "/api/auth/user"
        );

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      localStorage.removeItem(
        "token"
      );

      setToken(null);

      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  // login
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const res =
        await axios.post(
          `${BACKEND_URL}/api/auth/login`,
          {
            email,
            password,
          }
        );

      if (res.data.success) {
        localStorage.setItem(
          "token",
          res.data.token
        );

        setToken(
          res.data.token
        );

        setUser(
          res.data.user
        );

        return {
          success: true,
        };
      }

      return {
        success: false,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data
            ?.message ||
          "Login failed",
      };
    }
  };

  // register
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const res =
        await axios.post(
          `${BACKEND_URL}/api/auth/register`,
          {
            name,
            email,
            password,
          }
        );

      if (res.data.success) {
        localStorage.setItem(
          "token",
          res.data.token
        );

        setToken(
          res.data.token
        );

        setUser(
          res.data.user
        );

        return {
          success: true,
        };
      }

      return {
        success: false,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data
            ?.message ||
          "Registration failed",
      };
    }
  };

  // logout
  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    setToken(null);

    setUser(null);

    setLoading(false);
  };

  const value: AppContextType = {
    user,
    token,
    loading,
    api,
    loadUser,
    login,
    register,
    logout,
  };

  return (
    <AppContext.Provider
      value={value}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return context;
}


// import type { AxiosInstance } from "axios";
// import axios from "axios";
// import { LogOut } from "lucide-react";
// import { config } from "node:process";
// import {  createContext, useContext, useEffect, useState, type ReactNode } from "react";

// interface User{
//     id:string;
//     name:string;
//     email:string;
//     plan:string;
//     analysisCount?: number;
// }

// interface AppContextType{
//     user:User | null;
//     token:string|null;
//     loading:boolean;
//     api:AxiosInstance;

//     login:(email:string, password:string) => Promise<{
//         success:boolean;
//         message?:string;
//     }>;

//     register:(name:string, email:string, password:string)=> Promise<{
//         success:boolean; message?:string
//     }>;

//     logout:()=>void;
// }

// const BACKEND_URL= import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

// const AppContext = createContext<AppContextType | undefined>(undefined);

// export function AppProvider({children}: {children:ReactNode}){

//     const [user, setUser] = useState<User | null>(null);
//     const [token, setToken] = useState<string | null> (localStorage.getItem("token"));
//     const [loading, setLoading]= useState(true);

//     //axios instance with auth header
//     const api= axios.create({
//         baseURL:BACKEND_URL,
//     })
//     //update axios headers when token 
//     api.interceptors.request.use((config)=>{
//         const token = localStorage.getItem("token")

//         if(token){
//             config.headers.Authorization=`Bearer ${token}`
//         }

//         return config;
//     }) 

//     const loadUser = async () =>{
//         if(!token){
//             setLoading(false)
//             return;
//         }

//         try {
//             const {data} = await api.get('/api/auth/user')
//             if(data.success){
//                 setUser(data.user)
//             }
//         }catch(error){
//             localStorage.removeItem("token");
//             setToken(null)
//             setUser(null)
//         }

//         setLoading(false)
//     }

//     useEffect(()=>{
//         loadUser()
//     },[])

//     ///klogin in appContext.js
//     const login = async (email:string, password:string)=>{
//         try{
//             const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {email, password})
//             if(res.data.success){
//                 setToken(res.data.token)
//                 setUser(res.data.user)
//                 localStorage.setItem("token", res.data.token)
//                 return {
//                     success:true
//                 }
//             }
//         }
//         catch(error:any){
//             return {
//                 success:false, message: error.response?.data?.message || "Login failed"
//             }
//         }
//     }

//     const register = async (name:string, email:string, password:string)=>{
//          try{
//             const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {name, email, password})
//             if(res.data.success){
//                 setToken(res.data.token)
//                 setUser(res.data.user)
//                 localStorage.setItem("token", res.data.token)
//                 return {
//                     success:true
//                 }
//             }
//         }
//         catch(error:any){
//             return {
//                 success:false, message: error.response?.data?.message || "Registration failed"
//             }
//         }
//     }

//     const logout = async()=>{
//         setToken(null)
//         setUser(null)
//         localStorage.removeItem("token")
//     }
//     const value ={user , token, loading, loadUser, api, login, register, logout}

//     return <AppContext.Provider value={value}>
//         {children}
//     </AppContext.Provider>
// }

// export function useApp(){
//     const context = useContext(AppContext)

//     if(!context) throw new Error("useApp must be within AppProvider");
//     return context
// }

