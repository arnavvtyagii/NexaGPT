import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { useContext } from "react";
import { MyContext } from "./MyContext";

function App() {
  const { theme } = useContext(MyContext);

  return (
    <div className={`app ${theme}`}>
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default App;
