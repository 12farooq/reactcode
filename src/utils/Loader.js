import Loader from "react-loader-spinner";
import "./Loader.css";

const PageLoader = () => {
  return (
    <div id="loader-container">
      <Loader
        type="Oval"
        color="#fe7e25"
        loading={"true"}
        height={50}
        width={50}
      />
    </div>
  );
};

export default PageLoader;
