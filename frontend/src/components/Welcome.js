import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Selamat Datang!</h1>
      <p>
        Kamu punya waktu <strong>5 detik</strong> untuk setiap foto – tanpa pengulangan! <br />
        Photobooth ini akan mengambil <strong>4 foto</strong> berturut-turut, jadi berpose semenarik mungkin dan nikmati!
      </p>
      <p>
        Setelah sesi selesai, <span style={{ color: "pink" }}></span> unduh salinan digitalmu dan bagikan keseruannya!
      </p>
      <button onClick={() => navigate("/photobooth")}>MULAI</button>
    </div>
  );
};

export default Welcome;
