import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="background-gradient h-screen flex flex-col justify-center items-center text-center">
      <div className="home-container">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: '220px',
            height: '220px',
            marginBottom: '30px',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
          }}
        />

        <h1 className="text-5xl font-bold text-pink-600 mb-2">minibooth</h1>
        <p className="text-xl text-gray-600 mb-6" style={{ fontStyle: 'italic' }}>
          by printis photobooth
        </p>

        <p className="text-lg text-gray-700 mb-6" style={{ maxWidth: '500px', margin: '0 auto 30px' }}>
          Selamat datang di MiniBooth by Printis Photobooth📸<br />
          Gaya dikit, cekrek, jadi deh!
        </p>

        <button
          onClick={() => navigate("/welcome")}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
          style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            padding: '15px 40px',
            borderRadius: '30px',
            boxShadow: '0 4px 12px rgba(255, 105, 180, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          🎊 MULAI PHOTOBOOTH 🎊
        </button>

        <footer className="mt-8 text-sm text-gray-600">
          <br />
          <span style={{ fontSize: '0.75rem', color: '#999', marginTop: '5px', display: 'inline-block' }}>
            modified from picapica
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
