import React from "react";
import "./App.css";
import ChatBody from "./components/chatBody/ChatBody";
import Sessions from "./components/sessions/Sessions";

const App: React.FC = () => {
    return (
        <div className="app">
            {/* <Sessions /> */}
            <div className="main-content">
                <header className="app-header">
                    <h3>MakeLemonade</h3>
                </header>
                <ChatBody />
            </div>
        </div>
    );
};

export default App;
