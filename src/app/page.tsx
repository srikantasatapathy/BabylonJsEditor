import Image from "next/image";
import BabylonDemo from "./pages/babylon-demo";
import BabylonEditor from "./components/BabylonEditor";
import { Layout } from "./components/Layout";
import { BabylonScene } from "./components/Scene";
import { Toolbar } from "./components/Toolbar";

export default function Home() {
  return (
    // <div>
    //   <main>
    //     {/* <BabylonDemo/> */}
    //     <BabylonEditor/>
    //   </main>
    // </div>
    <Layout>
      <div className="relative w-full h-full">
        <BabylonScene />
        <Toolbar />
      </div>
    </Layout>
  );
}
