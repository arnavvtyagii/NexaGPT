import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
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
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setAllThreads(filteredData);
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
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(
        `https://nexagpt.onrender.com/api/thread/${newThreadId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const res = await response.json();
      if (!response.ok) {
        console.log(res.error);
        return;
      }

      if (!Array.isArray(res)) {
        console.log("Invalid response");
        return;
      }

      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.log(err);
    }
  };
  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `https://nexagpt.onrender.com/api/thread/${threadId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const res = await response.json();
      console.log(res);

      //updated threads re-render
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId != threadId),
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <section className="sidebar">
        <button onClick={createNewChat}>
          <img
            src="src/assets/blacklogo.png"
            alt="gpt logo"
            className="logo"
          ></img>
          <span>
            <i className="fa-solid fa-pen-to-square"></i>
          </span>
        </button>

        <ul className="history">
          {allThreads?.map((thread, idx) => (
            <li
              key={idx}
              onClick={(e) => changeThread(thread.threadId)}
              className={thread.threadId === currThreadId ? "highlighted" : ""}
            >
              {thread.title}
              <i
                className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
              ></i>
            </li>
          ))}
        </ul>

        <div className="sign">
          <p>By Arnav Tyagi &hearts;</p>
        </div>
      </section>
    </>
  );
}

export default Sidebar;
