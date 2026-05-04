// import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import useAppContext from '../context/AppContext'

// const Loading = () => {

//   const navigate = useNavigate()
//   const {fetchUser} = useAppContext()

//   useEffect(()=>{
//     const checkPaymentStatus = async () => {
//       try {
//         // Wait a bit for webhook to process
//         await new Promise(resolve => setTimeout(resolve, 3000))
        
//         // Fetch updated user data with fresh credits using context function
//         await fetchUser()
        
//         // Redirect after a short delay
//         setTimeout(() => {
//           navigate('/')
//         }, 1000)
//       } catch(error) {
//         console.error("Error checking payment status:", error)
//         // Still redirect even if check fails
//         setTimeout(() => {
//           navigate('/')
//         }, 3000)
//       }
//     }

//     checkPaymentStatus()
//   },[])


//   return (
//     <div className='bg-gradient-to-b from-[#531B81] to-[#29184B] backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-white text-2xl'>
//       <div className='w-10 h-10 rounded-full border-3 border-white border-t-transparent animate-spin'>

//         </div>

//     </div>
//   )
// }

// export default Loading




import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppContext from '../context/AppContext'

const Loading = () => {

  const navigate = useNavigate()
  const { fetchUser, token } = useAppContext()

  useEffect(() => {

    if (!token) return;

    let interval;

    const startChecking = () => {

      interval = setInterval(async () => {

        const updatedUser = await fetchUser();

        console.log("🔥 Updated Credits:", updatedUser?.credits);

        if (updatedUser) {
          clearInterval(interval);
          navigate('/');
        }

      }, 2000);

    };

    startChecking();

    return () => clearInterval(interval);

  }, [token]);

  return (
    <div className='bg-gradient-to-b from-[#531B81] to-[#29184B] flex items-center justify-center h-screen w-screen text-white text-2xl'>
      
      <div className='flex flex-col items-center gap-4'>
        <div className='w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin'></div>
        
        <p>Loading...</p>
      </div>

    </div>
  )
}

export default Loading