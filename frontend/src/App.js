import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { UserContextProvider } from './components/UserContext';
import CreatePost from './pages/CreatePost';
import Layout from './pages/Layout';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';

function App() {
  return (
    <>
    <UserContextProvider>
         <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create" element={<CreatePost/>} />
              <Route path="/posts/:id" element={<PostPage />} />
              <Route path="/edit/:id" element={<EditPost/>} />
              <Route path="/profile/:id" element={<Profile />} />
           </Route>
         </Routes>
    </UserContextProvider>
      
    </>
  );
}

export default App;
