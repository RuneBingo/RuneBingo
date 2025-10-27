import NotFound from "../not-found";
import Navbar from "@/common/navbar";


export default function CacthAllNotFoundPage(){
    return (
        <>
            <Navbar mode="site"/>
            <NotFound/>
        </>
    );
}