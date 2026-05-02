import { createContext ,useContext,useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import { dummyUserData,dummyChats } from "../assets/assets";
const AppContext = createContext();

export const AppcontextProvider = ({ children }) => {
  


  const navigate = useNavigate();
  const[user,setUser] = useState(null);
   const[chats,setChats] = useState([]);
    const[selectedChat,setSelectedChat] = useState(null);
     const[theme,setTheme] = useState(localStorage.getItem("theme") || "light");

  const fetchUser = async()=>{
     setUser(dummyUserData)
    //setUser()
  }


const fetchUsersChats = async()=>{
  setChats(dummyChats)
  setSelectedChat(dummyChats[0])
}


useEffect(()=>{
  if(user){
    fetchUsersChats();
  }
  else{
    setChats([]);
    setSelectedChat(null);
  }

},[user])



useEffect(()=>{
  if(theme === 'dark'){
    document.documentElement.classList.add('dark');
  }
  else{
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem("theme",theme);
},[theme])





  useEffect(()=>{
    fetchUser();
  },[])


  const value ={
    navigate,user,setUser,chats,setChats,selectedChat,setSelectedChat,theme,fetchUser,setTheme
  }
  return (
    <AppContext.Provider value={value} >    
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext)
export default useAppContext;