import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch("https://nexagpt.onrender.com/api/thread", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const res = await response.json();

      setAllThreads(
        res.map((t) => ({
          threadId: t.threadId,
          title: t.title,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setSidebarOpen(false);
  };

  const changeThread = async (id) => {
    setCurrThreadId(id);

    try {
      const response = await fetch(
        `https://nexagpt.onrender.com/api/thread/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const res = await response.json();

      setPrevChats(res);
      setNewChat(false);
      setReply(null);
      setSidebarOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (id) => {
    await fetch(`https://nexagpt.onrender.com/api/thread/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setAllThreads((prev) => prev.filter((t) => t.threadId !== id));

    if (id === currThreadId) createNewChat();
  };

  return (
    <section className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <button onClick={createNewChat}>New Chat</button>

      <ul className="history">
        {allThreads?.map((t) => (
          <li key={t.threadId} onClick={() => changeThread(t.threadId)}>
            {t.title}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(t.threadId);
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Sidebar;
