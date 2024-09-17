import Header from "../components/Header";
import {Outlet} from "react-router-dom";

const Layout = () => {
  return (
    <main className=" mt-28 lg:mt-40">
      <Header />
      <Outlet className='mt-20'/>
    </main>
  )
}

export default Layout;