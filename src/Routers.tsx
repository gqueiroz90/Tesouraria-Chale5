import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Lancamentos from './Pages/Lancamentos/Lancamentos';

function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/lancamentos" element={<Lancamentos />} />
    </Routes>
  );
}

export default Routers;
