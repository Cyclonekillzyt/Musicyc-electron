import sas from "../assets/sasa.png";

const Thumb = ({ pic }) => {
  return <img src={ pic ||sas} className="w-full h-full object-cover rounded-lg" />;
  
};

export default Thumb;
