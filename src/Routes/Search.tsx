import { useLocation } from "react-router-dom";

function Search(){
    const location = useLocation();
    const keyword = new URLSearchParams(location.search).get("keyword");

    //multi search
    
    console.log(keyword);
    return null;
}

export default Search;