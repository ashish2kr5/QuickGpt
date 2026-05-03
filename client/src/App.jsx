import React, { useEffect,useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Communities from './pages/Communities'
import useAppContext from './context/AppContext'
import './assets/prism.css'
import { assets } from './assets/assets';
import Loading from './pages/Loading'
import Login from './pages/Login'
import {Toaster} from 'react-hot-toast'


const App = () => {
  // const { theme } = useAppContext();

  // useEffect(() => {
  //   if (theme === 'dark') {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // }, [theme]);


  const {user,loadingUser} = useAppContext()

  const { theme } = useAppContext();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const [isMenuopen, setIsMenuOpen] = useState(false);

  const {pathname} = useLocation()


  if(pathname === '/loading' || loadingUser) return <Loading />

  return (
    <>
    <Toaster />

    {!isMenuopen && <img src={assets.menu_icon} alt="" className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert' onClick={()=>setIsMenuOpen(true)} />
    }

    {user ? (
        <div className='dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white'>

       <div className='flex h-screen w-screen'>
      <Sidebar isMenuopen={isMenuopen} setIsMenuOpen={setIsMenuOpen}/>
      <Routes>
        <Route path='/' element={<ChatBox />} />

        <Route path='/credits' element={<Credits />} />

        <Route path='/community' element={<Communities />} />
        

      </Routes>
    </div>

    </div>
    ) :(
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-[#1a1a1a] dark:to-black px-4">
  <Login />
</div>
    )}


  
   
    </>
  )
}

export default App